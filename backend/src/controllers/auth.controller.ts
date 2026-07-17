import type { Request, Response } from "express";
import { getActiveUserByPasscode } from "../services/auth.service.js";
import { signAuthToken } from "../utils/jwt.js";

export const passcodeLogin = async (req: Request, res: Response) => {
    try {
        const { passcode } = req.body;

        if (!passcode || typeof passcode !== "string" || passcode.trim() === "") {
            return res.status(400).json({ error: "Passcode is required." });
        }

        const user = await getActiveUserByPasscode(passcode);

        if (!user) {
            return res.status(401).json({ error: "Invalid passcode." });
        }

        const token = signAuthToken(user.id);

        return res.status(200).json({ user, token });
    } catch (error) {
        console.error("Failed to login with passcode.", error);
        return res.status(500).json({ error: "Failed to login with passcode." });
    }
};