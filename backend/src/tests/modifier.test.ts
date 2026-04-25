import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Modifier API", () => {
    beforeEach(async () => {
        await sql`DELETE FROM order_item_modifiers`;
        
        await sql`DELETE FROM modifiers`;
    });

    describe("POST /modifiers", () => {
        it ("should create a modifier", async () => {
            const response = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });

            expect(response.status).toBe(201);
            expect(response.body.modifier).toBeDefined();
            expect(response.body.modifier.name).toBe("Extra Cheese");
            expect(response.body.modifier.price_in_cents).toBe(150);
            expect(response.body.modifier.created_at).toBeDefined();
            expect(response.body.modifier.updated_at).toBeDefined(); 
        });

        it ("should return 400 if name is missing", async () => {
            const response = await request(app)
                .post("/modifiers")
                .send({
                    price_in_cents: 150
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it ("should return 400 if name is an empty string", async () => {
            const response = await request(app)
                .post("/modifiers")
                .send({
                    name: "",
                    price_in_cents: 150
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it ("should return 400 if price_in_cents is missing", async () => {
            const response = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese"
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it ("should return 400 if price_in_cents is negative", async () => {
            const response = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_centss: -100
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if price_in_cents is not an integer", async () => {
            const response = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 1.5
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 409 if modifier name already exists", async () => {
            await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });
            
            const response = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 200
                });
            
            expect(response.status).toBe(409);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /modifiers", () => {
        it("should return all modifiers", async () => {
            await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });

            await request(app)
                .post("/modifiers")
                .send({
                    name: "Guacamole",
                    price_in_cents: 200
                });

            const response = await request(app).get("/modifiers");

            expect(response.status).toBe(200);
            expect(response.body.modifiers).toBeDefined();
            expect(Array.isArray(response.body.modifiers)).toBe(true);
            expect(response.body.modifiers.length).toBe(2);
        });

        it("should return an empty array if there are no modifiers", async () => {
            const response = await request(app).get("/modifiers");

            expect(response.status).toBe(200);
            expect(response.body.modifiers).toEqual([]);
        });
    });

    describe("PATCH /modifiers/:id", () => {
        it("should update a modifier name", async () => {
            const createResponse = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });

            const modifierId = createResponse.body.modifier.id;

            const updateResponse = await request(app)
                .patch(`/modifiers/${modifierId}`)
                .send({
                    name: "Extra Queso"
                });
            
            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.modifier).toBeDefined();
            expect(updateResponse.body.modifier.id).toBe(modifierId);
            expect(updateResponse.body.modifier.name).toBe("Extra Queso");
            expect(updateResponse.body.modifier.price_in_cents).toBe(150);
        });

        it("should update a modifier price", async () => {
            const createResponse = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });

            const modifierId = createResponse.body.modifier.id;

            const updateResponse = await request(app)
                .patch(`/modifiers/${modifierId}`)
                .send({
                    price_in_cents: 250
                });
            
            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.modifier.id).toBe(modifierId);
            expect(updateResponse.body.modifier.name).toBe("Extra Cheese");
            expect(updateResponse.body.modifier.price_in_cents).toBe(250);
        });

        it("should update a modifier name and price", async () => {
            const createResponse = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });

            const modifierId = createResponse.body.modifier.id;
            
            const updateResponse = await request(app)
                .patch(`/modifiers/${modifierId}`)
                .send({
                    name: "Guacamole",
                    price_in_cents: 200
                });
            
            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.modifier).toBeDefined();
            expect(updateResponse.body.modifier.id).toBe(modifierId);
            expect(updateResponse.body.modifier.name).toBe("Guacamole");
            expect(updateResponse.body.modfifier.price_in_cents).toBe(200);
        });
        
        it ("should return 400 if id is not valid UUID", async () => {
            const response = await request(app)
                .patch("/modifiers/not-a-valid-id")
                .send({
                    name: "Guacamole"
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if name is empty", async () => {
            const createResponse = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });

            const modifierId = createResponse.body.modifier.id;

            const response = await request(app)
                .patch(`/modifiers/${modifierId}`)
                .send({
                    name: ""
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        }); 

        it("should return 400 if price_in_cents is negative", async () => {
            const createResponse = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });

            const modifierId = createResponse.body.modifier.id;

            const response = await request(app)
                .patch(`/modifiers/${modifierId}`)
                .send({
                    price_in_cents: -50
                })
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if price_in_cents is not an integer", async () => {
            const createResponse = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });
            
            const modifierId = createResponse.body.modifier.id;

            const response = await request(app)
                .patch(`/modifiers/${modifierId}`)
                .send({
                    price_in_cents: 1.5
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if no valid fields are provided", async () => {
            const createResponse = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });
            
            const modifierId = createResponse.body.modifier.id;

            const response = await request(app)
                .patch(`/modifiers/${modifierId}`)
                .send({});
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if modifier does not exist", async () => {
            const fakeId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/modifiers/${fakeId}`)
                .send({
                    name: "Gaucamole"
                });
                
            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 409 if updated name already exists", async () => {
            await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });

            const createResponse = await request(app)
                .post("/modifiers")
                .send({
                    name: "Guacamole",
                    price_in_cents: 200
                });
            
            const guacamoleId = createResponse.body.modifier.id;

            const response = await request(app)
                .patch(`/modifiers/${guacamoleId}`)
                .send({
                    name: "Extra Cheese"
                });
            
            expect(response.status).toBe(409);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("DELETE /modifiers/:id", () => {
        it("should delete a modifier", async () => {
            const createResponse = await request(app)
                .post("/modifiers")
                .send({
                    name: "Extra Cheese",
                    price_in_cents: 150
                });
            
            const modifierId = createResponse.body.modifier.id;

            const deleteResponse = await request(app)
                .delete(`/modifiers/${modifierId}`);
            
            expect(deleteResponse.status).toBe(204);

            const getResponse = await request(app).get("/modifiers");

            expect(getResponse.status).toBe(200);
            expect(getResponse.body.modifiers).toEqual([]);
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .delete("/modifiers/not-a-valid-id");
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if modifier does not exist", async () => {
            const fakeId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .delete(`/modifiers/${fakeId}`);
            
            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});