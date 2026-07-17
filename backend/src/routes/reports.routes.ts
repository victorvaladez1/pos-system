import { Router } from "express";
import { getDailySales, getPaymentMethods, getTopItems, getOpenBalances } from "../controllers/reports.controller.js";
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
router.get("/open-balances", requireReportRole, getOpenBalances);

export default router;