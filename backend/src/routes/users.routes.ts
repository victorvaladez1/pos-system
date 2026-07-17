import { Router } from "express";
import {
    createUser,
    getUsers,
    updateUser,
    deactivateUser
} from "../controllers/users.controller.js";

import { requireUser } from "../middleware/requireUser.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

const requireManagerOrAdmin = [
    requireUser,
    requireRole(["manager", "admin"])
];

router.post("/", requireManagerOrAdmin, createUser);
router.get("/", getUsers);
router.patch("/:id", requireManagerOrAdmin, updateUser);
router.delete("/:id", requireManagerOrAdmin, deactivateUser);

export default router;