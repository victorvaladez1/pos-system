import { Request, Response } from "express";
import {
    getOrderRows
} from "../services/ordersService.js";

export const createOrder = (req: Request, res: Response) => {
    return res.json({ msg: "Create order entity."});
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await getOrderRows();
        return res.status(200).json({ orders });
    } catch (error) {
        console.log("Failed to retrieve orders from db.", error);
        return res.status(500).json({ error: "Failed to retrieve orders from db." });
    }
};

export const updateOrder = (req: Request, res: Response) => {
    return res.json({ msg: "Update order entity by id."});
};

export const deleteOrder = (req: Request, res: Response) => {
    return res.json({ msg: "Delete order entity by id."})
};