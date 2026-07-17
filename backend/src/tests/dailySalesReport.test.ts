import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";
import {
    createCashierHeader,
    createJwtHeaderForRole,
    createTestUserWithRole
} from "./helpers/auth.js";
import { signAuthToken } from "../utils/jwt.js";

describe("Daily Sales Report API", () => {
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

    const createTestOrder = async () => {
        const response = await request(app)
            .post("/orders")
            .send({
                order_type: "takeout",
                order_status: "open",
                ticket_name: "Daily Sales Test Order",
                guest_count: 1
            });

        return response.body.order;
    };

    const createPayment = async (
        orderId: string,
        amountInCents: number,
        paymentStatus = "completed"
    ) => {
        const authHeader = await createCashierHeader();

        const response = await request(app)
            .post("/payments")
            .set(authHeader)
            .send({
                order_id: orderId,
                amount_in_cents: amountInCents,
                payment_method: "card",
                payment_status: paymentStatus
            });

        return response.body.payment;
    };

    const getDailySalesAsRole = async (
        userRole:
            | "cashier"
            | "server"
            | "manager"
            | "admin"
            | "kitchen"
            | "host"
    ) => {
        const authHeader = await createJwtHeaderForRole(userRole);

        return request(app)
            .get("/reports/daily-sales")
            .set(authHeader);
    };

    describe("GET /reports/daily-sales", () => {
        it("should return daily sales total from completed payments", async () => {
            const firstOrder = await createTestOrder();
            const secondOrder = await createTestOrder();

            await createPayment(firstOrder.id, 1000);
            await createPayment(secondOrder.id, 2500);

            const response = await getDailySalesAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
            expect(response.body.report.gross_sales_in_cents).toBe(3500);
            expect(response.body.report.payment_count).toBe(2);
            expect(response.body.report.date).toBeDefined();
        });

        it("should only count completed payments", async () => {
            const order = await createTestOrder();

            await createPayment(order.id, 1000, "completed");
            await createPayment(order.id, 2000, "pending");
            await createPayment(order.id, 3000, "failed");
            await createPayment(order.id, 4000, "voided");
            await createPayment(order.id, 5000, "refunded");

            const response = await getDailySalesAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report.gross_sales_in_cents).toBe(1000);
            expect(response.body.report.payment_count).toBe(1);
        });

        it("should return zero totals if there are no completed payments", async () => {
            const order = await createTestOrder();

            await createPayment(order.id, 1000, "pending");

            const response = await getDailySalesAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report.gross_sales_in_cents).toBe(0);
            expect(response.body.report.payment_count).toBe(0);
        });

        it("should return zero totals if there are no payments", async () => {
            const response = await getDailySalesAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report.gross_sales_in_cents).toBe(0);
            expect(response.body.report.payment_count).toBe(0);
            expect(response.body.report.date).toBeDefined();
        });

        it("should allow manager to access daily sales report", async () => {
            const response = await getDailySalesAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
        });

        it("should allow admin to access daily sales report", async () => {
            const response = await getDailySalesAsRole("admin");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
        });

        it("should return 401 if authorization header is missing", async () => {
            const response = await request(app)
                .get("/reports/daily-sales");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if authorization header is malformed", async () => {
            const response = await request(app)
                .get("/reports/daily-sales")
                .set("Authorization", "NotBearer token");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if JWT is invalid", async () => {
            const response = await request(app)
                .get("/reports/daily-sales")
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if cashier tries to access daily sales report", async () => {
            const response = await getDailySalesAsRole("cashier");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if server tries to access daily sales report", async () => {
            const response = await getDailySalesAsRole("server");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if kitchen tries to access daily sales report", async () => {
            const response = await getDailySalesAsRole("kitchen");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if host tries to access daily sales report", async () => {
            const response = await getDailySalesAsRole("host");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if inactive manager tries to access daily sales report", async () => {
            const inactiveManager = await createTestUserWithRole("manager", false);
            const token = signAuthToken(inactiveManager.id);

            const response = await request(app)
                .get("/reports/daily-sales")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });
    });
});