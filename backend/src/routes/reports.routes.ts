import { Router } from "express";
import { getDailySales, getPaymentMethods } from "../controllers/reports.controller.js";
import { requireUser } from "../middleware/requireUser.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

const requireReportRole = [
    requireUser,
    requireRole(["manager", "admin"])
];

router.get("/daily-sales", requireReportRole, getDailySales);
router.get("/payment-methods", requireReportRole, getPaymentMethods);

export default router;