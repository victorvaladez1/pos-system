import type { NextFunction, Request, Response } from "express";
import { getUserRowById } from "../services/users.service.js";
import { validate as isUuid } from "uuid";
import { verifyAuthToken } from "../utils/jwt.js";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getBearerToken = (authorizationHeader: string | undefined) => {
    if (!authorizationHeader) {
        return undefined;
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return undefined;
    }

    return token;
}

const getUserIdFromRequest = (req: Request): string | undefined => {
    const bearerToken = getBearerToken(req.header("authorization"));

    if (bearerToken) {
        const payload = verifyAuthToken(bearerToken);
        return payload.userId;
    }

    const userIdHeader = req.header("x-user-id");

    if (!userIdHeader) {
        return undefined;
    }

    return userIdHeader;
}

export const requireUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = getUserIdFromRequest(req);

        if (!userId || !uuidRegex.test(userId)) {
            return res.status(401).json({
                error: "Valid user id is required."
            });
        }

        const user = await getUserRowById(userId);

        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
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