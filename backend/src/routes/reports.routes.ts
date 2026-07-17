import { Router } from "express";
import { getDailySales } from "../controllers/reports.controller.js";
import { requireUser } from "../middleware/requireUser.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

const requireReportRole = [
    requireUser,
    requireRole(["manager", "admin"])
];

router.get("/daily-sales", requireReportRole, getDailySales);

export default router;