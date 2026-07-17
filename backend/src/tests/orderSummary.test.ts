import crypto from "crypto";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Order Summary API", () => {
    beforeEach(async () => {
        await sql`DELETE FROM order_item_modifiers`;
        await sql`DELETE FROM payments`;
        await sql`DELETE FROM order_items`;
        await sql`DELETE FROM orders`;
        await sql`DELETE FROM users`;
        await sql`DELETE FROM items`;
        await sql`DELETE FROM modifiers`;
        await sql`DELETE FROM categories`;
        await sql`DELETE FROM tables`;
    });

    const createTestCategory = async () => {
        const response = await request(app)
            .post("/categories")
            .send({
                name: `Category ${crypto.randomUUID()}`
            });

        return response.body.category;
    };

    const createTestItem = async (
        name = `Item ${crypto.randomUUID()}`,
        price_in_cents = 500
    ) => {
        const category = await createTestCategory();

        const response = await request(app)
            .post("/items")
            .send({
                name,
                description: "Test item",
                price_in_cents,
                category_id: category.id
            });

        return response.body.item;
    };

    const createTestModifier = async (
        name = `Modifier ${crypto.randomUUID()}`,
        price_in_cents = 100
    ) => {
        const response = await request(app)
            .post("/modifiers")
            .send({
                name,
                price_in_cents
            });

        return response.body.modifier;
    };

    const createTestOrder = async () => {
        const response = await request(app)
            .post("/orders")
            .send({
                order_type: "takeout",
                order_status: "open",
                ticket_name: "Test Ticket",
                guest_count: 1
            });

        return response.body.order;
    };

    const createTestOrderItem = async (
        orderId: string,
        itemId: string,
        quantity: number,
        unitPriceInCents: number
    ) => {
        const response = await request(app)
            .post("/order-items")
            .send({
                order_id: orderId,
                item_id: itemId,
                quantity,
                unit_price_in_cents: unitPriceInCents,
                notes: null,
                order_item_status: "pending"
            });

        return response.body.orderItem;
    };

    const attachModifierToOrderItem = async (
        orderItemId: string,
        modifierId: string,
        quantity: number
    ) => {
        const response = await request(app)
            .post("/order-item-modifiers")
            .send({
                order_item_id: orderItemId,
                modifier_id: modifierId,
                quantity
            });

        return response.body.orderItemModifier;
    };

    const createTestCashier = async () => {
        const result = await sql`
            INSERT INTO users (
                first_name,
                middle_name,
                last_name,
                user_role,
                passcode_hash,
                is_active
            )
            VALUES (
                ${"Test"},
                ${null},
                ${"Cashier"},
                ${"cashier"}::user_role_enum,
                ${"1234"},
                ${true}
            )
            RETURNING id
        `;

        return result[0];
    };

    const createTestPayment = async (
        orderId: string,
        amountInCents: number,
        paymentStatus = "completed"
    ) => {
        const cashier = await createTestCashier();

        const response = await request(app)
            .post("/payments")
            .set("x-user-id", cashier.id)
            .send({
                order_id: orderId,
                amount_in_cents: amountInCents,
                payment_method: "card",
                payment_status: paymentStatus
            });

        return response.body.payment;
    };

    describe("GET /orders/:id/summary", () => {
        it("should return order summary with items, modifiers, payments, and totals", async () => {
            const order = await createTestOrder();

            const taco = await createTestItem("Test Taco", 500);
            const burrito = await createTestItem("Test Burrito", 800);

            const extraCheese = await createTestModifier("Extra Cheese", 100);
            const extraSalsa = await createTestModifier("Extra Salsa", 50);

            const tacoOrderItem = await createTestOrderItem(
                order.id,
                taco.id,
                2,
                taco.price_in_cents
            );

            const burritoOrderItem = await createTestOrderItem(
                order.id,
                burrito.id,
                1,
                burrito.price_in_cents
            );

            await attachModifierToOrderItem(tacoOrderItem.id, extraCheese.id, 1);
            await attachModifierToOrderItem(tacoOrderItem.id, extraSalsa.id, 2);

            await createTestPayment(order.id, 700);

            const response = await request(app)
                .get(`/orders/${order.id}/summary`);

            expect(response.status).toBe(200);

            expect(response.body.order).toBeDefined();
            expect(response.body.order.id).toBe(order.id);
            expect(response.body.order.order_type).toBe("takeout");
            expect(response.body.order.order_status).toBe("open");
            expect(response.body.order.ticket_name).toBe("Test Ticket");

            expect(response.body.items).toBeDefined();
            expect(Array.isArray(response.body.items)).toBe(true);
            expect(response.body.items.length).toBe(2);

            const tacoSummary = response.body.items.find(
                (item: { order_item_id: string }) => item.order_item_id === tacoOrderItem.id
            );

            const burritoSummary = response.body.items.find(
                (item: { order_item_id: string }) => item.order_item_id === burritoOrderItem.id
            );

            expect(tacoSummary).toBeDefined();
            expect(tacoSummary.item_name).toBe("Test Taco");
            expect(tacoSummary.quantity).toBe(2);
            expect(tacoSummary.unit_price_in_cents).toBe(500);
            expect(tacoSummary.line_total_in_cents).toBe(1000);

            expect(tacoSummary.modifiers).toBeDefined();
            expect(Array.isArray(tacoSummary.modifiers)).toBe(true);
            expect(tacoSummary.modifiers.length).toBe(2);

            const cheeseSummary = tacoSummary.modifiers.find(
                (modifier: { modifier_name: string }) => modifier.modifier_name === "Extra Cheese"
            );

            const salsaSummary = tacoSummary.modifiers.find(
                (modifier: { modifier_name: string }) => modifier.modifier_name === "Extra Salsa"
            );

            expect(cheeseSummary).toBeDefined();
            expect(cheeseSummary.quantity).toBe(1);
            expect(cheeseSummary.price_in_cents).toBe(100);
            expect(cheeseSummary.line_total_in_cents).toBe(100);

            expect(salsaSummary).toBeDefined();
            expect(salsaSummary.quantity).toBe(2);
            expect(salsaSummary.price_in_cents).toBe(50);
            expect(salsaSummary.line_total_in_cents).toBe(100);

            expect(burritoSummary).toBeDefined();
            expect(burritoSummary.item_name).toBe("Test Burrito");
            expect(burritoSummary.quantity).toBe(1);
            expect(burritoSummary.unit_price_in_cents).toBe(800);
            expect(burritoSummary.line_total_in_cents).toBe(800);
            expect(burritoSummary.modifiers).toEqual([]);

            expect(response.body.totals).toBeDefined();
            expect(response.body.totals.items_total_in_cents).toBe(1800);
            expect(response.body.totals.modifiers_total_in_cents).toBe(200);
            expect(response.body.totals.subtotal_in_cents).toBe(2000);
            expect(response.body.totals.payments_total_in_cents).toBe(700);
            expect(response.body.totals.balance_due_in_cents).toBe(1300);
        });

        it("should return summary with zero payments", async () => {
            const order = await createTestOrder();
            const item = await createTestItem("Test Item", 1000);

            await createTestOrderItem(order.id, item.id, 1, item.price_in_cents);

            const response = await request(app)
                .get(`/orders/${order.id}/summary`);

            expect(response.status).toBe(200);
            expect(response.body.totals.items_total_in_cents).toBe(1000);
            expect(response.body.totals.modifiers_total_in_cents).toBe(0);
            expect(response.body.totals.subtotal_in_cents).toBe(1000);
            expect(response.body.totals.payments_total_in_cents).toBe(0);
            expect(response.body.totals.balance_due_in_cents).toBe(1000);
        });

        it("should return summary with no modifiers", async () => {
            const order = await createTestOrder();
            const item = await createTestItem("Test Item", 1200);

            const orderItem = await createTestOrderItem(
                order.id,
                item.id,
                2,
                item.price_in_cents
            );

            await createTestPayment(order.id, 1000);

            const response = await request(app)
                .get(`/orders/${order.id}/summary`);

            expect(response.status).toBe(200);
            expect(response.body.items.length).toBe(1);
            expect(response.body.items[0].order_item_id).toBe(orderItem.id);
            expect(response.body.items[0].modifiers).toEqual([]);

            expect(response.body.totals.items_total_in_cents).toBe(2400);
            expect(response.body.totals.modifiers_total_in_cents).toBe(0);
            expect(response.body.totals.subtotal_in_cents).toBe(2400);
            expect(response.body.totals.payments_total_in_cents).toBe(1000);
            expect(response.body.totals.balance_due_in_cents).toBe(1400);
        });

        it("should return summary with no items", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .get(`/orders/${order.id}/summary`);

            expect(response.status).toBe(200);
            expect(response.body.order.id).toBe(order.id);
            expect(response.body.items).toEqual([]);
            expect(response.body.totals.items_total_in_cents).toBe(0);
            expect(response.body.totals.modifiers_total_in_cents).toBe(0);
            expect(response.body.totals.subtotal_in_cents).toBe(0);
            expect(response.body.totals.payments_total_in_cents).toBe(0);
            expect(response.body.totals.balance_due_in_cents).toBe(0);
        });

        it("should only count completed payments toward payments total", async () => {
            const order = await createTestOrder();
            const item = await createTestItem("Test Item", 1000);

            await createTestOrderItem(order.id, item.id, 1, item.price_in_cents);

            await createTestPayment(order.id, 300, "completed");
            await createTestPayment(order.id, 200, "pending");
            await createTestPayment(order.id, 100, "failed");

            const response = await request(app)
                .get(`/orders/${order.id}/summary`);

            expect(response.status).toBe(200);
            expect(response.body.totals.subtotal_in_cents).toBe(1000);
            expect(response.body.totals.payments_total_in_cents).toBe(300);
            expect(response.body.totals.balance_due_in_cents).toBe(700);
        });

        it("should return 400 if order id is not a valid UUID", async () => {
            const response = await request(app)
                .get("/orders/not-a-valid-id/summary");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order does not exist", async () => {
            const fakeOrderId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .get(`/orders/${fakeOrderId}/summary`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});