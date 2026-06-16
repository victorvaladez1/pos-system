import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import { CreateOrderItemRequest, isOrderItemStatus } from "../types/orderItem.type.js";
import {
    createOrderItemRow,
    getOrderItemRows
} from "../services/orderItems.service.js";

export const createOrderItem = async (req: Request, res: Response) => {
    const { order_id, item_id, quantity, unit_price_in_cents, notes, order_item_status } = req.body ?? {};

    if (order_id === undefined || typeof order_id !== "string" || !isUuid(order_id) || Array.isArray(order_id)) {
        return res.status(400).json({ error: "Order Id must be valid UUID." });
    }

    if (item_id === undefined || typeof item_id !== "string" || !isUuid(item_id) || Array.isArray(item_id)) {
        return res.status(400).json({ error: "Item Id must be valid UUID." });
    }

    if (quantity === undefined || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: "Quantity must be positive integer." });
    }

    if (unit_price_in_cents === undefined || typeof unit_price_in_cents !== "number" || !Number.isInteger(unit_price_in_cents) || unit_price_in_cents < 0) {
        return res.status(400).json({ error: "Price in cents must be non-negative integer." });
    }
 
    if (notes !== undefined && notes !== null && (typeof notes !== "string" || Array.isArray(notes) || notes.trim() === "")) {
        return res.status(400).json({ error: "Notes must be non-empty string."});
    }

    if (order_item_status === undefined || typeof order_item_status !== "string" || !isOrderItemStatus(order_item_status)) {
        return res.status(400).json({ error: "Order item status must be valid."});
    }

    const fields: CreateOrderItemRequest = {
        order_id,
        item_id,
        quantity,
        unit_price_in_cents,
        order_item_status
    };

    if (notes !== undefined) {
        fields.notes = notes;
    }

    try {
        const orderItem = await createOrderItemRow(fields);
        return res.status(201).json({ orderItem });
    } catch (error: any) {
        if (error.code === '23503') {
            return res.status(404).json({ error: "Order not found." });
        }
        console.error("Failed to create order item.", error);
        return res.status(500).json({ error: "Failed to create order item."});
    }
};

export const getOrderItem = async (req: Request, res: Response) => {
    try {
        const orderItems = await getOrderItemRows();
        return res.status(200).json({ orderItems });
    } catch (error: any) {
        console.log("Failed to retrieve orders from db.", error);
        return res.status(500).json({ error: "Failed to retrieve order items from db." });
    }
};

export const updateOrderItem = (req: Request, res: Response) => {
    return res.status(200).json({ "msg": "Order Item updated." });
};

export const deleteOrderItem = (req: Request, res: Response) => {
    return res.status(200).json({ "msg": "Order Item deleted." });
};