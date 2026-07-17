import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";
import {
    createJwtHeaderForRole,
    createTestUserWithRole
} from "./helpers/auth.js";
import { signAuthToken } from "../utils/jwt.js";

describe("Top Items Report API", () => {
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

    const createTestOrder = async () => {
        const response = await request(app)
            .post("/orders")
            .send({
                order_type: "takeout",
                order_status: "open",
                ticket_name: "Top Items Report Test Order",
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

    const getTopItemsReportAsRole = async (
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
            .get("/reports/top-items")
            .set(authHeader);
    };

    describe("GET /reports/top-items", () => {
        it("should group sold items by item", async () => {
            const category = await createTestCategory();
            const burger = await createTestItem("Burger", 1000, category.id);
            const fries = await createTestItem("Fries", 300, category.id);

            const firstOrder = await createTestOrder();
            const secondOrder = await createTestOrder();

            await createTestOrderItem(firstOrder.id, burger.id, 2, 1000);
            await createTestOrderItem(secondOrder.id, burger.id, 3, 1000);
            await createTestOrderItem(secondOrder.id, fries.id, 4, 300);

            const response = await getTopItemsReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
            expect(response.body.report).toHaveLength(2);

            const burgerReport = response.body.report.find(
                (row: { item_id: string }) => row.item_id === burger.id
            );

            const friesReport = response.body.report.find(
                (row: { item_id: string }) => row.item_id === fries.id
            );

            expect(burgerReport).toMatchObject({
                item_id: burger.id,
                item_name: "Burger",
                quantity_sold: 5,
                gross_sales_in_cents: 5000
            });

            expect(friesReport).toMatchObject({
                item_id: fries.id,
                item_name: "Fries",
                quantity_sold: 4,
                gross_sales_in_cents: 1200
            });
        });

        it("should ignore voided order items", async () => {
            const category = await createTestCategory();
            const burger = await createTestItem("Burger", 1000, category.id);

            const order = await createTestOrder();

            await createTestOrderItem(order.id, burger.id, 2, 1000, "submitted");
            await createTestOrderItem(order.id, burger.id, 10, 1000, "voided");

            const response = await getTopItemsReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toHaveLength(1);
            expect(response.body.report[0]).toMatchObject({
                item_id: burger.id,
                item_name: "Burger",
                quantity_sold: 2,
                gross_sales_in_cents: 2000
            });
        });

        it("should return an empty array if there are no order items", async () => {
            const response = await getTopItemsReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
            expect(response.body.report).toEqual([]);
        });

        it("should order top items by quantity sold descending", async () => {
            const category = await createTestCategory();
            const burger = await createTestItem("Burger", 1000, category.id);
            const fries = await createTestItem("Fries", 300, category.id);
            const taco = await createTestItem("Taco", 500, category.id);

            const order = await createTestOrder();

            await createTestOrderItem(order.id, burger.id, 2, 1000);
            await createTestOrderItem(order.id, fries.id, 6, 300);
            await createTestOrderItem(order.id, taco.id, 4, 500);

            const response = await getTopItemsReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toHaveLength(3);
            expect(response.body.report[0].item_name).toBe("Fries");
            expect(response.body.report[1].item_name).toBe("Taco");
            expect(response.body.report[2].item_name).toBe("Burger");
        });

        it("should allow manager to access top items report", async () => {
            const response = await getTopItemsReportAsRole("manager");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
        });

        it("should allow admin to access top items report", async () => {
            const response = await getTopItemsReportAsRole("admin");

            expect(response.status).toBe(200);
            expect(response.body.report).toBeDefined();
        });

        it("should return 401 if authorization header is missing", async () => {
            const response = await request(app)
                .get("/reports/top-items");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if authorization header is malformed", async () => {
            const response = await request(app)
                .get("/reports/top-items")
                .set("Authorization", "NotBearer token");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if JWT is invalid", async () => {
            const response = await request(app)
                .get("/reports/top-items")
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if cashier tries to access top items report", async () => {
            const response = await getTopItemsReportAsRole("cashier");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if server tries to access top items report", async () => {
            const response = await getTopItemsReportAsRole("server");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if kitchen tries to access top items report", async () => {
            const response = await getTopItemsReportAsRole("kitchen");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if host tries to access top items report", async () => {
            const response = await getTopItemsReportAsRole("host");

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if inactive manager tries to access top items report", async () => {
            const inactiveManager = await createTestUserWithRole("manager", false);
            const token = signAuthToken(inactiveManager.id);

            const response = await request(app)
                .get("/reports/top-items")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });
    });
});