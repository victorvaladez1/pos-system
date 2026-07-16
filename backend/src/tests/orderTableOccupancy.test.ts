import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Order Table Occupancy API", () => {
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

    const getTableById = async (tableId: string) => {
        const result = await sql`
            SELECT *
            FROM tables
            WHERE id = ${tableId}
        `;

        return result[0];
    };

    describe("POST /orders table occupancy", () => {
        it("should mark table as occupied when creating a dine-in order with table_id", async () => {
            const table = await createTestTable(1, "available");

            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: table.id,
                    order_type: "dine_in",
                    order_status: "open",
                    ticket_name: "Dine In Table Order",
                    guest_count: 2
                });

            expect(response.status).toBe(201);
            expect(response.body.order).toBeDefined();
            expect(response.body.order.table_id).toBe(table.id);

            const updatedTable = await getTableById(table.id);

            expect(updatedTable.current_status).toBe("occupied");
        });

        it("should mark reserved table as occupied when creating a dine-in order", async () => {
            const table = await createTestTable(2, "reserved");

            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: table.id,
                    order_type: "dine_in",
                    order_status: "open",
                    ticket_name: "Reserved Table Order",
                    guest_count: 2
                });

            expect(response.status).toBe(201);
            expect(response.body.order).toBeDefined();
            expect(response.body.order.table_id).toBe(table.id);

            const updatedTable = await getTableById(table.id);

            expect(updatedTable.current_status).toBe("occupied");
        });

        it("should not mark table as occupied when creating a takeout order", async () => {
            const table = await createTestTable(3, "available");

            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: table.id,
                    order_type: "takeout",
                    order_status: "open",
                    ticket_name: "Takeout Order",
                    guest_count: 1
                });

            expect(response.status).toBe(201);

            const updatedTable = await getTableById(table.id);

            expect(updatedTable.current_status).toBe("available");
        });

        it("should not mark table as occupied when creating a delivery order", async () => {
            const table = await createTestTable(4, "available");

            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: table.id,
                    order_type: "delivery",
                    order_status: "open",
                    ticket_name: "Delivery Order",
                    guest_count: 1
                });

            expect(response.status).toBe(201);

            const updatedTable = await getTableById(table.id);

            expect(updatedTable.current_status).toBe("available");
        });

        it("should return 400 if creating dine-in order for an occupied table", async () => {
            const table = await createTestTable(5, "occupied");

            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: table.id,
                    order_type: "dine_in",
                    order_status: "open",
                    ticket_name: "Occupied Table Order",
                    guest_count: 2
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if creating dine-in order for a dirty table", async () => {
            const table = await createTestTable(6, "dirty");

            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: table.id,
                    order_type: "dine_in",
                    order_status: "open",
                    ticket_name: "Dirty Table Order",
                    guest_count: 2
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if creating dine-in order for an out-of-service table", async () => {
            const table = await createTestTable(7, "out_of_service");

            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: table.id,
                    order_type: "dine_in",
                    order_status: "open",
                    ticket_name: "Out Of Service Table Order",
                    guest_count: 2
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if creating dine-in order with a table_id that does not exist", async () => {
            const fakeTableId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .post("/orders")
                .send({
                    table_id: fakeTableId,
                    order_type: "dine_in",
                    order_status: "open",
                    ticket_name: "Missing Table Order",
                    guest_count: 2
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});