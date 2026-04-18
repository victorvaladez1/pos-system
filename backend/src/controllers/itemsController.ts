import {Request, Response} from "express";
import { validate as isUuid } from "uuid";
import { getCategoryRowById } from "../services/categoryService.js";
import { 
    createItemRow,
    getAllItemRows
} from "../services/itemsService.js";

export async function createItem(req: Request, res: Response) {
    const { name, description, price_in_cents, category_id, is_active } = req.body || {};
    
    if (!name || typeof name !== 'string' || name.trim() === "") {
        return res.status(400).json({ error: "Enter valid name." });
    }

    if (!price_in_cents || typeof price_in_cents !== 'number' || price_in_cents < 0) {
        return res.status(400).json({ error: "Enter valid price_in_cents." });
    }

    if (!isUuid(category_id) || Array.isArray(category_id)) {
        return res.status(400).json({ error: "Category_id is required." });
    }

    const categoryRow = await getCategoryRowById(category_id);

    if (categoryRow.length === 0) {
        return res.status(400).json({ error: "Enter existing category_id."});
    }

    const itemRow = await createItemRow(name, description, price_in_cents, category_id, is_active);
    
    return res.status(201).json({ itemRow });
}

export async function getItems(req: Request, res: Response) {
    try {
        const result = await getAllItemRows();
        return res.json({ items : result });
    } catch (error) {
        console.log("Failed to return all item rows from db.");
        return res.status(500).json({ error: "Failed to return all item rows from db." });
    }
}

export function updateItem(req: Request, res: Response) {
    return res.json({ msg: "Update an item entity." });
}

export function deleteItem(req: Request, res: Response) {
    return res.json({ msg: "Delete an item entity." });
}