import { Request, Response } from "express";
import { validate as isUuid }  from "uuid";
import type { CreateTableRequest, UpdateTableRequest, TableStatus } from "../types/table.types.js";
import { isTableStatus, tableStatusEnum } from "../types/table.types.js";
import {
    createTableRow,
    getTableRows,
    updateTableRowById,
    deleteTableRowById,
    updateTableStatusById,
    getTableRowById,
} from "../services/tables.service.js";

import { getOpenOrderRowByTableId } from "../services/orders.service.js";

export const createTable = async (req: Request, res: Response) => {
    const { table_number, capacity, current_status } = req.body ?? {};

    if (table_number === undefined || typeof table_number !== "number" || !Number.isInteger(table_number) || table_number < 1) {
        return res.status(400).json({ error: "Enter valid table number."});
    }

    if (capacity === undefined || typeof capacity !== "number" || !Number.isInteger(capacity) || capacity < 1) {
        return res.status(400).json({ error: "Enter valid capacity." });
    }

    if (current_status === undefined || typeof current_status !== "string" || !isTableStatus(current_status)) {
        return res.status(400).json({ error: "Enter valid current_status"});
    }

    const fields: CreateTableRequest = {
        table_number,
        capacity,
        current_status
    };

    try {
        const table = await createTableRow(fields);
        return res.status(201).json({ table });
    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Cannot create duplicate table." });
        }

        console.log("Failed to create table row in db.", error);
        res.status(500).json({ error: "Failed to create table row in db." });
    }
}

export const getTables = async (req: Request, res: Response) => {
    try {
        const tables = await getTableRows();
        return res.status(200).json({ tables });
    } catch (error) {
        console.log("Failed to retrieve table rows from db.", error);
        return res.status(500).json({ error: "Failed to retrieve table rows from db." });
    }
}

export const updateTable = async (req: Request, res: Response) => {
    const { id } = req.params ?? {};
    const { table_number, capacity, current_status } = req.body ?? {};

    if (id !== undefined && (typeof id !== "string" || !isUuid(id) || Array.isArray(id))) {
        return res.status(400).json({ error: "Enter valid id." });
    }

    if (table_number !== undefined && (typeof table_number !== "number" || !Number.isInteger(table_number) || table_number <= 0)) {
        return res.status(400).json({ error: "Enter valid table_number" });
    }

    if (capacity !== undefined && (typeof capacity !== "number" || !Number.isInteger(capacity) ||capacity <= 0)) {
        return res.status(400).json({ error: "Enter valid capacity." });
    }

    if (current_status !== undefined && (typeof current_status !== "string" || !isTableStatus(current_status))) {
        return res.status(400).json({ error: "Enter valid current_status." });
    }

    const fieldsToUpdate: UpdateTableRequest = {}; 
    
    if (table_number !== undefined) {
        fieldsToUpdate.table_number = table_number;
    }

    if (capacity !== undefined) {
        fieldsToUpdate.capacity = capacity;
    }

    if (current_status !== undefined) {
        fieldsToUpdate.current_status = current_status;
    }

    if (Object.keys(fieldsToUpdate).length < 1) {
        return res.status(400).json({ error: "No fields updated" });
    }

    try {
        const updatedTable = await updateTableRowById(id, fieldsToUpdate);

        if (!updatedTable) {
            return res.status(404).json({ error: "Table not found." });
        }

        return res.status(200).json({ table: updatedTable });
    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Cannot create duplicate table."});
        } 
        console.log("Failed to update table row in db.", error);
        return res.status(500).json({ error: "Failed to update table row in db."});
    }
}

export const deleteTable = async (req: Request, res: Response) => {
    const { id } = req.params ?? {};

    if (id === undefined || typeof id !== "string" || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Enter valid id." });
    }

    try {
        const deletedTable = await deleteTableRowById(id);

        if (!deletedTable) {
            return res.status(404).json({ error: "Table not found." });
        }

        return res.sendStatus(204);
    } catch (error) {
        console.log("Failed to delete table row in db.", error);
        return res.status(500).json({ error: "Failed to delete table row in db." });
    }
}

export const updateTableStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { current_status } = req.body;

    if (!id || typeof id !== "string" || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Table id must be valid UUID." });
    }

    if (!current_status || typeof current_status !== "string" || !tableStatusEnum.includes(current_status as TableStatus)) {
        return res.status(400).json({ error: "Table status must be valid." });
    }

    try {
        const table = await updateTableStatusById(id, current_status as TableStatus);

        if (!table) {
            return res.status(404).json({ error: "Table not found." });
        }

        return res.status(200).json({ table });
    } catch (error) {
        console.error("Failed to update table status.", error);
        return res.status(500).json({ error: "Failed to update table status." });
    }
};

export const getTableOpenOrder = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Table id must be a valid UUID." });
    }

    try {
        const table = await getTableRowById(id);

        if (!table) {
            return res.status(404).json({ error: "Table not found." });
        }

        const order = await getOpenOrderRowByTableId(id);

        if (!order) {
            return res.status(404).json({ error: "Open order not found for table." });
        }

        return res.status(200).json({ order });
    } catch (error) {
        console.error("Failed to retrieve table open order.", error);
        return res.status(500).json({ error: "Failed to retrieve open order."});
    }
};