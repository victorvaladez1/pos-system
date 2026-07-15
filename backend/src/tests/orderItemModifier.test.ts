import crypto from "crypto";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Order Item Modifier API", () => {
    beforeEach(async () => {
        await sql`DELETE FROM order_item_modifiers`;
        await sql`DELETE FROM order_items`;
        await sql`DELETE FROM orders`;
        await sql`DELETE FROM items`;
        await sql`DELETE FROM modifiers`;
        await sql`DELETE FROM categories`;
        await sql`DELETE FROM tables`;
    });

    const createTestCategory = async () => {
        const response = await request(app)
            .post("/categories")
            .send({
                name: `Tacos ${crypto.randomUUID()}`
            });

        return response.body.category;
    };

    const createTestItem = async () => {
        const category = await createTestCategory();

        const response = await request(app)
            .post("/items")
            .send({
                name: `Chicken Taco ${crypto.randomUUID()}`,
                description: "Chicken taco with cilantro and onion",
                price_in_cents: 299,
                category_id: category.id
            });

        return response.body.item;
    };

    const createTestOrder = async () => {
        const response = await request(app)
            .post("/orders")
            .send({
                order_type: "takeout",
                order_status: "open",
                ticket_name: "Victor",
                guest_count: 1
            });

        return response.body.order;
    };

    const createTestOrderItem = async () => {
        const order = await createTestOrder();
        const item = await createTestItem();

        const response = await request(app)
            .post("/order-items")
            .send({
                order_id: order.id,
                item_id: item.id,
                quantity: 2,
                unit_price_in_cents: item.price_in_cents,
                notes: "Extra salsa",
                order_item_status: "pending"
            });

        return response.body.orderItem;
    };

    const createTestModifier = async (
        name = `Extra Cheese ${crypto.randomUUID()}`,
        price_in_cents = 75
    ) => {
        const response = await request(app)
            .post("/modifiers")
            .send({
                name,
                price_in_cents
            });

        return response.body.modifier;
    };

    const createTestOrderItemModifier = async () => {
        const orderItem = await createTestOrderItem();
        const modifier = await createTestModifier();

        const response = await request(app)
            .post("/order-item-modifiers")
            .send({
                order_item_id: orderItem.id,
                modifier_id: modifier.id,
                quantity: 1
            });

        return response.body.orderItemModifier;
    };

    describe("POST /order-item-modifiers", () => {
        it("should attach a modifier to an order item", async () => {
            const orderItem = await createTestOrderItem();
            const modifier = await createTestModifier();

            const response = await request(app)
                .post("/order-item-modifiers")
                .send({
                    order_item_id: orderItem.id,
                    modifier_id: modifier.id,
                    quantity: 1
                });

            expect(response.status).toBe(201);
            expect(response.body.orderItemModifier).toBeDefined();
            expect(response.body.orderItemModifier.id).toBeDefined();
            expect(response.body.orderItemModifier.order_item_id).toBe(orderItem.id);
            expect(response.body.orderItemModifier.modifier_id).toBe(modifier.id);
            expect(response.body.orderItemModifier.quantity).toBe(1);
            expect(response.body.orderItemModifier.created_at).toBeDefined();
            expect(response.body.orderItemModifier.updated_at).toBeDefined();
        });

        it("should attach a modifier with quantity greater than one", async () => {
            const orderItem = await createTestOrderItem();
            const modifier = await createTestModifier();

            const response = await request(app)
                .post("/order-item-modifiers")
                .send({
                    order_item_id: orderItem.id,
                    modifier_id: modifier.id,
                    quantity: 2
                });

            expect(response.status).toBe(201);
            expect(response.body.orderItemModifier).toBeDefined();
            expect(response.body.orderItemModifier.quantity).toBe(2);
        });

        it("should return 400 if order_item_id is missing", async () => {
            const modifier = await createTestModifier();

            const response = await request(app)
                .post("/order-item-modifiers")
                .send({
                    modifier_id: modifier.id,
                    quantity: 1
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_item_id is not a valid UUID", async () => {
            const modifier = await createTestModifier();

            const response = await request(app)
                .post("/order-item-modifiers")
                .send({
                    order_item_id: "not-a-valid-id",
                    modifier_id: modifier.id,
                    quantity: 1
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order_item_id does not exist", async () => {
            const modifier = await createTestModifier();
            const fakeOrderItemId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .post("/order-item-modifiers")
                .send({
                    order_item_id: fakeOrderItemId,
                    modifier_id: modifier.id,
                    quantity: 1
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if modifier_id is missing", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .post("/order-item-modifiers")
                .send({
                    order_item_id: orderItem.id,
                    quantity: 1
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if modifier_id is not a valid UUID", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .post("/order-item-modifiers")
                .send({
                    order_item_id: orderItem.id,
                    modifier_id: "not-a-valid-id",
                    quantity: 1
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if modifier_id does not exist", async () => {
            const orderItem = await createTestOrderItem();
            const fakeModifierId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .post("/order-item-modifiers")
                .send({
                    order_item_id: orderItem.id,
                    modifier_id: fakeModifierId,
                    quantity: 1
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if quantity is missing", async () => {
            const orderItem = await createTestOrderItem();
            const modifier = await createTestModifier();

            const response = await request(app)
                .post("/order-item-modifiers")
                .send({
                    order_item_id: orderItem.id,
                    modifier_id: modifier.id
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if quantity is not positive", async () => {
            const orderItem = await createTestOrderItem();
            const modifier = await createTestModifier();

            const response = await request(app)
                .post("/order-item-modifiers")
                .send({
                    order_item_id: orderItem.id,
                    modifier_id: modifier.id,
                    quantity: 0
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if quantity is not an integer", async () => {
            const orderItem = await createTestOrderItem();
            const modifier = await createTestModifier();

            const response = await request(app)
                .post("/order-item-modifiers")
                .send({
                    order_item_id: orderItem.id,
                    modifier_id: modifier.id,
                    quantity: 1.5
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /order-item-modifiers", () => {
        it("should return all order item modifiers", async () => {
            const firstOrderItemModifier = await createTestOrderItemModifier();

            const secondOrderItem = await createTestOrderItem();
            const secondModifier = await createTestModifier();

            const secondCreateResponse = await request(app)
                .post("/order-item-modifiers")
                .send({
                    order_item_id: secondOrderItem.id,
                    modifier_id: secondModifier.id,
                    quantity: 2
                });

            expect(secondCreateResponse.status).toBe(201);

            const response = await request(app)
                .get("/order-item-modifiers");

            expect(response.status).toBe(200);
            expect(response.body.orderItemModifiers).toBeDefined();
            expect(Array.isArray(response.body.orderItemModifiers)).toBe(true);
            expect(response.body.orderItemModifiers.length).toBe(2);

            const ids = response.body.orderItemModifiers.map(
                (orderItemModifier: { id: string }) => orderItemModifier.id
            );

            expect(ids).toContain(firstOrderItemModifier.id);
            expect(ids).toContain(secondCreateResponse.body.orderItemModifier.id);
        });

        it("should return an empty array if there are no order item modifiers", async () => {
            const response = await request(app)
                .get("/order-item-modifiers");

            expect(response.status).toBe(200);
            expect(response.body.orderItemModifiers).toBeDefined();
            expect(response.body.orderItemModifiers).toEqual([]);
        });
    });

    describe("DELETE /order-item-modifiers/:id", () => {
        it("should delete an order item modifier", async () => {
            const orderItemModifier = await createTestOrderItemModifier();

            const deleteResponse = await request(app)
                .delete(`/order-item-modifiers/${orderItemModifier.id}`);

            expect(deleteResponse.status).toBe(204);

            const getResponse = await request(app)
                .get("/order-item-modifiers");

            expect(getResponse.status).toBe(200);
            expect(getResponse.body.orderItemModifiers).toEqual([]);
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .delete("/order-item-modifiers/not-a-valid-id");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order item modifier does not exist", async () => {
            const fakeOrderItemModifierId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .delete(`/order-item-modifiers/${fakeOrderItemModifierId}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});