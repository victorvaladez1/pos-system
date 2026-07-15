import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Payment API", () => {
    beforeEach(async () => {
        await sql`DELETE FROM order_item_modifiers`;
        await sql`DELETE FROM payments`;
        await sql`DELETE FROM order_items`;
        await sql`DELETE FROM orders`;
        await sql`DELETE FROM items`;
        await sql`DELETE FROM modifiers`;
        await sql`DELETE FROM categories`;
        await sql`DELETE FROM tables`;
    });

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

    const createTestPayment = async () => {
        const order = await createTestOrder();

        const response = await request(app)
            .post("/payments")
            .send({
                order_id: order.id,
                amount_in_cents: 1299,
                payment_method: "card",
                payment_status: "completed"
            });

        return response.body.payment;
    };

    describe("POST /payments", () => {
        it("should create a payment", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .post("/payments")
                .send({
                    order_id: order.id,
                    amount_in_cents: 1299,
                    payment_method: "card",
                    payment_status: "completed"
                });

            expect(response.status).toBe(201);
            expect(response.body.payment).toBeDefined();
            expect(response.body.payment.id).toBeDefined();
            expect(response.body.payment.order_id).toBe(order.id);
            expect(response.body.payment.amount_in_cents).toBe(1299);
            expect(response.body.payment.payment_method).toBe("card");
            expect(response.body.payment.payment_status).toBe("completed");
            expect(response.body.payment.created_at).toBeDefined();
            expect(response.body.payment.updated_at).toBeDefined();
        });

        it("should create a payment with zero amount", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .post("/payments")
                .send({
                    order_id: order.id,
                    amount_in_cents: 0,
                    payment_method: "cash",
                    payment_status: "pending"
                });

            expect(response.status).toBe(201);
            expect(response.body.payment).toBeDefined();
            expect(response.body.payment.amount_in_cents).toBe(0);
            expect(response.body.payment.payment_method).toBe("cash");
            expect(response.body.payment.payment_status).toBe("pending");
        });

        it("should return 400 if order_id is missing", async () => {
            const response = await request(app)
                .post("/payments")
                .send({
                    amount_in_cents: 1299,
                    payment_method: "card",
                    payment_status: "completed"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if order_id is not a valid UUID", async () => {
            const response = await request(app)
                .post("/payments")
                .send({
                    order_id: "not-a-valid-id",
                    amount_in_cents: 1299,
                    payment_method: "card",
                    payment_status: "completed"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if order_id does not exist", async () => {
            const fakeOrderId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .post("/payments")
                .send({
                    order_id: fakeOrderId,
                    amount_in_cents: 1299,
                    payment_method: "card",
                    payment_status: "completed"
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if amount_in_cents is missing", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .post("/payments")
                .send({
                    order_id: order.id,
                    payment_method: "card",
                    payment_status: "completed"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if amount_in_cents is negative", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .post("/payments")
                .send({
                    order_id: order.id,
                    amount_in_cents: -1,
                    payment_method: "card",
                    payment_status: "completed"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if amount_in_cents is not an integer", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .post("/payments")
                .send({
                    order_id: order.id,
                    amount_in_cents: 12.99,
                    payment_method: "card",
                    payment_status: "completed"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if payment_method is missing", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .post("/payments")
                .send({
                    order_id: order.id,
                    amount_in_cents: 1299,
                    payment_status: "completed"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if payment_method is invalid", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .post("/payments")
                .send({
                    order_id: order.id,
                    amount_in_cents: 1299,
                    payment_method: "bitcoin",
                    payment_status: "completed"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if payment_status is missing", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .post("/payments")
                .send({
                    order_id: order.id,
                    amount_in_cents: 1299,
                    payment_method: "card"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if payment_status is invalid", async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .post("/payments")
                .send({
                    order_id: order.id,
                    amount_in_cents: 1299,
                    payment_method: "card",
                    payment_status: "unknown"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /payments", () => {
        it("should return all payments", async () => {
            const firstPayment = await createTestPayment();

            const secondOrder = await createTestOrder();

            const secondCreateResponse = await request(app)
                .post("/payments")
                .send({
                    order_id: secondOrder.id,
                    amount_in_cents: 2500,
                    payment_method: "cash",
                    payment_status: "pending"
                });

            expect(secondCreateResponse.status).toBe(201);

            const response = await request(app)
                .get("/payments");

            expect(response.status).toBe(200);
            expect(response.body.payments).toBeDefined();
            expect(Array.isArray(response.body.payments)).toBe(true);
            expect(response.body.payments.length).toBe(2);

            const ids = response.body.payments.map(
                (payment: { id: string }) => payment.id
            );

            expect(ids).toContain(firstPayment.id);
            expect(ids).toContain(secondCreateResponse.body.payment.id);
        });

        it("should return an empty array if there are no payments", async () => {
            const response = await request(app)
                .get("/payments");

            expect(response.status).toBe(200);
            expect(response.body.payments).toBeDefined();
            expect(response.body.payments).toEqual([]);
        });
    });

    describe("PATCH /payments/:id", () => {
        it("should update payment amount", async () => {
            const payment = await createTestPayment();

            const response = await request(app)
                .patch(`/payments/${payment.id}`)
                .send({
                    amount_in_cents: 1599
                });

            expect(response.status).toBe(200);
            expect(response.body.payment).toBeDefined();
            expect(response.body.payment.id).toBe(payment.id);
            expect(response.body.payment.amount_in_cents).toBe(1599);
        });

        it("should update payment method", async () => {
            const payment = await createTestPayment();

            const response = await request(app)
                .patch(`/payments/${payment.id}`)
                .send({
                    payment_method: "cash"
                });

            expect(response.status).toBe(200);
            expect(response.body.payment).toBeDefined();
            expect(response.body.payment.payment_method).toBe("cash");
        });

        it("should update payment status", async () => {
            const payment = await createTestPayment();

            const response = await request(app)
                .patch(`/payments/${payment.id}`)
                .send({
                    payment_status: "refunded"
                });

            expect(response.status).toBe(200);
            expect(response.body.payment).toBeDefined();
            expect(response.body.payment.payment_status).toBe("refunded");
        });

        it("should update multiple payment fields", async () => {
            const payment = await createTestPayment();

            const response = await request(app)
                .patch(`/payments/${payment.id}`)
                .send({
                    amount_in_cents: 999,
                    payment_method: "gift_card",
                    payment_status: "completed"
                });

            expect(response.status).toBe(200);
            expect(response.body.payment).toBeDefined();
            expect(response.body.payment.amount_in_cents).toBe(999);
            expect(response.body.payment.payment_method).toBe("gift_card");
            expect(response.body.payment.payment_status).toBe("completed");
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .patch("/payments/not-a-valid-id")
                .send({
                    amount_in_cents: 1599
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if amount_in_cents is negative", async () => {
            const payment = await createTestPayment();

            const response = await request(app)
                .patch(`/payments/${payment.id}`)
                .send({
                    amount_in_cents: -1
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if amount_in_cents is not an integer", async () => {
            const payment = await createTestPayment();

            const response = await request(app)
                .patch(`/payments/${payment.id}`)
                .send({
                    amount_in_cents: 12.99
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if payment_method is invalid", async () => {
            const payment = await createTestPayment();

            const response = await request(app)
                .patch(`/payments/${payment.id}`)
                .send({
                    payment_method: "bitcoin"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if payment_status is invalid", async () => {
            const payment = await createTestPayment();

            const response = await request(app)
                .patch(`/payments/${payment.id}`)
                .send({
                    payment_status: "unknown"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if no valid fields are provided", async () => {
            const payment = await createTestPayment();

            const response = await request(app)
                .patch(`/payments/${payment.id}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if payment does not exist", async () => {
            const fakePaymentId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/payments/${fakePaymentId}`)
                .send({
                    amount_in_cents: 1599
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("DELETE /payments/:id", () => {
        it("should delete a payment", async () => {
            const payment = await createTestPayment();

            const deleteResponse = await request(app)
                .delete(`/payments/${payment.id}`);

            expect(deleteResponse.status).toBe(204);

            const getResponse = await request(app)
                .get("/payments");

            expect(getResponse.status).toBe(200);
            expect(getResponse.body.payments).toEqual([]);
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .delete("/payments/not-a-valid-id");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if payment does not exist", async () => {
            const fakePaymentId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .delete(`/payments/${fakePaymentId}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});