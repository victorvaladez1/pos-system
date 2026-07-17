import type { NextFunction, Request, Response } from "express";
import { getUserRowById } from "../services/users.service.js";
import { validate as isUuid } from "uuid";

export const requireUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.header("x-user-id");

    if (!userId || !isUuid(userId)) {
        return res.status(401).json({ error: "Valid user id is required." });
    }

    try {
        const user = await getUserRowById(userId);

        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        res.locals.user = user;

        return next();
    } catch (error) {
        console.error("Failed to authenticate user.", error);
        return res.status(500).json({ error: "Failed to authenticate user." });
    }
};