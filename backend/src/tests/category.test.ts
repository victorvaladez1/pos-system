import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Category API", () => {
    beforeEach(async () => {
        await sql`DELETE FROM order_item_modifiers`;
        await sql`DELETE FROM order_items`;
        await sql`DELETE FROM items`;
        await sql`DELETE FROM categories`;
    });

    describe("POST /categories", () => {
        it("should create a category", async () => {
            const response = await request(app)
                .post("/categories")
                .send({
                    name: "Tacos"
                });

            expect(response.status).toBe(201);
            expect(response.body.category).toBeDefined();
            expect(response.body.category.id).toBeDefined();
            expect(response.body.category.name).toBe("Tacos");
            expect(response.body.category.created_at).toBeDefined();
            expect(response.body.category.updated_at).toBeDefined();
        });

        it("should return 400 if name is missing", async () => {
            const response = await request(app)
                .post("/categories")
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if name is an empty string", async () => {
            const response = await request(app)
                .post("/categories")
                .send({
                    name: ""
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 409 if category name already exists", async () => {
            await request(app)
                .post("/categories")
                .send({
                    name: "Tacos"
                });

            const response = await request(app)
                .post("/categories")
                .send({
                    name: "Tacos"
                });

            expect(response.status).toBe(409);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /categories", () => {
        it("should return all categories", async () => {
            await request(app)
                .post("/categories")
                .send({
                    name: "Tacos"
                });

            await request(app)
                .post("/categories")
                .send({
                    name: "Burritos"
                });

            const response = await request(app).get("/categories");

            expect(response.status).toBe(200);
            expect(response.body.categories).toBeDefined();
            expect(Array.isArray(response.body.categories)).toBe(true);
            expect(response.body.categories.length).toBe(2);
        });

        it("should return an empty array if there are no categories", async () => {
            const response = await request(app).get("/categories");

            expect(response.status).toBe(200);
            expect(response.body.categories).toEqual([]);
        });
    });

    describe("PATCH /categories/:id", () => {
        it("should update a category", async () => {
            const createResponse = await request(app)
                .post("/categories")
                .send({
                    name: "Tacos"
                });

            const categoryId = createResponse.body.category.id;

            const updateResponse = await request(app)
                .patch(`/categories/${categoryId}`)
                .send({
                    name: "Burritos"
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.category).toBeDefined();
            expect(updateResponse.body.category.id).toBe(categoryId);
            expect(updateResponse.body.category.name).toBe("Burritos");
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .patch("/categories/not-a-valid-id")
                .send({
                    name: "Burritos"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if name is empty", async () => {
            const createResponse = await request(app)
                .post("/categories")
                .send({
                    name: "Tacos"
                });

            const categoryId = createResponse.body.category.id;

            const response = await request(app)
                .patch(`/categories/${categoryId}`)
                .send({
                    name: ""
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if category does not exist", async () => {
            const fakeId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/categories/${fakeId}`)
                .send({
                    name: "Quesadillas"
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 409 if updated name already exists", async () => {
            await request(app)
                .post("/categories")
                .send({
                    name: "Tacos"
                });

            const createResponse = await request(app)
                .post("/categories")
                .send({
                    name: "Burritos"
                });

            const burritoId = createResponse.body.category.id;

            const response = await request(app)
                .patch(`/categories/${burritoId}`)
                .send({
                    name: "Tacos"
                });

            expect(response.status).toBe(409);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("DELETE /categories/:id", () => {
        it("should delete a category", async () => {
            const createResponse = await request(app)
                .post("/categories")
                .send({
                    name: "Tacos"
                });

            const categoryId = createResponse.body.category.id;

            const deleteResponse = await request(app)
                .delete(`/categories/${categoryId}`);

            expect(deleteResponse.status).toBe(204);

            const getResponse = await request(app).get("/categories");

            expect(getResponse.status).toBe(200);
            expect(getResponse.body.categories).toEqual([]);
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .delete("/categories/not-a-valid-id");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if category does not exist", async () => {
            const fakeId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .delete(`/categories/${fakeId}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});