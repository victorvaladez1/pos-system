import { Request, Response } from "express";
import { getDatabaseTime } from "../services/time.service.js";

export async function getTimeFromDB(req: Request, res: Response) {
    try {
        const time = await getDatabaseTime();
        res.json({ time });
    } catch (error) {
        console.error("Failed to fetch time:", error);
        res.status(500).json({ error: "Failed to fetch time" });
    }
}