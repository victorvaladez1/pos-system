import { Request, Response } from "express";
import { validate as isUuid }  from "uuid";  
import {
    createTableRow,
    getTableRows,
    getTableRowByTableNumber,
    updateTableRowById,
    deleteTableRowById
} from "../services/tableService.js";

export async function createTable(req: Request, res: Response) {
    const { table_number, capacity, current_status } = req.body ?? {};

    if (!table_number || typeof table_number !== "number" || table_number < 1) {
        return res.status(400).json({ error: "Enter valid table number."});
    }

    if (!capacity || typeof capacity !== "number" || capacity < 1) {
        return res.status(400).json({ error: "Enter valid capacity." });
    }
    
    const tableStatusEnum = ['available', 'occupied', 'reserved', 'dirty', 'out_of_service'];

    if (!current_status || typeof current_status !== "string" || !tableStatusEnum.includes(current_status)) {
        return res.status(400).json({ error: "Enter valid current_status"});
    }

    const existingTable = await getTableRowByTableNumber(table_number);

    if (existingTable.length > 1) {
        return res.status(400).json({ error: "Cannot create table with duplicate table number."});
    }

    try {
        const table = await createTableRow(table_number, capacity, current_status);
        return res.status(200).json({ table });
    } catch (error) {   
        console.log("Failed to create table row in db.", error);
        res.status(500).json({ error: "Failed to create table row in db." });
    }
}

export async function getTables(req: Request, res: Response) {
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

    const existingTable = await getTableRowByTableNumber(table_number);
    
    if (existingTable.length > 0) {
        return res.status(400).json({ error: "Cannot create duplicate table."});
    } 

    try {
        const updatedTable = await updateTableRowById(id, table_number, capacity, current_status);
        return res.status(200).json({ updatedTable });
    } catch (error) {
        console.log("Failed to update table row in db.", error);
        return res.status(500).json({ error: "Failed to update table row in db."});
    }
}

export async function deleteTable(req: Request, res: Response) {
    const { id } = req.params ?? {};

    if (!id || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ msg: "Enter valid id." });
    }

    try {
        const deletedTable = await deleteTableRowById(id);
        return res.status(200).json({ deletedTable });
    } catch (error) {
        console.log("Failed to delete table row in db.", error);
        return res.status(500).json({ error: "Failed to delete table row in db." });
    }
}