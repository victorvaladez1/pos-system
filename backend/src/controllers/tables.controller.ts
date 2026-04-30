import { Request, Response } from "express";
import { validate as isUuid }  from "uuid";
import type { CreateTableRequest } from "../types/table.types.js";
import { isTableStatus } from "../types/table.types.js";
import {
    createTableRow,
    getTableRows,
    updateTableRowById,
    deleteTableRowById
} from "../services/tables.service.js";

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

export async function updateTable(req: Request, res: Response) {
    const { id } = req.params ?? {};
    const { table_number, capacity, current_status } = req.body ?? {};

    if (!id || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Enter valid id." });
    }

    if (!table_number || typeof table_number !== "number" || table_number < 0) {
        return res.status(400).json({ error: "Enter valid table_number" });
    }

    if (!capacity || typeof capacity !== "number" || capacity < 0) {
        return res.status(400).json({ error: "Enter valid capacity." });
    }
    
    const tableStatusEnum = ['available', 'occupied', 'reserved', 'dirty', 'out_of_service'];

    if (!current_status || typeof current_status !== "string" || !tableStatusEnum.includes(current_status)) {
        return res.status(400).json({ error: "Enter valid current_status." });
    }

    try {
        const updatedTable = await updateTableRowById(id, table_number, capacity, current_status);
        return res.status(200).json({ updatedTable });
    } catch (error) {
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