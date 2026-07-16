import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Order Cancel API", () => {
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

    const createTestOrder = async (order_status = "open") => {
        const response = await request(app)
            .post("/orders")
            .send({
                order_type: "takeout",
                order_status,
                ticket_name: "Cancel Test Order",
                guest_count: 1
            });

        return response.body.order;
    };

    describe("PATCH /orders/:id/cancel", () => {
        it("should cancel an open order", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .patch(`/orders/${order.id}/cancel`);

            expect(response.status).toBe(200);
            expect(response.body.order).toBeDefined();
            expect(response.body.order.id).toBe(order.id);
            expect(response.body.order.order_status).toBe("cancelled");
            expect(response.body.order.closed_at).toBeDefined();
        });

        it("should set closed_at when cancelling an order", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .patch(`/orders/${order.id}/cancel`);

            expect(response.status).toBe(200);
            expect(response.body.order.closed_at).not.toBeNull();
        });

        it("should return 400 if order id is not a valid UUID", async () => {
            const response = await request(app)
                .patch("/orders/not-a-valid-id/cancel");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order does not exist", async () => {
            const fakeOrderId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/orders/${fakeOrderId}/cancel`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order is already paid", async () => {
            const order = await createTestOrder("paid");

            const response = await request(app)
                .patch(`/orders/${order.id}/cancel`);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order is already cancelled", async () => {
            const order = await createTestOrder("cancelled");

            const response = await request(app)
                .patch(`/orders/${order.id}/cancel`);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });
});