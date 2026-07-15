import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import type {
    CreatePaymentRequest,
    UpdatePaymentRequest
} from "../types/payment.types.js";
import {
    isPaymentMethod,
    isPaymentStatus
} from "../types/payment.types.js";
import {
    createPaymentRow,
    getPaymentRows,
    updatePaymentRowById,
    deletePaymentRowById
} from "../services/payments.service.js";

export const createPayment = async (req: Request, res: Response) => {
    const { order_id, amount_in_cents, payment_method, payment_status } = req.body ?? {};

    if (
        order_id === undefined ||
        typeof order_id !== "string" ||
        !isUuid(order_id) ||
        Array.isArray(order_id)
    ) {
        return res.status(400).json({ error: "Order id must be a valid UUID." });
    }

    if (
        amount_in_cents === undefined ||
        typeof amount_in_cents !== "number" ||
        !Number.isInteger(amount_in_cents) ||
        amount_in_cents < 0
    ) {
        return res.status(400).json({ error: "Amount in cents must be a non-negative integer." });
    }

    if (
        payment_method === undefined ||
        typeof payment_method !== "string" ||
        !isPaymentMethod(payment_method)
    ) {
        return res.status(400).json({ error: "Payment method must be valid." });
    }

    if (
        payment_status === undefined ||
        typeof payment_status !== "string" ||
        !isPaymentStatus(payment_status)
    ) {
        return res.status(400).json({ error: "Payment status must be valid." });
    }

    const fields: CreatePaymentRequest = {
        order_id,
        amount_in_cents,
        payment_method,
        payment_status
    };

    try {
        const payment = await createPaymentRow(fields);
        return res.status(201).json({ payment });
    } catch (error: any) {
        if (error.code === "23503") {
            return res.status(404).json({ error: "Order not found." });
        }

        console.error("Failed to create payment.", error);
        return res.status(500).json({ error: "Failed to create payment." });
    }
};

export const getPayments = async (req: Request, res: Response) => {
    try {
        const payments = await getPaymentRows();
        return res.status(200).json({ payments });
    } catch (error) {
        console.error("Failed to retrieve payments.", error);
        return res.status(500).json({ error: "Failed to retrieve payments." });
    }
};

export const updatePayment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount_in_cents, payment_method, payment_status } = req.body ?? {};

    if (!id || typeof id !== "string" || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Payment id must be a valid UUID." });
    }

    if (
        amount_in_cents !== undefined &&
        (
            typeof amount_in_cents !== "number" ||
            !Number.isInteger(amount_in_cents) ||
            amount_in_cents < 0
        )
    ) {
        return res.status(400).json({ error: "Amount in cents must be a non-negative integer." });
    }

    if (
        payment_method !== undefined &&
        (typeof payment_method !== "string" || !isPaymentMethod(payment_method))
    ) {
        return res.status(400).json({ error: "Payment method must be valid." });
    }

    if (
        payment_status !== undefined &&
        (typeof payment_status !== "string" || !isPaymentStatus(payment_status))
    ) {
        return res.status(400).json({ error: "Payment status must be valid." });
    }

    const fieldsToUpdate: UpdatePaymentRequest = {};

    if (amount_in_cents !== undefined) {
        fieldsToUpdate.amount_in_cents = amount_in_cents;
    }

    if (payment_method !== undefined) {
        fieldsToUpdate.payment_method = payment_method;
    }

    if (payment_status !== undefined) {
        fieldsToUpdate.payment_status = payment_status;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ error: "No valid fields provided to update." });
    }

    try {
        const payment = await updatePaymentRowById(id, fieldsToUpdate);

        if (!payment) {
            return res.status(404).json({ error: "Payment not found." });
        }

        return res.status(200).json({ payment });
    } catch (error) {
        console.error("Failed to update payment.", error);
        return res.status(500).json({ error: "Failed to update payment." });
    }
};

export const deletePayment = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Payment id must be a valid UUID." });
    }

    try {
        const deletedPayment = await deletePaymentRowById(id);

        if (!deletedPayment) {
            return res.status(404).json({ error: "Payment not found." });
        }

        return res.sendStatus(204);
    } catch (error) {
        console.error("Failed to delete payment.", error);
        return res.status(500).json({ error: "Failed to delete payment." });
    }
};