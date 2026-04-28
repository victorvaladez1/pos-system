import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Table API", () => {
    beforeEach(async () => {
        await sql`DELETE FROM orders`;
        await sql`DELETE FROM tables`;
    });

    describe("POST /tables", () => {
        it("should create a table", async () => {
            const response = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "available"
                });
            
            expect(response.status).toBe(201);
            expect(response.body.table).toBeDefined();
            expect(response.body.table.id).toBeDefined();
            expect(response.body.table.table_number).toBe(1);
            expect(response.body.table.capacity).toBe(4);
            expect(response.body.table.curent_status).toBe("available");
            expect(response.body.table.created_at).toBeDefined();
            expect(response.body.table.updated_at).toBeDefined();
        });

        it("should return 400 if table_number is missing", async () => {
            const response = await request(app)
                .post("/tables")
                .send({
                    capacity: 4,
                    current_status: "available"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it ("should return 400 if table_number is not an integer", async () => {
            const response = await request(app)
                .post("/table")
                .send({
                    table_number: 1.5,
                    capacity: 4,
                    current_status: "available"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it ("should return 400 if capacity is not positive", async () => {
            const response = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 0,
                    current_status: "available"
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it ("should return 400 if capacity is not an integer", async () => {
            const response = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4.5,
                    current_status: "available"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        }); 

        it ("should return 400 if current_status is missing", async () => {
            const response = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if current_status is invalid", async () => {
            const response = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "cleaning"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 409 if table_number already exists", async () => {
            const createResponse = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "available"
                });

            expect(createResponse.status).toBe(201);

            const response = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 6,
                    current_status: "available"
                });
            
            expect(response.status).toBe(409);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /tables", () => {
        it("should return all tables", async () => {
            await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "available"
                });

            await request(app)
                .post("/table")
                .send({
                    table_number: 2,
                    capacity: 6,
                    current_status: "occupied"
                });

            const response = await request(app).get("/tables");

            expect(response.status).toBe(200);
            expect(response.body.tables).toBeDefined();
            expect(Array.isArray(response.body.tables)).toBe(true);
            expect(response.body.tables.length).toBe(2);
        });

        it ("should return an empty array if there are no tables", async () => {
            const response = await request(app).get("/tables");

            expect(response.status).toBe(200);
            expect(response.body.tables).toEqual([]);
        });
    }); 

    describe("PATCH /tables/:id", () => {
        it ("should update a table number", async () => {
            const createResponse = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "available"
                });

            const tableId = createResponse.body.table.id;

            const updateResponse = await request(app)
                .patch(`/tables/${tableId}`)
                .send({
                    table_number: 10
                });
            
            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.table).toBeDefined();
            expect(updateResponse.body.table.id).toBe(tableId);
            expect(updateResponse.body.table.table_number).toBe(10);
            expect(updateResponse.body.table.capacity).toBe(4);
            expect(updateResponse.body.table.current_status).toBe("available");
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .patch("/tables/not-a-valid-id")
                .send({
                    current_status: "occupied"
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if table_number is not an integer", async () => {
            const createResponse = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "available"
                });

            const tableId = createResponse.body.table.id;

            const response = await request(app)
                .patch(`/tables/${tableId}`)
                .send({
                    table_number: 1.5
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if capacity is not positive", async () => {
            const createResponse = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "available"
                });
            
            const tableId = createResponse.body.table.id;

            const response = await request(app)
                .patch(`/tables/${tableId}`)
                .send({
                    capacity: 0
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if capacity is not an integer", async () => {
            const createResponse = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "available"
                });

            const tableId = createResponse.body.table.id;

            const response = await request(app)
                .patch(`/tables/${tableId}`)
                .send({
                    capacity: 4.5
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if current_status is invalid", async () => {
            const createResponse = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "available"
                });

            const tableId = createResponse.body.table.id;
            const response = await request(app)
                .patch(`/tables/${tableId}`)
                .send({
                    current_status: "cleaning"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if no valid fields are provided", async () => {
            const createResponse = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "available"
                });

            const tableId = createResponse.body.table.id;
            const response = await request(app)
                .patch(`/tables/${tableId}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if table does not exist", async () => {
            const fakeId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .patch(`/tables/${fakeId}`)
                .send({
                    current_status: "dirty"
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();

        });

        it("should return 409 if updated table_number already exists", async () => {
            await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "available"
                });

            const createResponse = await request(app)
                .post("/tables")
                .send({
                    table_number: 2,
                    capacity: 6,
                    current_status: "available"
                });

            const tableId = createResponse.body.table.id;
            const response = await request(app)
                .patch(`/tables/${tableId}`)
                .send({
                    table_number: 1
                });

            expect(response.status).toBe(409);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("DELETE /tables/:id", () => {
        it("should delete a table", async () => {
            const createResponse = await request(app)
                .post("/tables")
                .send({
                    table_number: 1,
                    capacity: 4,
                    current_status: "available"
                });

            const tableId = createResponse.body.table.id;

            const deleteResponse = await request(app)
                .delete(`/tables/${tableId}`);

            expect(deleteResponse.status).toBe(204);

            const getResponse = await request(app).get("/tables");

            expect(getResponse.status).toBe(200);
            expect(getResponse.body.tables).toEqual([]);
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .delete("/tables/not-a-valid-id");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if table does not exist", async () => {
            const fakeId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .delete(`/tables/${fakeId}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    }); 
});