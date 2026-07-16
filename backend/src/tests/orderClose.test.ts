import crypto from "crypto";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Order Close API", () => {
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
        price_in_cents = 1000
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

    const createTestPayment = async (
        orderId: string,
        amountInCents: number,
        paymentStatus = "completed"
    ) => {
        const response = await request(app)
            .post("/payments")
            .send({
                order_id: orderId,
                amount_in_cents: amountInCents,
                payment_method: "card",
                payment_status: paymentStatus
            });

        return response.body.payment;
    };

    const createOrderWithItemTotal = async (itemTotalInCents: number) => {
        const order = await createTestOrder();
        const item = await createTestItem("Test Item", itemTotalInCents);

        await createTestOrderItem(
            order.id,
            item.id,
            1,
            item.price_in_cents
        );

        return order;
    };

    describe("PATCH /orders/:id/close", () => {
        it("should close a fully paid order", async () => {
            const order = await createOrderWithItemTotal(1000);

            await createTestPayment(order.id, 1000);

            const response = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(response.status).toBe(200);
            expect(response.body.order).toBeDefined();
            expect(response.body.order.id).toBe(order.id);
            expect(response.body.order.order_status).toBe("paid");
            expect(response.body.order.closed_at).toBeDefined();
        });

        it("should close an overpaid order", async () => {
            const order = await createOrderWithItemTotal(1000);

            await createTestPayment(order.id, 1200);

            const response = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(response.status).toBe(200);
            expect(response.body.order).toBeDefined();
            expect(response.body.order.id).toBe(order.id);
            expect(response.body.order.order_status).toBe("paid");
            expect(response.body.order.closed_at).toBeDefined();
        });

        it("should close a fully paid order with modifiers", async () => {
            const order = await createTestOrder();
            const item = await createTestItem("Test Item", 1000);
            const modifier = await createTestModifier("Extra Modifier", 250);

            const orderItem = await createTestOrderItem(
                order.id,
                item.id,
                1,
                item.price_in_cents
            );

            await attachModifierToOrderItem(orderItem.id, modifier.id, 2);

            // Item total: 1000
            // Modifier total: 250 * 2 = 500
            // Subtotal: 1500
            await createTestPayment(order.id, 1500);

            const response = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(response.status).toBe(200);
            expect(response.body.order).toBeDefined();
            expect(response.body.order.id).toBe(order.id);
            expect(response.body.order.order_status).toBe("paid");
            expect(response.body.order.closed_at).toBeDefined();
        });

        it("should return 400 if order has remaining balance", async () => {
            const order = await createOrderWithItemTotal(1000);

            await createTestPayment(order.id, 700);

            const response = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order has no payments and positive balance", async () => {
            const order = await createOrderWithItemTotal(1000);

            const response = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should ignore pending payments when closing order", async () => {
            const order = await createOrderWithItemTotal(1000);

            await createTestPayment(order.id, 1000, "pending");

            const response = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order id is not a valid UUID", async () => {
            const response = await request(app)
                .patch("/orders/not-a-valid-id/close");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order does not exist", async () => {
            const fakeOrderId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/orders/${fakeOrderId}/close`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should keep the order closed after it is closed once", async () => {
            const order = await createOrderWithItemTotal(1000);

            await createTestPayment(order.id, 1000);

            const firstResponse = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(firstResponse.status).toBe(200);
            expect(firstResponse.body.order.order_status).toBe("paid");
            expect(firstResponse.body.order.closed_at).toBeDefined();

            const secondResponse = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(secondResponse.status).toBe(200);
            expect(secondResponse.body.order.order_status).toBe("paid");
            expect(secondResponse.body.order.closed_at).toBeDefined();
        });
    });
});