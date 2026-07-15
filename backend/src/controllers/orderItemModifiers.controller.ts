import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import type { CreateOrderItemModifierRequest } from "../types/orderItemModifier.types.js";
import {
    createOrderItemModifierRow,
    getOrderItemModifierRows,
    deleteOrderItemModifierRowById
} from "../services/orderItemModifiers.service.js";

export const createOrderItemModifier = async (req: Request, res: Response) => {
    const { order_item_id, modifier_id, quantity } = req.body ?? {};

    if (
        order_item_id === undefined ||
        typeof order_item_id !== "string" ||
        !isUuid(order_item_id) ||
        Array.isArray(order_item_id)
    ) {
        return res.status(400).json({ error: "Order item id must be a valid UUID." });
    }

    if (
        modifier_id === undefined ||
        typeof modifier_id !== "string" ||
        !isUuid(modifier_id) ||
        Array.isArray(modifier_id)
    ) {
        return res.status(400).json({ error: "Modifier id must be a valid UUID." });
    }

    if (
        quantity === undefined ||
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {
        return res.status(400).json({ error: "Quantity must be a positive integer." });
    }

    try {
        const orderItemModifier = await createOrderItemModifierRow({
            order_item_id,
            modifier_id,
            quantity
        });

        return res.status(201).json({ orderItemModifier });
    } catch (error: any) {
        if (error.code === "23503") {
            return res.status(404).json({ error: "Order item or modifier not found." });
        }

        console.error("Failed to create order item modifier.", error);
        return res.status(500).json({ error: "Failed to create order item modifier." });
    }
};

export const getOrderItemModifiers = async (req: Request, res: Response) => {
    try {
        const orderItemModifiers = await getOrderItemModifierRows();
        return res.status(200).json({ orderItemModifiers });
    } catch (error) {
        console.error("Failed to retrieve order item modifiers.", error);
        return res.status(500).json({ error: "Failed to retrieve order item modifiers." });
    }
};

export const deleteOrderItemModifier = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Order item modifier id must be a valid UUID." });
    }

    try {
        const deletedOrderItemModifier = await deleteOrderItemModifierRowById(id);

        if (!deletedOrderItemModifier) {
            return res.status(404).json({ error: "Order item modifier not found." });
        }

        return res.sendStatus(204);
    } catch (error) {
        console.error("Failed to delete order item modifier.", error);
        return res.status(500).json({ error: "Failed to delete order item modifier." });
    }
};