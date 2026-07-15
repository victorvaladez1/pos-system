import { Router } from "express";
import {
    createPayment,
    getPayments,
    updatePayment,
    deletePayment
} from "../controllers/payments.controller.js";

const router = Router();

router.post("/", createPayment);
router.get("/", getPayments);
router.patch("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;