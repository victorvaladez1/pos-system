import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql  from "../db.js";

describe("Order Item API", () => {
    beforeEach(async () => {

        await sql`DELETE FROM order_item_modifiers`;
        await sql`DELETE FROM order_items`;
        await sql`DELETE FROM payments`;
        await sql`DELETE FROM orders`;
        await sql`DELETE FROM items`;
        await sql`DELETE FROM categories`;
        await sql`DELETE FROM tables`;
    });

    const createTestCategory = async () => {
        const response = await request(app)
            .post("/categories")
            .send({
                name: "Tacos"
            });

        expect(response.status).toBe(201);
        expect(response.body.category).toBeDefined();

        return response.body.category;
    };

    const createTestItem = async () => {
        const category = await createTestCategory();

        const response = await request(app)
            .post("/items")
            .send({
                name: "Chicken Taco",
                description: "Chicken taco with cilantro and onion",
                price_in_cents: 299,
                category_id: category.id
            });

        expect(response.status).toBe(201);
        expect(response.body.item).toBeDefined();

        return response.body.item;
    };

    const createTestOrder = async () => {
        const response = await request(app)
            .post("/orders")
            .send({
                table_id: null,
                server_id: null,
                order_type: "takeout",
                order_status: "open",
                ticket_name: "Victor",
                guest_count: null
            });

        expect(response.status).toBe(201);
        expect(response.body.order).toBeDefined();

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
                unit_price_in_cents: 299,
                notes: "No onions",
                order_item_status: "pending"
            });

        expect(response.status).toBe(201);
        expect(response.body.orderItem).toBeDefined();

        return response.body.orderItem;
    };

    describe("POST /order-items", () => {
        it("should create an order item", async () => {
            const order = await createTestOrder();
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: item.id,
                    quantity: 2,
                    unit_price_in_cents: 299,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(201);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.id).toBeDefined();
            expect(response.body.orderItem.order_id).toBe(order.id);
            expect(response.body.orderItem.item_id).toBe(item.id);
            expect(response.body.orderItem.quantity).toBe(2);
            expect(response.body.orderItem.unit_price_in_cents).toBe(299);
            expect(response.body.orderItem.notes).toBe("No onions");
            expect(response.body.orderItem.order_item_status).toBe("pending");
            expect(response.body.orderItem.created_at).toBeDefined();
            expect(response.body.orderItem.updated_at).toBeDefined();
        });

        it("should create an order item with null notes", async () => {
            const order = await createTestOrder();
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: item.id,
                    quantity: 1,
                    unit_price_in_cents: 299,
                    notes: null,
                    order_item_status: "pending"
                });

            expect(response.status).toBe(201);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.notes).toBeNull();
        });

        it("should return 400 if order_id is missing", async () => {
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    item_id: item.id,
                    quantity: 2,
                    unit_price_in_cents: 299,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_id is not a valid UUID", async () => {
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: "not-a-valid-id",
                    item_id: item.id,
                    quantity: 2,
                    unit_price_in_cents: 299,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order_id does not exist", async () => {
            const item = await createTestItem();
            const fakeOrderId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: fakeOrderId,
                    item_id: item.id,
                    quantity: 2,
                    unit_price_in_cents: 299,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if item_id is missing", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    quantity: 2,
                    unit_price_in_cents: 299,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if item_id is not a valid UUID", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: "not-a-valid-id",
                    quantity: 2,
                    unit_price_in_cents: 299,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if item_id does not exist", async () => {
            const order = await createTestOrder();
            const fakeItemId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: fakeItemId,
                    quantity: 2,
                    unit_price_in_cents: 299,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if quantity is missing", async () => {
            const order = await createTestOrder();
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: item.id,
                    unit_price_in_cents: 299,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if quantity is not positive", async () => {
            const order = await createTestOrder();
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: item.id,
                    quantity: 0,
                    unit_price_in_cents: 299,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if quantity is not an integer", async () => {
            const order = await createTestOrder();
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: item.id,
                    quantity: 1.5,
                    unit_price_in_cents: 299,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if unit_price_in_cents is missing", async () => {
            const order = await createTestOrder();
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: item.id,
                    quantity: 2,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if unit_price_in_cents is negative", async () => {
            const order = await createTestOrder();
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: item.id,
                    quantity: 2,
                    unit_price_in_cents: -100,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if unit_price_in_cents is not an integer", async () => {
            const order = await createTestOrder();
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: item.id,
                    quantity: 2,
                    unit_price_in_cents: 2.99,
                    notes: "No onions",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if notes is an empty string", async () => {
            const order = await createTestOrder();
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: item.id,
                    quantity: 2,
                    unit_price_in_cents: 299,
                    notes: "",
                    order_item_status: "pending"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_item_status is missing", async () => {
            const order = await createTestOrder();
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: item.id,
                    quantity: 2,
                    unit_price_in_cents: 299,
                    notes: "No onions"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_item_status is invalid", async () => {
            const order = await createTestOrder();
            const item = await createTestItem();

            const response = await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: item.id,
                    quantity: 2,
                    unit_price_in_cents: 299,
                    notes: "No onions",
                    order_item_status: "cooking"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /order-items", () => {
        it("should return all order items", async () => {
            await createTestOrderItem();

            const order = await createTestOrder();

            const category = await request(app)
                .post("/categories")
                .send({
                    name: "Burritos"
                });

            expect(category.status).toBe(201);

            const itemResponse = await request(app)
                .post("/items")
                .send({
                    name: "Beef Burrito",
                    description: "Beef burrito with rice and beans",
                    price_in_cents: 599,
                    category_id: category.body.category.id
                });

            expect(itemResponse.status).toBe(201);

            await request(app)
                .post("/order-items")
                .send({
                    order_id: order.id,
                    item_id: itemResponse.body.item.id,
                    quantity: 1,
                    unit_price_in_cents: 599,
                    notes: null,
                    order_item_status: "submitted"
                });

            const response = await request(app).get("/order-items");

            expect(response.status).toBe(200);
            expect(response.body.orderItems).toBeDefined();
            expect(Array.isArray(response.body.orderItems)).toBe(true);
            expect(response.body.orderItems.length).toBe(2);
        });

        it("should return an empty array if there are no order items", async () => {
            const response = await request(app).get("/order-items");

            expect(response.status).toBe(200);
            expect(response.body.orderItems).toEqual([]);
        });
    });

    describe("PATCH /order-items/:id", () => {
        it("should update an order item quantity", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    quantity: 5
                });

            expect(response.status).toBe(200);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.id).toBe(orderItem.id);
            expect(response.body.orderItem.quantity).toBe(5);
        });

        it("should update an order item unit price", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    unit_price_in_cents: 399
                });

            expect(response.status).toBe(200);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.id).toBe(orderItem.id);
            expect(response.body.orderItem.unit_price_in_cents).toBe(399);
        });

        it("should update order item notes", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    notes: "Extra salsa"
                });

            expect(response.status).toBe(200);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.id).toBe(orderItem.id);
            expect(response.body.orderItem.notes).toBe("Extra salsa");
        });

        it("should update order item notes to null", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    notes: null
                });

            expect(response.status).toBe(200);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.id).toBe(orderItem.id);
            expect(response.body.orderItem.notes).toBeNull();
        });

        it("should update order item status", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    order_item_status: "ready"
                });

            expect(response.status).toBe(200);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.id).toBe(orderItem.id);
            expect(response.body.orderItem.order_item_status).toBe("ready");
        });

        it("should update multiple order item fields", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    quantity: 3,
                    unit_price_in_cents: 349,
                    notes: "Extra lime",
                    order_item_status: "submitted"
                });

            expect(response.status).toBe(200);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.id).toBe(orderItem.id);
            expect(response.body.orderItem.quantity).toBe(3);
            expect(response.body.orderItem.unit_price_in_cents).toBe(349);
            expect(response.body.orderItem.notes).toBe("Extra lime");
            expect(response.body.orderItem.order_item_status).toBe("submitted");
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .patch("/order-items/not-a-valid-id")
                .send({
                    quantity: 3
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if quantity is not positive", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    quantity: 0
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if quantity is not an integer", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    quantity: 1.5
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if unit_price_in_cents is negative", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    unit_price_in_cents: -100
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if unit_price_in_cents is not an integer", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    unit_price_in_cents: 2.99
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if notes is an empty string", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    notes: ""
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_item_status is invalid", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({
                    order_item_status: "cooking"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if no valid fields are provided", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order item does not exist", async () => {
            const fakeOrderItemId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/order-items/${fakeOrderItemId}`)
                .send({
                    quantity: 3
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("DELETE /order-items/:id", () => {
        it("should delete an order item", async () => {
            const orderItem = await createTestOrderItem();

            const deleteResponse = await request(app)
                .delete(`/order-items/${orderItem.id}`);

            expect(deleteResponse.status).toBe(204);

            const getResponse = await request(app).get("/order-items");

            expect(getResponse.status).toBe(200);
            expect(getResponse.body.orderItems).toEqual([]);
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .delete("/order-items/not-a-valid-id");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order item does not exist", async () => {
            const fakeOrderItemId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .delete(`/order-items/${fakeOrderItemId}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});