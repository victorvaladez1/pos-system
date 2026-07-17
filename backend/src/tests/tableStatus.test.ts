import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Table Status API", () => {
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

    const createTestTable = async () => {
        const response = await request(app)
            .post("/tables")
            .send({
                table_number: Math.floor(Math.random() * 100000),
                capacity: 4,
                current_status: "available"
            });

        return response.body.table;
    };

    describe("PATCH /tables/:id/status", () => {
        it("should update table status to occupied", async () => {
            const table = await createTestTable();

            const response = await request(app)
                .patch(`/tables/${table.id}/status`)
                .send({
                    current_status: "occupied"
                });

            expect(response.status).toBe(200);
            expect(response.body.table).toBeDefined();
            expect(response.body.table.id).toBe(table.id);
            expect(response.body.table.current_status).toBe("occupied");
        });

        it("should update table status to dirty", async () => {
            const table = await createTestTable();

            const response = await request(app)
                .patch(`/tables/${table.id}/status`)
                .send({
                    current_status: "dirty"
                });

            expect(response.status).toBe(200);
            expect(response.body.table).toBeDefined();
            expect(response.body.table.id).toBe(table.id);
            expect(response.body.table.current_status).toBe("dirty");
        });

        it("should update table status to available", async () => {
            const table = await createTestTable();

            await request(app)
                .patch(`/tables/${table.id}/status`)
                .send({
                    current_status: "dirty"
                });

            const response = await request(app)
                .patch(`/tables/${table.id}/status`)
                .send({
                    current_status: "available"
                });

            expect(response.status).toBe(200);
            expect(response.body.table).toBeDefined();
            expect(response.body.table.id).toBe(table.id);
            expect(response.body.table.current_status).toBe("available");
        });

        it("should update table status to reserved", async () => {
            const table = await createTestTable();

            const response = await request(app)
                .patch(`/tables/${table.id}/status`)
                .send({
                    current_status: "reserved"
                });

            expect(response.status).toBe(200);
            expect(response.body.table).toBeDefined();
            expect(response.body.table.id).toBe(table.id);
            expect(response.body.table.current_status).toBe("reserved");
        });

        it("should update table status to out_of_service", async () => {
            const table = await createTestTable();

            const response = await request(app)
                .patch(`/tables/${table.id}/status`)
                .send({
                    current_status: "out_of_service"
                });

            expect(response.status).toBe(200);
            expect(response.body.table).toBeDefined();
            expect(response.body.table.id).toBe(table.id);
            expect(response.body.table.current_status).toBe("out_of_service");
        });

        it("should return 400 if table id is not a valid UUID", async () => {
            const response = await request(app)
                .patch("/tables/not-a-valid-id/status")
                .send({
                    current_status: "dirty"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if current_status is missing", async () => {
            const table = await createTestTable();

            const response = await request(app)
                .patch(`/tables/${table.id}/status`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if current_status is invalid", async () => {
            const table = await createTestTable();

            const response = await request(app)
                .patch(`/tables/${table.id}/status`)
                .send({
                    current_status: "cleaning"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if table does not exist", async () => {
            const fakeTableId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/tables/${fakeTableId}/status`)
                .send({
                    current_status: "dirty"
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should update updated_at when status changes", async () => {
            const table = await createTestTable();

            await new Promise((resolve) => setTimeout(resolve, 10));

            const response = await request(app)
                .patch(`/tables/${table.id}/status`)
                .send({
                    current_status: "occupied"
                });

            expect(response.status).toBe(200);
            expect(response.body.table.updated_at).toBeDefined();
            expect(new Date(response.body.table.updated_at).getTime()).toBeGreaterThan(
                new Date(table.updated_at).getTime()
            );
        });
    });
});