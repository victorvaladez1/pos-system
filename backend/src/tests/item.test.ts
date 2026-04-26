import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Item API", () => {
    beforeEach(async () => {
        await sql`DELETE FROM order_item_modifiers`;
        await sql`DELETE FROM order_items`;
        await sql`DELETE FROM items`;
        await sql`DELETE FROM categories`;
    });

    const createTestCategory = async () => {
        const response = await request(app)
            .post("/categories")
            .send({
                name: "Tacos"
            });

        return response.body.category;
    };

    describe("POST /items", () => {
        it("should create an item", async () => {
            const category = await createTestCategory();

            const response = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    description: "Chicken taco with cilantro and onion",
                    price_in_cents: 299,
                    category_id: category.id
                });

            expect(response.status).toBe(201);
            expect(response.body.item).toBeDefined();
            expect(response.body.item.id).toBeDefined();
            expect(response.body.item.name).toBe("Chicken Taco");
            expect(response.body.item.description).toBe("Chicken taco with cilantro and onion");
            expect(response.body.item.price_in_cents).toBe(299);
            expect(response.body.item.category_id).toBe(category.id);
            expect(response.body.item.is_active).toBe(true);
            expect(response.body.item.created_at).toBeDefined();
            expect(response.body.item.updated_at).toBeDefined();
        });

        it("should create an item with a null description", async () => {
            const category = await createTestCategory();

            const response = await request(app)
                .post("/items")
                .send({
                    name: "Beef Taco",
                    description: null,
                    price_in_cents: 349,
                    category_id: category.id
                });
            
            expect(response.status).toBe(201);
            expect(response.body.item).toBeDefined();
            expect(response.body.item.name).toBe("Beef Taco");
            expect(response.body.item.description).toBeNull();
            expect(response.body.item.price_in_cents).toBe(349);
            expect(response.body.item.category_id).toBe(category.id);      
        });

        it("should create an inactive item", async () => {
            const category = await createTestCategory();

            const response = await request(app)
                .post("/items")
                .send({
                    name: "Old Menu Item",
                    description: "No longer sold",
                    price_in_cents: 499,
                    category_id: category.id,
                    is_active: false
                });
            
            expect(response.status).toBe(201);
            expect(response.body.item).toBeDefined();
            expect(response.body.item.name).toBe("Old Menu Item");
            expect(response.body.item.is_active).toBe(false);
        });

        it("should return 400 if name is missing", async () => {
            const category = await createTestCategory();

            const response = await request(app)
                .post("/items")
                .send({
                    price_in_cents: 299,
                    category_id: category.id
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if name is an empty string", async () => {
            const category = await createTestCategory();

            const response = await request(app)
                .post("/items")
                .send({
                    name: "",
                    price_in_cents: 299,
                    category_id: category.id
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
        
        it("should return 400 if price_in_cents is missing", async () => {
            const category = await createTestCategory();

            const response = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    category_id: category.id
                });

            expect(response.status).toBe(400);
            expect(response.error).toBeDefined();
        });

        it("should return 400 if price_in_cents is negative", async () => {
            const category = await createTestCategory();

            const response = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: -100,
                    category_id: category.id
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if price_in_cents is not an integer", async () => {
            const category = await createTestCategory();

            const response = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 2.99,
                    category_id: category.id
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if category_id is missing", async () => {
            const response = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if category_id is not a valid UUID", async () => {
            const response = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: "not-a-valid-id"
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if is_active is not a boolean", async () => {
            const category = await createTestCategory();

            const response = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id,
                    is_active: "true"
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if category does not exist", async () => {
            const fakeCategoryId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: fakeCategoryId
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 409 if item name already exists", async () => {
            const category = await createTestCategory();

            await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category: category.id
                });

            const response = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 399,
                    category_id: category.id
                });

            expect(response.status).toBe(409);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("PATCH /items/:id", () => {
        it("should update an item name", async () => {
            const category = await createTestCategory();

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });

            const itemId = createResponse.body.item.id;

            const updateResponse = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    name: "Steak Taco"
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.item).toBeDefined();
            expect(updateResponse.body.item.id).toBe(itemId);
            expect(updateResponse.body.item.name).toBe("Steak Taco");
            expect(updateResponse.body.item.price_in_cents).toBe(299);
            expect(updateResponse.body.item.category_id).toBe(category.id);
        });

        it("should update an item description", async () => {
            const category = await createTestCategory();

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    description: "Old description",
                    price_in_cents: 299,
                    category_id: category.id
                });

            const itemId = createResponse.body.item.id;

            const updateResponse = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    description: "New description"
                });
            
            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.item).toBeDefined();
            expect(updateResponse.body.item.id).toBe(itemId);
            expect(updateResponse.body.item.decription).toBe("New description");
        });

        it("should update an item description to null", async () => {
            const category = await createTestCategory();
            
            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    description: "Old description",
                    price_in_cents: 299,
                    category_id: category.id
                });
            
            const itemId = createResponse.body.item.id;

            const updateResponse = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    description: null
                });
            
            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.item).toBeDefined();
            expect(updateResponse.body.item.id).toBe(itemId);
            expect(updateResponse.body.item.description).toBeNull();
        });

        it ("should update an item price", async () => {
            const category = await createTestCategory();

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });

            const itemId = createResponse.body.item.id;

            const updateResponse = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    price_in_cents: 399
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.item).toBeDefined();
            expect(updateResponse.body.item.id).toBe(itemId);
            expect(updateResponse.body.item.price_in_cents).toBe(399);
        });

        it ("should update an item category", async () => {
            const firstCategory = await createTestCategory();

            const secondCategoryResponse = await request(app)
                .post("/categories")
                .send({
                    name: "Burritos"
                });
            
            const secondCategory = secondCategoryResponse.body.category;
            
            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: firstCategory.id
                });

            const itemId = createResponse.body.item.id;

            const updateResponse = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    category_id: secondCategory.id
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.item).toBeDefined();
            expect(updateResponse.body.item.id).toBe(itemId);
            expect(updateResponse.body.item.category_id).toBe(secondCategory.id);
        });

        it ("should update item active status", async () => {
            const category = await createTestCategory();

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });

            const itemId = createResponse.body.item.id;

            const updateResponse = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    is_active: false
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.item).toBeDefined();
            expect(updateResponse.body.item.id).toBe(itemId);
            expect(updateResponse.body.item.is_active).toBe(false);
        });

        it("should update multiple item fields", async () => {
            const category = await createTestCategory();
            
            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    description: "Old description",
                    price_in_cents: 299,
                    category: category.id
                });

            const itemId = createResponse.body.item.id;

            const updateResponse = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    name: "Steak Taco",
                    description: "Steack taco with cilantro and onion",
                    price_in_cents: 449,
                    is_active: false
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.item).toBeDefined();
            expect(updateResponse.body.item.id).toBe(itemId);
            expect(updateResponse.body.item.name).toBe("Steak Taco");
            expect(updateResponse.body.item.description).toBe("Steack taco with cilantro and onion");
            expect(updateResponse.body.item.price_in_cents).toBe(449);
            expect(updateResponse.body.item.is_active).toBe(false);
        });

        it("should return 400 if id is not valid UUID", async () => {
            const response = await request(app)
                .patch("/items/not-a-valid-id")
                .send({
                    name: "Steak Taco"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if name is empty", async () => {
            const category = await createTestCategory();

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });

            const itemId = createResponse.body.item.id;

            const response = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    name: ""
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if price_in_cents is negative", async () => {
            const category = await createTestCategory();

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });
            
            const itemId = createResponse.body.item.id;

            const response = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    price_in_cents: -100
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if price_in_cents is not an integer", async () => {
            const category = await createTestCategory();

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });

            const itemId = createResponse.body.item.id;

            const response = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    price_in_cents: 2.99
                });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if category_id is not valid UUID", async () => {
            const category = await createTestCategory();

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });

            const itemId = createResponse.body.item.id;

            const response = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    category_id: "not-a-valid-id"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if is_active is not a boolean", async () => {
            const category = await createTestCategory();

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });
            
            const itemId = createResponse.body.item.id;

            const response = await request(app)
                .patch(`/items/${itemId}`)
                .send({
                    is_active: "false"
                })
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if no valid fields are provided", async () => {
            const category = await createTestCategory();
            
            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });
            
            const itemId = createResponse.body.item.id;

            const response = await request(app)
                .patch(`/items/${itemId}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if item does not exist", async () => {
            const fakeItemId = "00000000-0000-0000-0000-000000000000";
            
            const response = await request(app)
                .patch(`/items/${fakeItemId}`)
                .send({
                    name: "Steak Taco"
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if updated category does not exist", async () => {
            const category = await createTestCategory();

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });
            
            const itemId = createResponse.body.item.id;
            const fakeCategoryId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/status/${itemId}`)
                .send({
                    category_id: fakeCategoryId
                });
            
            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
        
        it("should return 409 if updated item name already exists", async () => {
            const category = await createTestCategory();

            await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Beef Taco",
                    price_in_cents: 349,
                    category_id: category.id
                });
            
            const beefTacoId = createResponse.body.item.id;

            const response = await request(app)
                .patch(`/items/${beefTacoId}`)
                .send({
                    name: "Chicken Taco"
                });
            
            expect(response.status).toBe(409);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("DELETE /items/:id", () => {
        it("should delete an item", async () => {
            const category = await createTestCategory();

            const createResponse = await request(app)
                .post("/items")
                .send({
                    name: "Chicken Taco",
                    price_in_cents: 299,
                    category_id: category.id
                });

            const itemId = createResponse.body.item.id;

            const deleteResponse = await request(app)
                .delete(`/items/${itemId}`);

            expect(deleteResponse.status).toBe(204);

            const getResponse = await request(app).get("/items");

            expect(getResponse.status).toBe(200);
            expect(getResponse.body.items).toEqual([]);
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .delete("/items/not-a-valid-id");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if item does not exist", async () => {
            const fakeItemId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .delete(`/items/${fakeItemId}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});