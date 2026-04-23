import { Router } from "express";
import {
    createOrder,
    getOrders,
    updateOrder,
    deleteOrder
} from "../controllers/orders.controller.js"

const router = Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.patch("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;