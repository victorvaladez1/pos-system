import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";
import {
    createAdminHeader,
    createManagerHeader,
    createXUserIdHeaderForRole,
    createTestUserWithRole
} from "./helpers/auth.js";

describe("Permissions API", () => {
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

    const createUserPayload = {
        first_name: "New",
        middle_name: null,
        last_name: "Employee",
        user_role: "server",
        passcode_hash: "9999",
        is_active: true
    };

    describe("Protected user management routes", () => {
        it("should allow admin to create a user", async () => {
            const authHeader = await createAdminHeader();

            const response = await request(app)
                .post("/users")
                .set(authHeader)
                .send(createUserPayload);

            expect(response.status).toBe(201);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.first_name).toBe("New");
        });

        it("should allow manager to create a user", async () => {
            const authHeader = await createManagerHeader();

            const response = await request(app)
                .post("/users")
                .set(authHeader)
                .send(createUserPayload);

            expect(response.status).toBe(201);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.first_name).toBe("New");
        });

        it("should return 401 if x-user-id is missing when creating a user", async () => {
            const response = await request(app)
                .post("/users")
                .send(createUserPayload);

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if x-user-id is not a valid UUID", async () => {
            const response = await request(app)
                .post("/users")
                .set("x-user-id", "not-a-valid-id")
                .send(createUserPayload);

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if x-user-id does not exist", async () => {
            const response = await request(app)
                .post("/users")
                .set("x-user-id", "00000000-0000-0000-0000-000000000000")
                .send(createUserPayload);

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if cashier tries to create a user", async () => {
            const authHeader = await createXUserIdHeaderForRole("cashier");

            const response = await request(app)
                .post("/users")
                .set(authHeader)
                .send(createUserPayload);

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if server tries to create a user", async () => {
            const authHeader = await createXUserIdHeaderForRole("server");

            const response = await request(app)
                .post("/users")
                .set(authHeader)
                .send(createUserPayload);

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if kitchen tries to create a user", async () => {
            const authHeader = await createXUserIdHeaderForRole("kitchen");

            const response = await request(app)
                .post("/users")
                .set(authHeader)
                .send(createUserPayload);

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if host tries to create a user", async () => {
            const authHeader = await createXUserIdHeaderForRole("host");

            const response = await request(app)
                .post("/users")
                .set(authHeader)
                .send(createUserPayload);

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should return 403 if inactive manager tries to create a user", async () => {
            const authHeader = await createXUserIdHeaderForRole("manager", false);

            const response = await request(app)
                .post("/users")
                .set(authHeader)
                .send(createUserPayload);

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should allow admin to update a user", async () => {
            const authHeader = await createAdminHeader();
            const employee = await createTestUserWithRole("server");

            const response = await request(app)
                .patch(`/users/${employee.id}`)
                .set(authHeader)
                .send({
                    first_name: "Updated"
                });

            expect(response.status).toBe(200);
            expect(response.body.user.first_name).toBe("Updated");
        });

        it("should return 403 if server tries to update a user", async () => {
            const authHeader = await createXUserIdHeaderForRole("server");
            const employee = await createTestUserWithRole("cashier");

            const response = await request(app)
                .patch(`/users/${employee.id}`)
                .set(authHeader)
                .send({
                    first_name: "Updated"
                });

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });

        it("should allow manager to deactivate a user", async () => {
            const authHeader = await createManagerHeader();
            const employee = await createTestUserWithRole("server");

            const response = await request(app)
                .delete(`/users/${employee.id}`)
                .set(authHeader);

            expect(response.status).toBe(200);
            expect(response.body.user.is_active).toBe(false);
        });

        it("should return 403 if cashier tries to deactivate a user", async () => {
            const authHeader = await createXUserIdHeaderForRole("cashier");
            const employee = await createTestUserWithRole("server");

            const response = await request(app)
                .delete(`/users/${employee.id}`)
                .set(authHeader);

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });
    });
});