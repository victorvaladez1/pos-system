import {Request, Response} from "express";
import { validate as isUuid } from "uuid";
import { getCategoryRowById } from "../services/categories.service.js";
import {
    createItemRow,
    createItemRowDesc,
    createItemRowAct,
    createItemRowDescAct,
    getAllItemRows,
    getItemRowById,
    getItemRowByName,
    updateItemRowById,
    deleteItemRowById,
} from "../services/items.service.js";

export async function createItem(req: Request, res: Response) {
    const { name, description, price_in_cents, category_id, is_active } = req.body || {};
    
    if (!name || typeof name !== 'string' || name.trim() === "") {
        return res.status(400).json({ error: "Enter valid name." });
    }

    const existingItemRow = await getItemRowByName(name);

    if (existingItemRow.length > 0) {
        return res.status(409).json({ error: "Cannot create duplicate item."});
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

    if (!description && is_active !== null) {
        const itemRow = await createItemRow(name, price_in_cents, category_id);
        return res.status(201).json({ itemRow });
    } else if (description) {
        const itemRow = await createItemRowDesc(name, description, price_in_cents, category_id);
        return res.status(201).json({ itemRow });
    } else if (is_active !== null) {
        const itemRow = await createItemRowAct(name, price_in_cents, category_id, is_active);
        return res.status(201).json({ itemRow });
    }

    const itemRow = await createItemRowDescAct(name, description, price_in_cents, category_id, is_active);
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