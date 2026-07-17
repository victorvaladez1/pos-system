import crypto from "crypto";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Kitchen Orders API", () => {
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
        priceInCents = 1000
    ) => {
        const category = await createTestCategory();

        const response = await request(app)
            .post("/items")
            .send({
                name,
                description: "Test item",
                price_in_cents: priceInCents,
                category_id: category.id
            });

        return response.body.item;
    };

    const createTestModifier = async (
        name = `Modifier ${crypto.randomUUID()}`,
        priceInCents = 100
    ) => {
        const response = await request(app)
            .post("/modifiers")
            .send({
                name,
                price_in_cents: priceInCents
            });

        return response.body.modifier;
    };

    const createTestOrder = async (
        ticketName = "Kitchen Test Order",
        orderType = "takeout"
    ) => {
        const response = await request(app)
            .post("/orders")
            .send({
                order_type: orderType,
                order_status: "open",
                ticket_name: ticketName,
                guest_count: 1
            });

        return response.body.order;
    };

    const createTestOrderItem = async (
        orderId: string,
        itemId: string,
        orderItemStatus: string,
        notes: string | null = null,
        quantity = 1,
        unitPriceInCents = 1000
    ) => {
        const response = await request(app)
            .post("/order-items")
            .send({
                order_id: orderId,
                item_id: itemId,
                quantity,
                unit_price_in_cents: unitPriceInCents,
                notes,
                order_item_status: orderItemStatus
            });

        return response.body.orderItem;
    };

    const attachModifierToOrderItem = async (
        orderItemId: string,
        modifierId: string,
        quantity = 1
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

    describe("GET /kitchen/orders", () => {
        it("should return submitted order items", async () => {
            const order = await createTestOrder("Submitted Kitchen Order");
            const item = await createTestItem("Burger", 1200);

            const orderItem = await createTestOrderItem(
                order.id,
                item.id,
                "submitted",
                "No onions",
                2,
                item.price_in_cents
            );

            const response = await request(app)
                .get("/kitchen/orders");

            expect(response.status).toBe(200);
            expect(response.body.orders).toBeDefined();
            expect(response.body.orders).toHaveLength(1);

            expect(response.body.orders[0].order_id).toBe(order.id);
            expect(response.body.orders[0].ticket_name).toBe("Submitted Kitchen Order");
            expect(response.body.orders[0].items).toHaveLength(1);

            expect(response.body.orders[0].items[0]).toMatchObject({
                order_item_id: orderItem.id,
                item_name: "Burger",
                quantity: 2,
                notes: "No onions",
                order_item_status: "submitted"
            });
        });

        it("should return ready order items", async () => {
            const order = await createTestOrder("Ready Kitchen Order");
            const item = await createTestItem("Tacos", 900);

            const orderItem = await createTestOrderItem(
                order.id,
                item.id,
                "ready",
                null,
                1,
                item.price_in_cents
            );

            const response = await request(app)
                .get("/kitchen/orders");

            expect(response.status).toBe(200);
            expect(response.body.orders).toHaveLength(1);
            expect(response.body.orders[0].items).toHaveLength(1);
            expect(response.body.orders[0].items[0].order_item_id).toBe(orderItem.id);
            expect(response.body.orders[0].items[0].order_item_status).toBe("ready");
        });

        it("should not return pending order items", async () => {
            const order = await createTestOrder("Pending Kitchen Order");
            const item = await createTestItem("Pending Item", 1000);

            await createTestOrderItem(
                order.id,
                item.id,
                "pending",
                null,
                1,
                item.price_in_cents
            );

            const response = await request(app)
                .get("/kitchen/orders");

            expect(response.status).toBe(200);
            expect(response.body.orders).toEqual([]);
        });

        it("should not return served order items", async () => {
            const order = await createTestOrder("Served Kitchen Order");
            const item = await createTestItem("Served Item", 1000);

            await createTestOrderItem(
                order.id,
                item.id,
                "served",
                null,
                1,
                item.price_in_cents
            );

            const response = await request(app)
                .get("/kitchen/orders");

            expect(response.status).toBe(200);
            expect(response.body.orders).toEqual([]);
        });

        it("should not return voided order items", async () => {
            const order = await createTestOrder("Voided Kitchen Order");
            const item = await createTestItem("Voided Item", 1000);

            await createTestOrderItem(
                order.id,
                item.id,
                "voided",
                null,
                1,
                item.price_in_cents
            );

            const response = await request(app)
                .get("/kitchen/orders");

            expect(response.status).toBe(200);
            expect(response.body.orders).toEqual([]);
        });

        it("should group kitchen items by order", async () => {
            const firstOrder = await createTestOrder("First Kitchen Order");
            const secondOrder = await createTestOrder("Second Kitchen Order");

            const burger = await createTestItem("Burger", 1200);
            const fries = await createTestItem("Fries", 500);
            const tacos = await createTestItem("Tacos", 900);

            await createTestOrderItem(
                firstOrder.id,
                burger.id,
                "submitted",
                null,
                1,
                burger.price_in_cents
            );

            await createTestOrderItem(
                firstOrder.id,
                fries.id,
                "ready",
                null,
                1,
                fries.price_in_cents
            );

            await createTestOrderItem(
                secondOrder.id,
                tacos.id,
                "submitted",
                null,
                1,
                tacos.price_in_cents
            );

            const response = await request(app)
                .get("/kitchen/orders");

            expect(response.status).toBe(200);
            expect(response.body.orders).toHaveLength(2);

            const firstResponseOrder = response.body.orders.find(
                (order: { order_id: string }) => order.order_id === firstOrder.id
            );

            const secondResponseOrder = response.body.orders.find(
                (order: { order_id: string }) => order.order_id === secondOrder.id
            );

            expect(firstResponseOrder.items).toHaveLength(2);
            expect(secondResponseOrder.items).toHaveLength(1);
        });

        it("should include modifiers for kitchen items", async () => {
            const order = await createTestOrder("Modifier Kitchen Order");
            const item = await createTestItem("Burger", 1200);
            const modifier = await createTestModifier("Extra Cheese", 150);

            const orderItem = await createTestOrderItem(
                order.id,
                item.id,
                "submitted",
                "No onions",
                1,
                item.price_in_cents
            );

            const orderItemModifier = await attachModifierToOrderItem(
                orderItem.id,
                modifier.id,
                2
            );

            const response = await request(app)
                .get("/kitchen/orders");

            expect(response.status).toBe(200);
            expect(response.body.orders).toHaveLength(1);
            expect(response.body.orders[0].items).toHaveLength(1);
            expect(response.body.orders[0].items[0].modifiers).toHaveLength(1);

            expect(response.body.orders[0].items[0].modifiers[0]).toMatchObject({
                order_item_modifier_id: orderItemModifier.id,
                modifier_id: modifier.id,
                modifier_name: "Extra Cheese",
                quantity: 2
            });
        });

        it("should return an empty array if there are no kitchen items", async () => {
            const response = await request(app)
                .get("/kitchen/orders");

            expect(response.status).toBe(200);
            expect(response.body.orders).toBeDefined();
            expect(response.body.orders).toEqual([]);
        });

        it("should include expected order fields", async () => {
            const order = await createTestOrder("Field Check Kitchen Order");
            const item = await createTestItem("Burger", 1200);

            await createTestOrderItem(
                order.id,
                item.id,
                "submitted",
                null,
                1,
                item.price_in_cents
            );

            const response = await request(app)
                .get("/kitchen/orders");

            expect(response.status).toBe(200);
            expect(response.body.orders).toHaveLength(1);

            expect(response.body.orders[0]).toMatchObject({
                order_id: order.id,
                ticket_name: "Field Check Kitchen Order",
                order_type: "takeout",
                table_id: null
            });

            expect(response.body.orders[0].opened_at).toBeDefined();
            expect(response.body.orders[0].items).toBeDefined();
        });
    });
});