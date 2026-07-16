import { Router } from "express";
import {
    createOrder,
    getOrders,
    updateOrder,
    deleteOrder,
    getOrderSummary,
    closeOrder,
    getOpenOrders
} from "../controllers/orders.controller.js"

const router = Router();

router.get("/open", getOpenOrders);
router.patch("/:id/close", closeOrder);
router.get("/:id/summary", getOrderSummary);
router.post("/", createOrder);
router.get("/", getOrders);
router.patch("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;