import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../types/user.types.js";

export const requireRole = (allowedRoles: UserRole[]) => {
    return (_req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.user;

        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: "User is inactive" });
        }

        if (!allowedRoles.includes(user.user_role)) {
            return res.status(403).json({ error: "User does not have permission" });
        }

        return next();
    };
};

