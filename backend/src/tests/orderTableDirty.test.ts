import crypto from "crypto";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";
import { createCashierHeader } from "./helpers/auth.js";

describe("Order Table Dirty API", () => {
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

    const createTestCashier = async () => {
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
                ${"Test"},
                ${null},
                ${"Cashier"},
                ${"cashier"}::user_role_enum,
                ${"1234"},
                ${true}
            )
            RETURNING id
        `;

        return result[0];
    };

    const createTestTable = async (
        tableNumber: number,
        currentStatus = "available"
    ) => {
        const response = await request(app)
            .post("/tables")
            .send({
                table_number: tableNumber,
                capacity: 4,
                current_status: currentStatus
            });

        return response.body.table;
    };

    const createTestCategory = async () => {
        const response = await request(app)
            .post("/categories")
            .send({
                name: `Category ${crypto.randomUUID()}`
            });

        return response.body.category;
    };

    const createTestItem = async (priceInCents = 1000) => {
        const category = await createTestCategory();

        const response = await request(app)
            .post("/items")
            .send({
                name: `Item ${crypto.randomUUID()}`,
                description: "Test item",
                price_in_cents: priceInCents,
                category_id: category.id
            });

        return response.body.item;
    };

    const createDineInOrder = async (tableId: string) => {
        const response = await request(app)
            .post("/orders")
            .send({
                table_id: tableId,
                order_type: "dine_in",
                order_status: "open",
                ticket_name: "Dine In Dirty Test",
                guest_count: 2
            });

        return response.body.order;
    };

    const createTakeoutOrder = async () => {
        const response = await request(app)
            .post("/orders")
            .send({
                order_type: "takeout",
                order_status: "open",
                ticket_name: "Takeout Dirty Test",
                guest_count: 1
            });

        return response.body.order;
    };

    const createOrderItem = async (
        orderId: string,
        itemId: string,
        unitPriceInCents: number
    ) => {
        const response = await request(app)
            .post("/order-items")
            .send({
                order_id: orderId,
                item_id: itemId,
                quantity: 1,
                unit_price_in_cents: unitPriceInCents,
                notes: null,
                order_item_status: "pending"
            });

        return response.body.orderItem;
    };

    const createPayment = async (
        orderId: string,
        amountInCents: number
    ) => {
        const authHeader = await createCashierHeader();

        const response = await request(app)
            .post("/payments")
            .set(authHeader)
            .send({
                order_id: orderId,
                amount_in_cents: amountInCents,
                payment_method: "card",
                payment_status: "completed"
            });

        return response.body.payment;
    };

    const getTableById = async (tableId: string) => {
        const result = await sql`
            SELECT *
            FROM tables
            WHERE id = ${tableId}
        `;

        return result[0];
    };

    describe("PATCH /orders/:id/close table dirty behavior", () => {
        it("should mark table dirty when closing a fully paid dine-in order", async () => {
            const table = await createTestTable(1);
            const order = await createDineInOrder(table.id);
            const item = await createTestItem(1000);

            await createOrderItem(order.id, item.id, item.price_in_cents);
            await createPayment(order.id, 1000);

            const response = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(response.status).toBe(200);

            const updatedTable = await getTableById(table.id);

            expect(updatedTable.current_status).toBe("dirty");
        });

        it("should not mark table dirty when closing a takeout order", async () => {
            const table = await createTestTable(2);
            const order = await createTakeoutOrder();
            const item = await createTestItem(1000);

            await createOrderItem(order.id, item.id, item.price_in_cents);
            await createPayment(order.id, 1000);

            const response = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(response.status).toBe(200);

            const updatedTable = await getTableById(table.id);

            expect(updatedTable.current_status).toBe("available");
        });

        it("should not mark table dirty if closing fails due to remaining balance", async () => {
            const table = await createTestTable(3);
            const order = await createDineInOrder(table.id);
            const item = await createTestItem(1000);

            await createOrderItem(order.id, item.id, item.price_in_cents);
            await createPayment(order.id, 500);

            const response = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(response.status).toBe(400);

            const updatedTable = await getTableById(table.id);

            expect(updatedTable.current_status).toBe("occupied");
        });
    });

    describe("PATCH /orders/:id/cancel table dirty behavior", () => {
        it("should mark table dirty when cancelling a dine-in order", async () => {
            const table = await createTestTable(4);
            const order = await createDineInOrder(table.id);

            const response = await request(app)
                .patch(`/orders/${order.id}/cancel`);

            expect(response.status).toBe(200);

            const updatedTable = await getTableById(table.id);

            expect(updatedTable.current_status).toBe("dirty");
        });

        it("should not mark table dirty when cancelling a takeout order", async () => {
            const table = await createTestTable(5);
            const order = await createTakeoutOrder();

            const response = await request(app)
                .patch(`/orders/${order.id}/cancel`);

            expect(response.status).toBe(200);

            const updatedTable = await getTableById(table.id);

            expect(updatedTable.current_status).toBe("available");
        });

        it("should not mark table dirty if cancelling fails because order is already paid", async () => {
            const table = await createTestTable(6);
            const order = await createDineInOrder(table.id);
            const item = await createTestItem(1000);

            await createOrderItem(order.id, item.id, item.price_in_cents);
            await createPayment(order.id, 1000);

            const closeResponse = await request(app)
                .patch(`/orders/${order.id}/close`);

            expect(closeResponse.status).toBe(200);

            await request(app)
                .patch(`/tables/${table.id}/status`)
                .send({
                    current_status: "occupied"
                });

            const cancelResponse = await request(app)
                .patch(`/orders/${order.id}/cancel`);

            expect(cancelResponse.status).toBe(400);

            const updatedTable = await getTableById(table.id);

            expect(updatedTable.current_status).toBe("occupied");
        });
    });
});