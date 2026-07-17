import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Payment Methods Report API", () => {
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

    const createTestUser = async (
        userRole: string,
        isActive = true,
        firstName = "Test"
    ) => {
        const result = await sql`
            INSERT INTO users (
                first_name,
                middle_name,
                last_name,
                user_role,
                passcode_hash,
                is_active
            )
            VALUES (
                ${firstName},
                ${null},
                ${"User"},
                ${userRole}::user_role_enum,
                ${`${userRole}-1234`},
                ${isActive}
            )
            RETURNING
                id,
                first_name,
                middle_name,
                last_name,
                user_role,
                is_active,
                created_at,
                updated_at
        `;

        return result[0];
    };

    const createCashierUser = async () => {
        return createTestUser("cashier");
    };

    const createTestOrder = async () => {
        const response = await request(app)
            .post("/orders")
            .send({
                order_type: "takeout",
                order_status: "open",
                ticket_name: "Payment Methods Report Test Order",
                guest_count: 1
            });

        return response.body.order;
    };

    const createPayment = async (
        orderId: string,
        amountInCents: number,
        paymentMethod = "card",
        paymentStatus = "completed"
    ) => {
        const cashier = await createCashierUser();

        const response = await request(app)
            .post("/payments")
            .set("x-user-id", cashier.id)
            .send({
                order_id: orderId,
                amount_in_cents: amountInCents,
                payment_method: paymentMethod,
                payment_status: paymentStatus
            });

        return response.body.payment;
    };

    const getPaymentMethodsReportAsRole = async (
        userRole: string,
        isActive = true
    ) => {
        const user = await createTestUser(userRole, isActive);

        return request(app)
            .get("/reports/payment-methods")
            .set("x-user-id", user.id);
    };

    describe("GET /reports/payment-methods", () => {
        it("should group completed payments by payment method", async () => {
            const firstOrder = await createTestOrder();
            const secondOrder = await createTestOrder();
            const thirdOrder = await createTestOrder();

            await createPayment(firstOrder.id, 1000, "card");
            await createPayment(secondOrder.id, 2500, "card");
            await createPayment(thirdOrder.id, 1200, "cash");

            const response = await getPaymentMethodsReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
            expect(response.body.report).toHaveLength(2);

            const cardReport = response.body.report.find(
                (row: { payment_method: string }) => row.payment_method === "card"
            );

            const cashReport = response.body.report.find(
                (row: { payment_method: string }) => row.payment_method === "cash"
            );

            expect(cardReport).toMatchObject({
                payment_method: "card",
                gross_sales_in_cents: 3500,
                payment_count: 2
            });

            expect(cashReport).toMatchObject({
                payment_method: "cash",
                gross_sales_in_cents: 1200,
                payment_count: 1
            });
        });

        it("should only count completed payments", async () => {
            const order = await createTestOrder();

            await createPayment(order.id, 1000, "card", "completed");
            await createPayment(order.id, 2000, "card", "pending");
            await createPayment(order.id, 3000, "cash", "failed");
            await createPayment(order.id, 4000, "cash", "voided");
            await createPayment(order.id, 5000, "mobile_pay", "refunded");

            const response = await getPaymentMethodsReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toHaveLength(1);

            expect(response.body.report[0]).toMatchObject({
                payment_method: "card",
                gross_sales_in_cents: 1000,
                payment_count: 1
            });
        });

        it("should return an empty array if there are no completed payments", async () => {
            const order = await createTestOrder();

            await createPayment(order.id, 1000, "card", "pending");

            const response = await getPaymentMethodsReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
            expect(response.body.report).toEqual([]);
        });

        it("should return an empty array if there are no payments", async () => {
            const response = await getPaymentMethodsReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
            expect(response.body.report).toEqual([]);
        });

        it("should order payment methods by gross sales descending", async () => {
            const firstOrder = await createTestOrder();
            const secondOrder = await createTestOrder();
            const thirdOrder = await createTestOrder();

            await createPayment(firstOrder.id, 1000, "cash");
            await createPayment(secondOrder.id, 3000, "card");
            await createPayment(thirdOrder.id, 2000, "mobile_pay");

            const response = await getPaymentMethodsReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toHaveLength(3);
            expect(response.body.report[0].payment_method).toBe("card");
            expect(response.body.report[1].payment_method).toBe("mobile_pay");
            expect(response.body.report[2].payment_method).toBe("cash");
        });

        it("should allow manager to access payment methods report", async () => {
            const response = await getPaymentMethodsReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
        });

        it("should allow admin to access payment methods report", async () => {
            const response = await getPaymentMethodsReportAsRole("admin");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
        });

        it("should return 401 if x-user-id is missing", async () => {
            const response = await request(app)
                .get("/reports/payment-methods");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if x-user-id is not a valid UUID", async () => {
            const response = await request(app)
                .get("/reports/payment-methods")
                .set("x-user-id", "not-a-valid-id");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if x-user-id does not exist", async () => {
            const response = await request(app)
                .get("/reports/payment-methods")
                .set("x-user-id", "00000000-0000-0000-0000-000000000000");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if cashier tries to access payment methods report", async () => {
            const response = await getPaymentMethodsReportAsRole("cashier");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if server tries to access payment methods report", async () => {
            const response = await getPaymentMethodsReportAsRole("server");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if kitchen tries to access payment methods report", async () => {
            const response = await getPaymentMethodsReportAsRole("kitchen");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if host tries to access payment methods report", async () => {
            const response = await getPaymentMethodsReportAsRole("host");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if inactive manager tries to access payment methods report", async () => {
            const response = await getPaymentMethodsReportAsRole("manager", false);

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });
    });
});