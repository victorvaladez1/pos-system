import { Request, Response, NextFunction } from "express";
import { getUserRowById } from "../services/users.service.js";
import { verifyAuthToken } from "../utils/jwt.js";

export const requireUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Authorization bearer token is required."
            });
        }

        const token = authHeader.replace("Bearer ", "");
        const payload = verifyAuthToken(token);

        const user = await getUserRowById(payload.userId);

        if (!user) {
            return res.status(401).json({
                error: "Valid authentication token is required."
            });
        }

        res.locals.user = user;

        return next();
    } catch (error) {
        if (process.env.NODE_ENV !== "test") {
            console.error("Failed to authenticate user.", error);
        }

        return res.status(401).json({
            error: "Valid authentication token is required."
        });
    }
};