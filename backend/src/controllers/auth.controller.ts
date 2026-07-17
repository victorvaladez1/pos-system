import type { Request, Response } from "express";
import { getActiveUserByPasscode } from "../services/auth.service.js";

export const passcodeLogin = async (req: Request, res: Response) => {
    const { passcode } = req.body;

    if (!passcode || typeof passcode !== "string" || passcode.trim() === "") {
        return res.status(400).json({ error: "Passcode is required." });
    }

    try {
        const user = await getActiveUserByPasscode(passcode);

        if (!user) {
            return res.status(401).json({ error: "Invalid passcode." });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Failed to login with passcode.", error);
        return res.status(500).json({ error: "Failed to login with passcode." });
    }
};