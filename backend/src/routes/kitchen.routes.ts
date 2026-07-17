import { Router } from "express";
import { getKitchenOrderQueue } from "../controllers/kitchen.controller.js";

const router = Router();

router.get("/orders", getKitchenOrderQueue);

export default router;