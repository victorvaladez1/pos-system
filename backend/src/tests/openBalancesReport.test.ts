import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";
import {
    createCashierHeader,
    createXUserIdHeaderForRole
} from "./helpers/auth.js";

describe("Open Balances Report API", () => {
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
        const result = await sql`
            INSERT INTO categories (name)
            VALUES (${"Entrees"})
            RETURNING id, name, created_at, updated_at
        `;

        return result[0];
    };

    const createTestItem = async (
        name: string,
        priceInCents: number,
        categoryId: string
    ) => {
        const result = await sql`
            INSERT INTO items (
                name,
                description,
                price_in_cents,
                category_id,
                is_active
            )
            VALUES (
                ${name},
                ${`${name} description`},
                ${priceInCents},
                ${categoryId},
                ${true}
            )
            RETURNING
                id,
                name,
                description,
                price_in_cents,
                category_id,
                is_active,
                created_at,
                updated_at
        `;

        return result[0];
    };

    const createTestOrder = async (
        ticketName = "Open Balance Test Order",
        orderStatus = "open"
    ) => {
        const response = await request(app)
            .post("/orders")
            .send({
                order_type: "takeout",
                order_status: orderStatus,
                ticket_name: ticketName,
                guest_count: 1
            });

        return response.body.order;
    };

    const createTestOrderItem = async (
        orderId: string,
        itemId: string,
        quantity: number,
        unitPriceInCents: number,
        orderItemStatus = "submitted"
    ) => {
        const response = await request(app)
            .post("/order-items")
            .send({
                order_id: orderId,
                item_id: itemId,
                quantity,
                unit_price_in_cents: unitPriceInCents,
                notes: null,
                order_item_status: orderItemStatus
            });

        return response.body.orderItem;
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

    const getOpenBalancesReportAsRole = async (
        userRole:
            | "cashier"
            | "server"
            | "manager"
            | "admin"
            | "kitchen"
            | "host",
        isActive = true
    ) => {
        const authHeader = await createXUserIdHeaderForRole(userRole, isActive);

        return request(app)
            .get("/reports/open-balances")
            .set(authHeader);
    };

    describe("GET /reports/open-balances", () => {
        it("should return orders with remaining balances", async () => {
            const category = await createTestCategory();
            const burger = await createTestItem("Burger", 1000, category.id);

            const order = await createTestOrder("Order With Balance");

            await createTestOrderItem(order.id, burger.id, 3, 1000);
            await createPayment(order.id, 1000);

            const response = await getOpenBalancesReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toHaveLength(1);

            expect(response.body.report[0]).toMatchObject({
                order_id: order.id,
                ticket_name: "Order With Balance",
                order_type: "takeout",
                order_status: "open",
                subtotal_in_cents: 3000,
                payments_total_in_cents: 1000,
                balance_due_in_cents: 2000
            });
        });

        it("should not return fully paid orders", async () => {
            const category = await createTestCategory();
            const burger = await createTestItem("Burger", 1000, category.id);

            const order = await createTestOrder("Fully Paid Order");

            await createTestOrderItem(order.id, burger.id, 2, 1000);
            await createPayment(order.id, 2000);

            const response = await getOpenBalancesReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toEqual([]);
        });

        it("should not return overpaid orders", async () => {
            const category = await createTestCategory();
            const burger = await createTestItem("Burger", 1000, category.id);

            const order = await createTestOrder("Overpaid Order");

            await createTestOrderItem(order.id, burger.id, 2, 1000);
            await createPayment(order.id, 2500);

            const response = await getOpenBalancesReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toEqual([]);
        });

        it("should ignore non-completed payments", async () => {
            const category = await createTestCategory();
            const burger = await createTestItem("Burger", 1000, category.id);

            const order = await createTestOrder("Pending Payment Order");

            await createTestOrderItem(order.id, burger.id, 2, 1000);
            await createPayment(order.id, 500, "pending");

            const response = await getOpenBalancesReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toHaveLength(1);

            expect(response.body.report[0]).toMatchObject({
                order_id: order.id,
                subtotal_in_cents: 2000,
                payments_total_in_cents: 0,
                balance_due_in_cents: 2000
            });
        });

        it("should ignore voided order items", async () => {
            const category = await createTestCategory();
            const burger = await createTestItem("Burger", 1000, category.id);

            const order = await createTestOrder("Voided Item Order");

            await createTestOrderItem(order.id, burger.id, 2, 1000, "submitted");
            await createTestOrderItem(order.id, burger.id, 10, 1000, "voided");
            await createPayment(order.id, 500);

            const response = await getOpenBalancesReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toHaveLength(1);

            expect(response.body.report[0]).toMatchObject({
                order_id: order.id,
                subtotal_in_cents: 2000,
                payments_total_in_cents: 500,
                balance_due_in_cents: 1500
            });
        });

        it("should not return paid or cancelled orders", async () => {
            const category = await createTestCategory();
            const burger = await createTestItem("Burger", 1000, category.id);

            const paidOrder = await createTestOrder("Paid Status Order", "paid");
            const cancelledOrder = await createTestOrder(
                "Cancelled Status Order",
                "cancelled"
            );

            await createTestOrderItem(paidOrder.id, burger.id, 2, 1000);
            await createTestOrderItem(cancelledOrder.id, burger.id, 2, 1000);

            const response = await getOpenBalancesReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toEqual([]);
        });

        it("should order balances by balance due descending", async () => {
            const category = await createTestCategory();
            const burger = await createTestItem("Burger", 1000, category.id);

            const smallerBalanceOrder = await createTestOrder("Smaller Balance");
            const largerBalanceOrder = await createTestOrder("Larger Balance");

            await createTestOrderItem(smallerBalanceOrder.id, burger.id, 2, 1000);
            await createPayment(smallerBalanceOrder.id, 1000);

            await createTestOrderItem(largerBalanceOrder.id, burger.id, 5, 1000);
            await createPayment(largerBalanceOrder.id, 1000);

            const response = await getOpenBalancesReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toHaveLength(2);
            expect(response.body.report[0].ticket_name).toBe("Larger Balance");
            expect(response.body.report[1].ticket_name).toBe("Smaller Balance");
        });

        it("should return an empty array if there are no open balances", async () => {
            const response = await getOpenBalancesReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toEqual([]);
        });

        it("should allow manager to access open balances report", async () => {
            const response = await getOpenBalancesReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
        });

        it("should allow admin to access open balances report", async () => {
            const response = await getOpenBalancesReportAsRole("admin");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
        });

        it("should return 401 if x-user-id is missing", async () => {
            const response = await request(app)
                .get("/reports/open-balances");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if x-user-id is not a valid UUID", async () => {
            const response = await request(app)
                .get("/reports/open-balances")
                .set("x-user-id", "not-a-valid-id");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if x-user-id does not exist", async () => {
            const response = await request(app)
                .get("/reports/open-balances")
                .set("x-user-id", "00000000-0000-0000-0000-000000000000");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if cashier tries to access open balances report", async () => {
            const response = await getOpenBalancesReportAsRole("cashier");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if server tries to access open balances report", async () => {
            const response = await getOpenBalancesReportAsRole("server");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if kitchen tries to access open balances report", async () => {
            const response = await getOpenBalancesReportAsRole("kitchen");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if host tries to access open balances report", async () => {
            const response = await getOpenBalancesReportAsRole("host");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if inactive manager tries to access open balances report", async () => {
            const response = await getOpenBalancesReportAsRole("manager", false);

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });
    });
});