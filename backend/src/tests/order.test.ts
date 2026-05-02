import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Order API", () => {
    beforeEach(async () => {
        await sql`DELETE FROM order_item_modifiers`;
        await sql`DELETE FROM order_items`;
        await sql`DELETE FROM payments`;
        await sql`DELETE FROM orders`;
        await sql`DELETE FROM tables`;
    });

    const createTestTable = async () => {
        const response = await request(app)
            .post("/tables")
            .send({
                table_number: 1,
                capacity: 4,
                current_status: "available"
            });

        expect(response.status).toBe(201);
        expect(response.body.table).toBeDefined();

        return response.body.table;
    };

    describe("POST /orders", () => {
        it("should create a dine-in order", async () => {
            const table = await createTestTable();

            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: table.id,
                    server_id: null,
                    order_type: "dine_in",
                    order_status: "open",
                    ticket_name: "Table 1",
                    guest_count: 2
                });

            expect(response.status).toBe(201);
            expect(response.body.order).toBeDefined();
            expect(response.body.order.id).toBeDefined();
            expect(response.body.order.table_id).toBe(table.id);
            expect(response.body.order.server_id).toBeNull();
            expect(response.body.order.order_type).toBe("dine_in");
            expect(response.body.order.order_status).toBe("open");
            expect(response.body.order.ticket_name).toBe("Table 1");
            expect(response.body.order.guest_count).toBe(2);
            expect(response.body.order.created_at).toBeDefined();
            expect(response.body.order.updated_at).toBeDefined();
        });

        it("should create a takeout order without a table", async () => {
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
            expect(response.body.order.table_id).toBeNull();
            expect(response.body.order.server_id).toBeNull();
            expect(response.body.order.order_type).toBe("takeout");
            expect(response.body.order.order_status).toBe("open");
            expect(response.body.order.ticket_name).toBe("Victor");
            expect(response.body.order.guest_count).toBeNull();
        });

        it("should return 400 if order_type is missing", async () => {
            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_type is invalid", async () => {
            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "pickup",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_status is missing", async () => {
            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_status is invalid", async () => {
            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "done",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if table_id is not a valid UUID", async () => {
            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: "not-a-valid-id",
                    server_id: null,
                    order_type: "dine_in",
                    order_status: "open",
                    ticket_name: "Table 1",
                    guest_count: 2
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if table_id does not exist", async () => {
            const fakeTableId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: fakeTableId,
                    server_id: null,
                    order_type: "dine_in",
                    order_status: "open",
                    ticket_name: "Table 1",
                    guest_count: 2
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if server_id is not a valid UUID", async () => {
            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: "not-a-valid-id",
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if ticket_name is an empty string", async () => {
            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "",
                    guest_count: null
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if guest_count is negative", async () => {
            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: -1
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if guest_count is not an integer", async () => {
            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: 2.5
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /orders", () => {
        it("should return all orders", async () => {
            await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "delivery",
                    order_status: "open",
                    ticket_name: "Delivery Order",
                    guest_count: null
                });

            const response = await request(app).get("/orders");

            expect(response.status).toBe(200);
            expect(response.body.orders).toBeDefined();
            expect(Array.isArray(response.body.orders)).toBe(true);
            expect(response.body.orders.length).toBe(2);
        });

        it("should return an empty array if there are no orders", async () => {
            const response = await request(app).get("/orders");

            expect(response.status).toBe(200);
            expect(response.body.orders).toEqual([]);
        });
    });

    describe("PATCH /orders/:id", () => {
        it("should update an order status", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const updateResponse = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    order_status: "submitted"
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.order).toBeDefined();
            expect(updateResponse.body.order.id).toBe(orderId);
            expect(updateResponse.body.order.order_status).toBe("submitted");
            expect(updateResponse.body.order.order_type).toBe("takeout");
        });

        it("should update an order type", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const updateResponse = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    order_type: "delivery"
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.order).toBeDefined();
            expect(updateResponse.body.order.id).toBe(orderId);
            expect(updateResponse.body.order.order_type).toBe("delivery");
        });

        it("should update an order table", async () => {
            const table = await createTestTable();

            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const updateResponse = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    table_id: table.id
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.order).toBeDefined();
            expect(updateResponse.body.order.id).toBe(orderId);
            expect(updateResponse.body.order.table_id).toBe(table.id);
        });

        it("should update table_id to null", async () => {
            const table = await createTestTable();

            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: table.id,
                    server_id: null,
                    order_type: "dine_in",
                    order_status: "open",
                    ticket_name: "Table 1",
                    guest_count: 2
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const updateResponse = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    table_id: null
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.order).toBeDefined();
            expect(updateResponse.body.order.id).toBe(orderId);
            expect(updateResponse.body.order.table_id).toBeNull();
        });

        it("should update ticket_name", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const updateResponse = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    ticket_name: "Updated Ticket"
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.order).toBeDefined();
            expect(updateResponse.body.order.id).toBe(orderId);
            expect(updateResponse.body.order.ticket_name).toBe("Updated Ticket");
        });

        it("should update ticket_name to null", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const updateResponse = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    ticket_name: null
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.order).toBeDefined();
            expect(updateResponse.body.order.id).toBe(orderId);
            expect(updateResponse.body.order.ticket_name).toBeNull();
        });

        it("should update guest_count", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const updateResponse = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    guest_count: 5
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.order).toBeDefined();
            expect(updateResponse.body.order.id).toBe(orderId);
            expect(updateResponse.body.order.guest_count).toBe(5);
        });

        it("should update guest_count to null", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: 2
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const updateResponse = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    guest_count: null
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.order).toBeDefined();
            expect(updateResponse.body.order.id).toBe(orderId);
            expect(updateResponse.body.order.guest_count).toBeNull();
        });

        it("should update multiple order fields", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const updateResponse = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    order_type: "delivery",
                    order_status: "submitted",
                    ticket_name: "Delivery Ticket",
                    guest_count: 3
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.order).toBeDefined();
            expect(updateResponse.body.order.id).toBe(orderId);
            expect(updateResponse.body.order.order_type).toBe("delivery");
            expect(updateResponse.body.order.order_status).toBe("submitted");
            expect(updateResponse.body.order.ticket_name).toBe("Delivery Ticket");
            expect(updateResponse.body.order.guest_count).toBe(3);
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .patch("/orders/not-a-valid-id")
                .send({
                    order_status: "submitted"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_type is invalid", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const response = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    order_type: "pickup"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_status is invalid", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const response = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    order_status: "done"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if table_id is not a valid UUID", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const response = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    table_id: "not-a-valid-id"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if updated table_id does not exist", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;
            const fakeTableId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    table_id: fakeTableId
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if ticket_name is an empty string", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const response = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    ticket_name: ""
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if guest_count is negative", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const response = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    guest_count: -1
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if guest_count is not an integer", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const response = await request(app)
                .patch(`/orders/${orderId}`)
                .send({
                    guest_count: 2.5
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if no valid fields are provided", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const response = await request(app)
                .patch(`/orders/${orderId}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order does not exist", async () => {
            const fakeOrderId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/orders/${fakeOrderId}`)
                .send({
                    order_status: "submitted"
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("DELETE /orders/:id", () => {
        it("should delete an order", async () => {
            const createResponse = await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Victor",
                    guest_count: null
                });

            expect(createResponse.status).toBe(201);

            const orderId = createResponse.body.order.id;

            const deleteResponse = await request(app)
                .delete(`/orders/${orderId}`);

            expect(deleteResponse.status).toBe(204);

            const getResponse = await request(app).get("/orders");

            expect(getResponse.status).toBe(200);
            expect(getResponse.body.orders).toEqual([]);
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .delete("/orders/not-a-valid-id");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order does not exist", async () => {
            const fakeOrderId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .delete(`/orders/${fakeOrderId}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});