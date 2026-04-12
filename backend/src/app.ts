import express from "express";

import { getDatabaseTime } from "./services/timeService.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/time", async (req, res) => {
    try {
        const time = await getDatabaseTime();
        res.json({ time });
    } catch (error) {
        console.error("Failed to fetch time:", error);
        res.status(500).json({ error: "Failed to fetch time" });
    }
});

export default app;