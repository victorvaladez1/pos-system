import { Router } from "express";
import { getDailySales, getPaymentMethods, getTopItems } from "../controllers/reports.controller.js";
import { requireUser } from "../middleware/requireUser.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

const requireReportRole = [
    requireUser,
    requireRole(["manager", "admin"])
];

router.get("/daily-sales", requireReportRole, getDailySales);
router.get("/payment-methods", requireReportRole, getPaymentMethods);
router.get("/top-items", requireReportRole, getTopItems);

export default router;