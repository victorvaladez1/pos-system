import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("User API", () => {
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

    const createTestUser = async () => {
        const response = await request(app)
            .post("/users")
            .send({
                first_name: "Test",
                middle_name: "Middle",
                last_name: "User",
                user_role: "server",
                passcode_hash: "hashed-passcode-123",
                is_active: true
            });

        return response.body.user;
    };

    describe("POST /users", () => {
        it("should create a user", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    middle_name: "Middle",
                    last_name: "User",
                    user_role: "server",
                    passcode_hash: "hashed-passcode-123",
                    is_active: true
                });

            expect(response.status).toBe(201);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.id).toBeDefined();
            expect(response.body.user.first_name).toBe("Test");
            expect(response.body.user.middle_name).toBe("Middle");
            expect(response.body.user.last_name).toBe("User");
            expect(response.body.user.user_role).toBe("server");
            expect(response.body.user.is_active).toBe(true);
            expect(response.body.user.created_at).toBeDefined();
            expect(response.body.user.updated_at).toBeDefined();
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should create a user with null middle_name", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    middle_name: null,
                    last_name: "User",
                    user_role: "cashier",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(201);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.middle_name).toBeNull();
            expect(response.body.user.is_active).toBe(true);
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should create a user without middle_name", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    last_name: "User",
                    user_role: "cashier",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(201);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.middle_name).toBeNull();
            expect(response.body.user.is_active).toBe(true);
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should create an inactive user", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    middle_name: null,
                    last_name: "User",
                    user_role: "kitchen",
                    passcode_hash: "hashed-passcode-123",
                    is_active: false
                });

            expect(response.status).toBe(201);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.is_active).toBe(false);
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should return 400 if first_name is missing", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    last_name: "User",
                    user_role: "server",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if first_name is empty", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "",
                    last_name: "User",
                    user_role: "server",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if first_name is not a string", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: 123,
                    last_name: "User",
                    user_role: "server",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if middle_name is empty", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    middle_name: "",
                    last_name: "User",
                    user_role: "server",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if middle_name is not a string or null", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    middle_name: 123,
                    last_name: "User",
                    user_role: "server",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if last_name is missing", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    user_role: "server",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if last_name is empty", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    last_name: "",
                    user_role: "server",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if last_name is not a string", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    last_name: 123,
                    user_role: "server",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if user_role is missing", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    last_name: "User",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if user_role is invalid", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    last_name: "User",
                    user_role: "owner",
                    passcode_hash: "hashed-passcode-123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if passcode_hash is missing", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    last_name: "User",
                    user_role: "server"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if passcode_hash is empty", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    last_name: "User",
                    user_role: "server",
                    passcode_hash: ""
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if passcode_hash is not a string", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    last_name: "User",
                    user_role: "server",
                    passcode_hash: 123
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if is_active is not a boolean", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    first_name: "Test",
                    last_name: "User",
                    user_role: "server",
                    passcode_hash: "hashed-passcode-123",
                    is_active: "true"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /users", () => {
        it("should return all users", async () => {
            const firstUser = await createTestUser();

            const secondCreateResponse = await request(app)
                .post("/users")
                .send({
                    first_name: "Example",
                    middle_name: null,
                    last_name: "Employee",
                    user_role: "cashier",
                    passcode_hash: "hashed-passcode-456",
                    is_active: true
                });

            expect(secondCreateResponse.status).toBe(201);

            const response = await request(app)
                .get("/users");

            expect(response.status).toBe(200);
            expect(response.body.users).toBeDefined();
            expect(Array.isArray(response.body.users)).toBe(true);
            expect(response.body.users.length).toBe(2);

            const ids = response.body.users.map((user: { id: string }) => user.id);

            expect(ids).toContain(firstUser.id);
            expect(ids).toContain(secondCreateResponse.body.user.id);

            for (const user of response.body.users) {
                expect(user.passcode_hash).toBeUndefined();
            }
        });

        it("should return an empty array if there are no users", async () => {
            const response = await request(app)
                .get("/users");

            expect(response.status).toBe(200);
            expect(response.body.users).toBeDefined();
            expect(response.body.users).toEqual([]);
        });
    });

    describe("PATCH /users/:id", () => {
        it("should update first_name", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    first_name: "Updated"
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.id).toBe(user.id);
            expect(response.body.user.first_name).toBe("Updated");
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should update middle_name", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    middle_name: "UpdatedMiddle"
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.middle_name).toBe("UpdatedMiddle");
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should update middle_name to null", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    middle_name: null
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.middle_name).toBeNull();
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should update last_name", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    last_name: "UpdatedLast"
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.last_name).toBe("UpdatedLast");
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should update user_role", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    user_role: "manager"
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.user_role).toBe("manager");
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should update passcode_hash without returning it", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    passcode_hash: "new-hashed-passcode-789"
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.id).toBe(user.id);
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should update is_active", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    is_active: false
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.is_active).toBe(false);
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should update multiple user fields", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    first_name: "Updated",
                    middle_name: null,
                    last_name: "Employee",
                    user_role: "admin",
                    is_active: false
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.first_name).toBe("Updated");
            expect(response.body.user.middle_name).toBeNull();
            expect(response.body.user.last_name).toBe("Employee");
            expect(response.body.user.user_role).toBe("admin");
            expect(response.body.user.is_active).toBe(false);
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .patch("/users/not-a-valid-id")
                .send({
                    first_name: "Updated"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if first_name is empty", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    first_name: ""
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if first_name is not a string", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    first_name: 123
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if middle_name is empty", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    middle_name: ""
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if middle_name is not a string or null", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    middle_name: 123
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if last_name is empty", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    last_name: ""
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if last_name is not a string", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    last_name: 123
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if user_role is invalid", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    user_role: "owner"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if passcode_hash is empty", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    passcode_hash: ""
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if passcode_hash is not a string", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    passcode_hash: 123
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if is_active is not a boolean", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({
                    is_active: "false"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if no valid fields are provided", async () => {
            const user = await createTestUser();

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if user does not exist", async () => {
            const fakeUserId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .patch(`/users/${fakeUserId}`)
                .send({
                    first_name: "Updated"
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("DELETE /users/:id", () => {
        it("should deactivate a user", async () => {
            const user = await createTestUser();

            const deleteResponse = await request(app)
                .delete(`/users/${user.id}`);

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body.user).toBeDefined();
            expect(deleteResponse.body.user.id).toBe(user.id);
            expect(deleteResponse.body.user.is_active).toBe(false);
            expect(deleteResponse.body.user.passcode_hash).toBeUndefined();
        });

        it("should return 400 if id is not a valid UUID", async () => {
            const response = await request(app)
                .delete("/users/not-a-valid-id");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 404 if user does not exist", async () => {
            const fakeUserId = "00000000-0000-0000-0000-000000000000";

            const response = await request(app)
                .delete(`/users/${fakeUserId}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});