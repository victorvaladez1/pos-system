import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import { isValidIsoTimestamp } from "../utils/validation.js";
import type { CreateOrderRequest, UpdateOrderRequest } from "../types/order.types.js";
import { isOrderType, isOrderStatus } from "../types/order.types.js";
import {
    createOrderRow,
    getOrderRows,
    updateOrderRowById,
    deleteOrderRowById,
    closeOrderRowById,
    getOpenOrderRows,
    cancelOrderRowById,
} from "../services/orders.service.js";

import { getOrderSummarybyId } from "../services/orderSummary.service.js";

import {
    getTableRowById,
    updateTableStatusById
} from "../services/tables.service.js";

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
        if (order_type === "dine_in" && table_id) {
            const table = await getTableRowById(table_id);

            if (!table) {
                return res.status(404).json({ error: "Table not found." });
            }

            if (table.current_status !== "available" && table.current_status !== "reserved") {
                return res.status(400).json({ error: "Table is not available for dine-in order." });
            }
        }

        const order = await createOrderRow(fields);

        if (order.order_type === "dine_in" && order.table_id) {
            await updateTableStatusById(order.table_id, "occupied");
        }

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

export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params ?? {};
    const { table_id, server_id, order_type, order_status, ticket_name, guest_count, opened_at, closed_at } = req.body ?? {};

    if (id === undefined || typeof id !== 'string' || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Id must be valid UUID." });
    }

    if (table_id !== undefined && table_id !== null && (typeof table_id !== 'string' || !isUuid(table_id) || Array.isArray(table_id))) {
        return res.status(400).json({ error: "Table Id must be valid UUID." });
    }

    if (server_id !== undefined && server_id !== null && (typeof server_id !== 'string' || !isUuid(server_id) || Array.isArray(server_id))) {
        return res.status(400).json({ error: "Server Id must be valid UUID." });
    }

    if (order_type !== undefined && (typeof order_type !== 'string' || !isOrderType(order_type))) {
        return res.status(400).json({ error: "Order Type must be valid."});
    }

    if (order_status !== undefined && (typeof order_status !== 'string' || !isOrderStatus(order_status))) {
        return res.status(400).json({ error: "Order Status must be valid." });
    }

    if (ticket_name !== undefined && ticket_name !== null && (typeof ticket_name !== 'string' || ticket_name.trim() === '')) {
        return res.status(400).json({ error: "Ticket name must be non-empty string." });
    }

    if (guest_count !== undefined && guest_count !== null && (typeof guest_count !== 'number' || !Number.isInteger(guest_count) || guest_count < 1)) {
        return res.status(400).json({ error: "Guest count must be a positive integer." });
    }

    if (opened_at !== undefined && (typeof opened_at !== 'string' || !isValidIsoTimestamp(opened_at))) {
        return res.status(400).json({ error: "Opened At must be valid iso timestamp value." });
    }

    if (closed_at !== undefined && closed_at !== null && (typeof closed_at !== 'string' || !isValidIsoTimestamp(closed_at))) {
        return res.status(400).json({ error: "Closed At must be valid iso timestamp value." });
    }

    const fieldsToUpdate: UpdateOrderRequest = {};

    if (table_id !== undefined) {
        fieldsToUpdate.table_id = table_id;
    }

    if (server_id !== undefined) {
        fieldsToUpdate.server_id = server_id;
    }

    if (order_type !== undefined) {
        fieldsToUpdate.order_type = order_type;
    }

    if (order_status !== undefined) {
        fieldsToUpdate.order_status = order_status;
    }

    if (ticket_name !== undefined) {
        fieldsToUpdate.ticket_name = ticket_name;
    }

    if (guest_count !== undefined) {
        fieldsToUpdate.guest_count = guest_count;
    }

    if (opened_at !== undefined) {
        fieldsToUpdate.opened_at = opened_at;
    }

    if (closed_at !== undefined) {
        fieldsToUpdate.closed_at = closed_at;
    }

    if (Object.keys(fieldsToUpdate).length < 1) {
        return res.status(400).json({ error: "Missing fields to update." });
    }

    try {
        const order = await updateOrderRowById(id, fieldsToUpdate);

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        return res.status(200).json({ order });

    } catch (error: any) {
        if (error.code === "23503" ) {
            return res.status(404).json({ error: "Table not found." });
        }

        console.error("Failed to update order", error);
        return res.status(500).json({ error: "Falied to update order." });
    }
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

export const getOrderSummary = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Order id must be a valid UUID." });
    }

    try {
        const summary = await getOrderSummarybyId(id);

        if (!summary) {
            return res.status(404).json({ error: "Order not found." });
        }

        return res.status(200).json(summary);
    } catch (error) {
        console.error("Failed to retrieve order summary.", error);
        return res.status(500).json({ error: "Falield to retrieve order summary." });
    }
};

export const closeOrder = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Order id must be a valid UUID." });
    }

    try {
        const summary = await getOrderSummarybyId(id);

        if (!summary) {
            return res.status(404).json({ error: "Order not found." });
        }

        if (summary.totals.balance_due_in_cents > 0) {
            return res.status(400).json({
                error: "Order cannot be closed with remaining balance."
            });
        }

        const order = await closeOrderRowById(id);

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        return res.status(200).json({ order });
    } catch (error) {
        console.error("Failed to close order.", error);
        return res.status(500).json({ error: "Faild to close order." });
    }
};

export const getOpenOrders = async (_req: Request, res: Response) => {
    try {
        const orders = await getOpenOrderRows();

        return res.status(200).json({ orders });
    } catch (error) {
        console.error("Failed to retrieve open orders.", error);
        return res.status(500).json({ error: "Failed to retrieve open orders." });
    }
};

export const cancelOrder = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Order id must be valid UUID." });
    }

    try {
        const summary = await getOrderSummarybyId(id);

        if (!summary) {
            return res.status(404).json({ error: "Order not found." });
        }

        if (summary.order.order_status === "paid") {
            return res.status(400).json({
                error: "Paid order cannot be cancelled."
            });
        }

        if (summary.order.order_status === "cancelled") {
            return res.status(400).json({
                error: "Order is already cancelled."
            });
        }

        const order = await cancelOrderRowById(id);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        return res.status(200).json({ order });
    } catch (error) {
        console.error("Failed to cancel order.", error);
        return res.status(500).json({ error: "Faild to cancel order." });
    }

};  