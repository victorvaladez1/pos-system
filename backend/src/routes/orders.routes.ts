import { Router } from "express";
import {
    createOrder,
    getOrders,
    updateOrder,
    deleteOrder,
    getOrderSummary,
    closeOrder,
    getOpenOrders,
    cancelOrder
} from "../controllers/orders.controller.js"

const router = Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/open", getOpenOrders);
router.get("/:id/summary", getOrderSummary);
router.patch("/:id/close", closeOrder);
router.patch("/:id/cancel", cancelOrder);
router.patch("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;