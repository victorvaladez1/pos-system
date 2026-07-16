import { Router } from "express";
import { 
    createOrderItem,
    getOrderItem,
    updateOrderItem,
    deleteOrderItem,
    updateOrderItemStatus
} from "../controllers/orderItems.controller.js";

const router = Router();

router.post("/", createOrderItem);
router.get("/", getOrderItem);
router.patch("/:id/status", updateOrderItemStatus);
router.patch("/:id",  updateOrderItem);
router.delete("/:id", deleteOrderItem);

export default router;