import type { Request, Response } from "express";
import { getKitchenOrders } from "../services/kitchen.service.js";

export const getKitchenOrderQueue = async (_req: Request, res: Response) => {
    try {
        const orders = await getKitchenOrders();

        return res.status(200).json({ orders });
    } catch (error) {
        console.error("Failed to retrieve kitchen orders.", error);
        return res.status(500).json({
            error: "Failed to retrieve kitchen orders."
        });
    }
};