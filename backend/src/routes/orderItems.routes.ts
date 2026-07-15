import { Router } from "express";
import { 
    createOrderItem,
    getOrderItem,
    updateOrderItem,
    deleteOrderItem
} from "../controllers/orderItems.controller.js";

const router = Router();

router.post("/", createOrderItem);
router.get("/", getOrderItem);
router.patch("/:id",  updateOrderItem);
router.delete("/:id", deleteOrderItem);

export default router;