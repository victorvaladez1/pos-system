import crypto from "crypto";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Order Item Status API", () => {
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

    const createTestItem = async () => {
        const category = await createTestCategory();

        const response = await request(app)
            .post("/items")
            .send({
                name: `Item ${crypto.randomUUID()}`,
                description: "Test item",
                price_in_cents: 1000,
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
                ticket_name: "Status Test Order",
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
                quantity: 1,
                unit_price_in_cents: item.price_in_cents,
                notes: null,
                order_item_status: "pending"
            });

        return response.body.orderItem;
    };

    describe("PATCH /order-items/:id/status", () => {
        it("should update order item status to submitted", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}/status`)
                .send({
                    order_item_status: "submitted"
                });

            expect(response.status).toBe(200);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.id).toBe(orderItem.id);
            expect(response.body.orderItem.order_item_status).toBe("submitted");
        });

        it("should update order item status to ready", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}/status`)
                .send({
                    order_item_status: "ready"
                });

            expect(response.status).toBe(200);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.id).toBe(orderItem.id);
            expect(response.body.orderItem.order_item_status).toBe("ready");
        });

        it("should update order item status to served", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}/status`)
                .send({
                    order_item_status: "served"
                });

            expect(response.status).toBe(200);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.id).toBe(orderItem.id);
            expect(response.body.orderItem.order_item_status).toBe("served");
        });

        it("should update order item status to voided", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}/status`)
                .send({
                    order_item_status: "voided"
                });

            expect(response.status).toBe(200);
            expect(response.body.orderItem).toBeDefined();
            expect(response.body.orderItem.id).toBe(orderItem.id);
            expect(response.body.orderItem.order_item_status).toBe("voided");
        });

        it("should return 400 if order item id is not a valid UUID", async () => {
            const response = await request(app)
                .patch("/order-items/not-a-valid-id/status")
                .send({
                    order_item_status: "ready"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_item_status is missing", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}/status`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_item_status is invalid", async () => {
            const orderItem = await createTestOrderItem();

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}/status`)
                .send({
                    order_item_status: "cooking"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order item does not exist", async () => {
            const fakeOrderItemId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/order-items/${fakeOrderItemId}/status`)
                .send({
                    order_item_status: "ready"
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should update updated_at when status changes", async () => {
            const orderItem = await createTestOrderItem();

            await new Promise((resolve) => setTimeout(resolve, 10));

            const response = await request(app)
                .patch(`/order-items/${orderItem.id}/status`)
                .send({
                    order_item_status: "submitted"
                });

            expect(response.status).toBe(200);
            expect(response.body.orderItem.updated_at).toBeDefined();
            expect(new Date(response.body.orderItem.updated_at).getTime()).toBeGreaterThan(
                new Date(orderItem.updated_at).getTime()
            );
        });
    });
});