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

    describe("GET /orders", () => {
        it ("should return all orders", async () => {
            await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Harry",
                    guest_count: null
                });

            await request(app)
                .post("/orders")
                .send({
                    table_id: null,
                    server_id: null,
                    order_type: "delivery",
                    order_status: "open",
                    ticket_name: "Deliver Order",
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
});