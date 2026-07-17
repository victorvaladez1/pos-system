import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("Auth API", () => {
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

    const createTestUser = async (
        passcodeHash = "1234",
        isActive = true
    ) => {
        const response = await request(app)
            .post("/users")
            .send({
                first_name: "Test",
                middle_name: null,
                last_name: "User",
                user_role: "server",
                passcode_hash: passcodeHash,
                is_active: isActive
            });

        return response.body.user;
    };

    describe("POST /auth/passcode-login", () => {
        it("should login an active user with matching passcode", async () => {
            const user = await createTestUser("1234", true);

            const response = await request(app)
                .post("/auth/passcode-login")
                .send({
                    passcode: "1234"
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.id).toBe(user.id);
            expect(response.body.user.first_name).toBe("Test");
            expect(response.body.user.last_name).toBe("User");
            expect(response.body.user.user_role).toBe("server");
            expect(response.body.user.is_active).toBe(true);
        });

        it("should not return passcode_hash", async () => {
            await createTestUser("1234", true);

            const response = await request(app)
                .post("/auth/passcode-login")
                .send({
                    passcode: "1234"
                });

            expect(response.status).toBe(200);
            expect(response.body.user.passcode_hash).toBeUndefined();
        });

        it("should return 400 if passcode is missing", async () => {
            const response = await request(app)
                .post("/auth/passcode-login")
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if passcode is empty", async () => {
            const response = await request(app)
                .post("/auth/passcode-login")
                .send({
                    passcode: ""
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 if passcode is not a string", async () => {
            const response = await request(app)
                .post("/auth/passcode-login")
                .send({
                    passcode: 1234
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if passcode does not match any user", async () => {
            await createTestUser("1234", true);

            const response = await request(app)
                .post("/auth/passcode-login")
                .send({
                    passcode: "9999"
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should return 401 if matching user is inactive", async () => {
            await createTestUser("1234", false);

            const response = await request(app)
                .post("/auth/passcode-login")
                .send({
                    passcode: "1234"
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("should login the active user if inactive user has same passcode", async () => {
            await createTestUser("1234", false);

            const activeUserResponse = await request(app)
                .post("/users")
                .send({
                    first_name: "Active",
                    middle_name: null,
                    last_name: "User",
                    user_role: "cashier",
                    passcode_hash: "1234",
                    is_active: true
                });

            const activeUser = activeUserResponse.body.user;

            const response = await request(app)
                .post("/auth/passcode-login")
                .send({
                    passcode: "1234"
                });

            expect(response.status).toBe(200);
            expect(response.body.user.id).toBe(activeUser.id);
            expect(response.body.user.first_name).toBe("Active");
            expect(response.body.user.user_role).toBe("cashier");
        });
    });
});