import "dotenv/config.js";
import express from "express";
import sql from "./db.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get("/health", (req, res) => {
    res.json({ status: "ok"});
});

app.get("/time", async (req, res) => {
    try {
        const result = await sql`SELECT NOW()`;
        res.json({time: result[0].now});
    } catch (error) {
        console.error("Failed to fetch time:", error);
        res.status(500).json({ error: "Failed to fetch time" });
    }
});

async function startServer() {
    try {
        const result = await sql`SELECT NOW()`;
        console.log("Database connected:", result);

        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}!`);
        });
    } catch (error) {
        console.log("Failed to connect to database:", error);
        process.exit(1);
    }
}   

startServer();