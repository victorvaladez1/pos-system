import { Router } from "express";
import {
    createOrderItemModifier,
    getOrderItemModifiers,
    deleteOrderItemModifier
} from "../controllers/orderItemModifiers.controller.js";

const router = Router();

router.post("/", createOrderItemModifier);
router.get("/", getOrderItemModifiers);
router.delete("/:id", deleteOrderItemModifier);

export default router;