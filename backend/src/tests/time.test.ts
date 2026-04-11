import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app.js";

describe("GET /time", () => {
    it("should return a time value", async () => {
        const response = await request(app).get("/time");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("time");
    });
});