import { Router } from "express";
import {
    createPayment,
    getPayments,
    updatePayment,
    deletePayment
} from "../controllers/payments.controller.js";

import { requireUser } from "../middleware/requireUser.js";
import { requireRole } from "../middleware/requireRole.js";

const requirePaymentRole = [
    requireUser,
    requireRole(["cashier", "manager", "admin"])
];

const router = Router();

router.post("/", requirePaymentRole, createPayment);
router.get("/", requirePaymentRole, getPayments);
router.patch("/:id", requirePaymentRole, updatePayment);
router.delete("/:id", requirePaymentRole, deletePayment);

export default router;