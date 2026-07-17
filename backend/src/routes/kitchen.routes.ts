import { Router } from "express";
import { getKitchenOrderQueue } from "../controllers/kitchen.controller.js";
import { requireUser } from "../middleware/requireUser.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

router.get("/orders", requireUser, requireRole(["kitchen", "manager", "admin"]), getKitchenOrderQueue);

export default router;