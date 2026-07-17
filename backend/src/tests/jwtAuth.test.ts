import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import sql from "../db.js";

describe("JWT authentication", () => {
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
        userRole: string,
        passcode = "2345",
        isActive = true
    ) => {
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
                ${"Test"},
                ${null},
                ${"User"},
                ${userRole}::user_role_enum,
                ${passcode},
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

    it("should allow a manager to access reports with a JWT", async () => {
        await createTestUser("manager", "2345");

        const loginResponse = await request(app)
            .post("/auth/passcode-login")
            .send({
                passcode: "2345"
            });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.token).toBeDefined();

        const response = await request(app)
            .get("/reports/daily-sales")
            .set("Authorization", `Bearer ${loginResponse.body.token}`);

        expect(response.status).toBe(200);
        expect(response.body.report).toBeDefined();
    });

    it("should return 401 for an invalid JWT", async () => {
        const response = await request(app)
            .get("/reports/daily-sales")
            .set("Authorization", "Bearer invalid-token");

        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
    });
});