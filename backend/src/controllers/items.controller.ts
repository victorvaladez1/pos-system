import {Request, Response} from "express";
import { validate as isUuid } from "uuid";
import type { Item, CreateItemRequest, UpdateItemRequest } from "../types/item.types.js";
import { getCategoryRowById } from "../services/categories.service.js";
import {
    createItemRow,
    getAllItemRows,
    getItemRowById,
    getItemRowByName,
    updateItemRowById,
    deleteItemRowById,
} from "../services/items.service.js";

export const createItem = async (req: Request, res: Response) => {
    const { name, description, price_in_cents, category_id, is_active } = req.body || {};
    
    if (name === undefined || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Name must be a non-empty string."});
    }

    if (typeof description !== 'undefined' && description !== null && (typeof description !== 'string' || description.trim() === '')) {
        return res.status(400).json({ error: "Description must be non-empty string."})
    }

    if (!price_in_cents || typeof price_in_cents !== 'number' || !Number.isInteger(price_in_cents) || price_in_cents < 0) {
        return res.status(400).json({ error: "Price must be non-negative integer."});
    }

    if (!category_id || typeof category_id !== 'string'|| !isUuid(category_id) || Array.isArray(category_id)) {
        return res.status(400).json({ error: "Id must be valid UUID."});
    }

    if (typeof is_active !== 'undefined' && typeof is_active !== 'boolean') {
        return res.status(400).json({ error: "Is_active must be boolean."});
    }

    const fields: CreateItemRequest = {
        name: name.trim(),
        description: typeof description  === "string" ? description.trim() : null,
        price_in_cents,
        category_id,
        is_active: is_active ?? true
    };

    try {
        const item = await createItemRow(fields);
        return res.status(201).json({ item });
    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Item name already exists." });
        }

        if (error.code == "23503") {
            return res.status(404).json({ error: "Category not found." });
        }

        console.error("Failed to create item", error);
        return res.status(500).json({ error: "Failed to create item"});
    }
}

export const getItems = async (req: Request, res: Response) => {
    try {
        const result = await getAllItemRows();
        return res.json({ items : result });
    } catch (error) {
        console.error("Failed to return all item rows from db.", error);
        return res.status(500).json({ error: "Failed to return all item rows from db." });
    }
}

export async function updateItem(req: Request, res: Response) {
    const itemId = req.params.id ?? {};
    const { name, description, price_in_cents, category_id, is_active } = req.body ?? {};

    if (!itemId || !isUuid(itemId) || Array.isArray(itemId)) {
        return res.status(400).json({ error: "Id is required."});
    }

    const existingItem = await getItemRowById(itemId);

    if (existingItem.length === 0) {
        return res.status(400).json({ error: "Enter existing id." });
    }

    if (!name || typeof name !== 'string' || name.trim() == "") {
        return res.status(400).json({ error: "Enter valid name." });
    }

    if (!price_in_cents || typeof price_in_cents !== "number" || price_in_cents < 0) {
        return res.status(400).json({ error: "Enter a valid price_in_cents." });
    }

    if (!isUuid(category_id) || Array.isArray(category_id)) {
        return res.status(400).json({ error: "Category_id is required." });
    }

    const categoryRow =  await getCategoryRowById(category_id);

    if (categoryRow.length === 0) {
        return res.status(400).json({ error: "Enter existing category_id" });
    }

    if (!description || typeof description !== "string" || description.trim() == "") {
        return res.status(400).json({ error: "Enter valid description"});
    }

    if (typeof is_active !== 'boolean') {
        return res.status(400).json({ error: "Enter valid is_active" });
    }

    const itemRow = await updateItemRowById(itemId, name, description, price_in_cents, category_id, is_active);

    return res.status(200).json({ itemRow });
}

export async function deleteItem(req: Request, res: Response) {
    const itemId = req.params.id ?? {};

    if (!itemId || !isUuid(itemId) || Array.isArray(itemId)) {
        return res.status(400).json({ error: "Item id is required." });
    }
    
    const deletedRow = await deleteItemRowById(itemId);
    return res.json({ deletedRow });
}