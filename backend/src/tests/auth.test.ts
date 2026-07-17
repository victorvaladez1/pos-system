import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";
import { hashPasscode } from "../utils/passcode.js";
import { createTestUserWithRole } from "./helpers/auth.js";
import { signAuthToken } from "../utils/jwt.js";

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
        passcode = "1234",
        isActive = true,
        firstName = "Test",
        userRole = "server"
    ) => {
        const hashedPasscode = await hashPasscode(passcode);

        const result = await sql`
            INSERT INTO users (
                first_name,
                middle_name,
                last_name,
                user_role,
                passcode_hash,
                is_active
            )
            VALUES (
                ${firstName},
                ${null},
                ${"User"},
                ${userRole}::user_role_enum,
                ${hashedPasscode},
                ${isActive}
            )
            RETURNING
                id,
                first_name,
                middle_name,
                last_name,
                user_role,
                is_active,
                created_at,
                updated_at
        `;

        return result[0];
    };

    describe("POST /auth/passcode-login", () => {
        it("should login an active user with matching passcode and return a token", async () => {
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

            expect(response.body.token).toBeDefined();
            expect(typeof response.body.token).toBe("string");
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
            expect(response.body.token).toBeDefined();
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
            await createTestUser("1234", false, "Inactive", "server");

            const activeUser = await createTestUser(
                "1234",
                true,
                "Active",
                "cashier"
            );

            const response = await request(app)
                .post("/auth/passcode-login")
                .send({
                    passcode: "1234"
                });

            expect(response.status).toBe(200);
            expect(response.body.user.id).toBe(activeUser.id);
            expect(response.body.user.first_name).toBe("Active");
            expect(response.body.user.user_role).toBe("cashier");

            expect(response.body.token).toBeDefined();
            expect(typeof response.body.token).toBe("string");
        });
    });
});

describe("GET /auth/me", () => {
    it("should return the current user with a valid JWT", async () => {
        const user = await createTestUserWithRole("manager");
        const token = signAuthToken(user.id);

        const response = await request(app)
            .get("/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.user).toBeDefined();
        expect(response.body.user.id).toBe(user.id);
        expect(response.body.user.first_name).toBe(user.first_name);
        expect(response.body.user.last_name).toBe(user.last_name);
        expect(response.body.user.user_role).toBe("manager");
        expect(response.body.user.passcode_hash).toBeUndefined();
    });

    it("should return 401 if authorization header is missing", async () => {
        const response = await request(app)
            .get("/auth/me");

        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
    });

    it("should return 401 if authorization header is malformed", async () => {
        const response = await request(app)
            .get("/auth/me")
            .set("Authorization", "Bad token");

        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
    });

    it("should return 401 if JWT is invalid", async () => {
        const response = await request(app)
            .get("/auth/me")
            .set("Authorization", "Bearer invalid-token");

        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
    });

    it("should return 401 if JWT belongs to a user that does not exist", async () => {
        const token = signAuthToken("00000000-0000-0000-0000-000000000000");

        const response = await request(app)
            .get("/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
    });
});