import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Open Orders API", () => {
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

    const createTestOrder = async (
        ticket_name: string,
        order_status = "open"
    ) => {
        const response = await request(app)
            .post("/orders")
            .send({
                order_type: "takeout",
                order_status,
                ticket_name,
                guest_count: 1
            });

        return response.body.order;
    };

    describe("GET /orders/open", () => {
        it("should return open orders", async () => {
            const firstOrder = await createTestOrder("First Open Order");
            const secondOrder = await createTestOrder("Second Open Order");

            const response = await request(app)
                .get("/orders/open");

            expect(response.status).toBe(200);
            expect(response.body.orders).toBeDefined();
            expect(response.body.orders).toHaveLength(2);

            const orderIds = response.body.orders.map((order: { id: string }) => order.id);

            expect(orderIds).toContain(firstOrder.id);
            expect(orderIds).toContain(secondOrder.id);
        });

        it("should not return paid orders", async () => {
            const openOrder = await createTestOrder("Open Order", "open");
            const paidOrder = await createTestOrder("Paid Order", "paid");

            const response = await request(app)
                .get("/orders/open");

            expect(response.status).toBe(200);
            expect(response.body.orders).toHaveLength(1);
            expect(response.body.orders[0].id).toBe(openOrder.id);

            const orderIds = response.body.orders.map((order: { id: string }) => order.id);

            expect(orderIds).not.toContain(paidOrder.id);
        });

        it("should not return cancelled orders", async () => {
            const openOrder = await createTestOrder("Open Order", "open");
            const cancelledOrder = await createTestOrder("Cancelled Order", "cancelled");

            const response = await request(app)
                .get("/orders/open");

            expect(response.status).toBe(200);
            expect(response.body.orders).toHaveLength(1);
            expect(response.body.orders[0].id).toBe(openOrder.id);

            const orderIds = response.body.orders.map((order: { id: string }) => order.id);

            expect(orderIds).not.toContain(cancelledOrder.id);
        });

        it("should return an empty array if there are no open orders", async () => {
            await createTestOrder("Paid Order", "paid");
            await createTestOrder("Cancelled Order", "cancelled");

            const response = await request(app)
                .get("/orders/open");

            expect(response.status).toBe(200);
            expect(response.body.orders).toBeDefined();
            expect(response.body.orders).toEqual([]);
        });

        it("should return newest open orders first", async () => {
            const firstOrder = await createTestOrder("First Open Order");

            await new Promise((resolve) => setTimeout(resolve, 10));

            const secondOrder = await createTestOrder("Second Open Order");

            const response = await request(app)
                .get("/orders/open");

            expect(response.status).toBe(200);
            expect(response.body.orders).toHaveLength(2);
            expect(response.body.orders[0].id).toBe(secondOrder.id);
            expect(response.body.orders[1].id).toBe(firstOrder.id);
        });

        it("should include expected order fields", async () => {
            const order = await createTestOrder("Field Check Order");

            const response = await request(app)
                .get("/orders/open");

            expect(response.status).toBe(200);
            expect(response.body.orders).toHaveLength(1);

            expect(response.body.orders[0]).toMatchObject({
                id: order.id,
                table_id: null,
                server_id: null,
                order_type: "takeout",
                order_status: "open",
                ticket_name: "Field Check Order",
                guest_count: 1,
                closed_at: null
            });

            expect(response.body.orders[0].opened_at).toBeDefined();
            expect(response.body.orders[0].created_at).toBeDefined();
            expect(response.body.orders[0].updated_at).toBeDefined();
        });
    });
});