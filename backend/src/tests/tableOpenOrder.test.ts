import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Table Open Order API", () => {
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

    const createTestTable = async (tableNumber: number) => {
        const response = await request(app)
            .post("/tables")
            .send({
                table_number: tableNumber,
                capacity: 4,
                current_status: "available"
            });

        return response.body.table;
    };

    const createDineInOrder = async (
        tableId: string,
        orderStatus = "open",
        ticketName = "Table Open Order Test"
    ) => {
        const response = await request(app)
            .post("/orders")
            .send({
                table_id: tableId,
                order_type: "dine_in",
                order_status: orderStatus,
                ticket_name: ticketName,
                guest_count: 2
            });

        return response.body.order;
    };

    describe("GET /tables/:id/open-order", () => {
        it("should return open order for a table", async () => {
            const table = await createTestTable(1);
            const order = await createDineInOrder(table.id, "open");

            const response = await request(app)
                .get(`/tables/${table.id}/open-order`);

            expect(response.status).toBe(200);
            expect(response.body.order).toBeDefined();
            expect(response.body.order.id).toBe(order.id);
            expect(response.body.order.table_id).toBe(table.id);
            expect(response.body.order.order_type).toBe("dine_in");
            expect(response.body.order.order_status).toBe("open");
        });

        it("should return submitted order for a table", async () => {
            const table = await createTestTable(2);
            const order = await createDineInOrder(table.id, "submitted");

            const response = await request(app)
                .get(`/tables/${table.id}/open-order`);

            expect(response.status).toBe(200);
            expect(response.body.order).toBeDefined();
            expect(response.body.order.id).toBe(order.id);
            expect(response.body.order.order_status).toBe("submitted");
        });

        it("should not return paid orders", async () => {
            const table = await createTestTable(3);

            await createDineInOrder(table.id, "paid");

            const response = await request(app)
                .get(`/tables/${table.id}/open-order`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should not return cancelled orders", async () => {
            const table = await createTestTable(4);

            await createDineInOrder(table.id, "cancelled");

            const response = await request(app)
                .get(`/tables/${table.id}/open-order`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return newest active order if more than one active order exists for the table", async () => {
            const table = await createTestTable(5);

            await createDineInOrder(table.id, "open", "Older Table Order");

            await sql`
                UPDATE tables
                SET current_status = 'available'
                WHERE id = ${table.id}
            `;

            const newestOrder = await createDineInOrder(
                table.id,
                "open",
                "Newest Table Order"
            );

            const response = await request(app)
                .get(`/tables/${table.id}/open-order`);

            expect(response.status).toBe(200);
            expect(response.body.order).toBeDefined();
            expect(response.body.order.id).toBe(newestOrder.id);
            expect(response.body.order.ticket_name).toBe("Newest Table Order");
        });

        it("should return 400 if table id is not a valid UUID", async () => {
            const response = await request(app)
                .get("/tables/not-a-valid-id/open-order");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if table does not exist", async () => {
            const fakeTableId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .get(`/tables/${fakeTableId}/open-order`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if table has no active order", async () => {
            const table = await createTestTable(6);

            const response = await request(app)
                .get(`/tables/${table.id}/open-order`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should include expected order fields", async () => {
            const table = await createTestTable(7);
            const order = await createDineInOrder(table.id, "open", "Field Check Order");

            const response = await request(app)
                .get(`/tables/${table.id}/open-order`);

            expect(response.status).toBe(200);

            expect(response.body.order).toMatchObject({
                id: order.id,
                table_id: table.id,
                server_id: null,
                order_type: "dine_in",
                order_status: "open",
                ticket_name: "Field Check Order",
                guest_count: 2,
                closed_at: null
            });

            expect(response.body.order.opened_at).toBeDefined();
            expect(response.body.order.created_at).toBeDefined();
            expect(response.body.order.updated_at).toBeDefined();
        });
    });
});