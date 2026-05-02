import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import { isValidIsoTimestamp } from "../utils/validation.js";
import type { CreateOrderRequest } from "../types/order.types.js";
import { isOrderType, isOrderStatus } from "../types/order.types.js";
import {
    createOrderRow,
    getOrderRows,
    deleteOrderRowById
} from "../services/orders.service.js";

export const createOrder = async (req: Request, res: Response) => {
    const { table_id, server_id, order_type, order_status, ticket_name, guest_count, opened_at } = req.body ?? {};

    if (table_id !== undefined && table_id !== null && (typeof table_id !== 'string' || !isUuid(table_id) || Array.isArray(table_id))) {
        return res.status(400).json({ error: "Table Id must be valid UUID." });
    }

    if (server_id !== undefined && server_id !== null && (typeof server_id !== 'string' || !isUuid(server_id) || Array.isArray(server_id))) {
        return res.status(400).json({ error: "Server Id myst be valid UUID."});
    }

    if (order_type === undefined || typeof order_type !== 'string' || order_type.trim() === '' || !isOrderType(order_type)) {
        return res.status(400).json({ error: "Order Type must be valid."});
    }

    if (order_status === undefined || typeof order_status !== 'string' || order_status.trim() === '' || !isOrderStatus(order_status)) {
        return res.status(400).json({ error: "Order Status must be valid."});
    }

    if (ticket_name !== undefined && (typeof ticket_name !== 'string' || ticket_name.trim() === '')) {
        return res.status(400).json({ error: "Ticket Name must be non empty string."});
    }

    if (guest_count !== undefined && guest_count !== null && (typeof guest_count !== 'number' || !Number.isInteger(guest_count) || guest_count < 1)) {
        return res.status(400).json({ error: "Guest Count must be non-negative integer." });
    }

    if (opened_at !== undefined && (typeof opened_at !== 'string' || opened_at.trim() === '' || !isValidIsoTimestamp(opened_at))) {
        return res.status(400).json({ error: "Opened At must be valid iso timestamp value." });
    }

    const fields: CreateOrderRequest = {
        order_type,
        order_status,
    };

    if (table_id !== undefined) {
        fields.table_id = table_id;
    }

    if (server_id !== undefined) {
        fields.server_id = server_id;
    }

    if (ticket_name !== undefined) {
        fields.ticket_name = ticket_name;
    }

    if (guest_count !== undefined) {
        fields.guest_count = guest_count;
    }

    if (opened_at !== undefined) {
        fields.opened_at = opened_at;
    }

    try {
        const order = await createOrderRow(fields);
        return res.status(201).json({ order });

    } catch(error: any) {
        if (error.code === '23503') {
            return res.status(404).json({ error: "Table not found." });
        }
        console.error("Failed to create order.", error);
        return res.status(500).json({ error: "Failed to create order."});
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await getOrderRows();
        return res.status(200).json({ orders });
    } catch (error: any) {
        console.log("Failed to retrieve orders from db.", error);
        return res.status(500).json({ error: "Failed to retrieve orders from db." });
    }
};

export const updateOrder = (req: Request, res: Response) => {
    return res.json({ msg: "Update order entity by id."});
};

export const deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.params ?? {};

    if (id === undefined || typeof id !== 'string' || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Id must be valid UUID."});
    }

    try {
        const order = await deleteOrderRowById(id);
        if (!order) {
            return res.status(404).json({ error: "Order not found."});
        }
        
        return res.sendStatus(204);
    } catch (error: any) {
        console.error("Failed to delete order", error);
        return res.status(500).json({ error: "Failed to delete order." });
    }
};