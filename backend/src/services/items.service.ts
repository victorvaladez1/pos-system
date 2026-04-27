import sql from "../db.js";
import type { Item, CreateItemRequest, UpdateItemRequest } from "../types/item.types.js";

export const createItemRow = async (fields: CreateItemRequest): Promise<Item> => {
    const description = fields.description ?? null;
    const isActive = fields.is_active ?? true;
    const result = await sql<Item[]>`INSERT INTO items (name, description, price_in_cents, category_id, is_active) VALUES (${fields.name}, ${description}, ${fields.price_in_cents}, ${fields.category_id}, ${isActive}) RETURNING *`;
    return result[0];
}

export const getAllItemRows = async (): Promise<Item[]> => {
    const result = await sql<Item[]>`SELECT * FROM items`;
    return result;
};

export const updateItemRowById = async (itemId: string, fieldsToUpdate: UpdateItemRequest): Promise<Item | undefined> => {
    const result = await sql<Item[]>`UPDATE items SET ${sql(fieldsToUpdate)}, updated_at = NOW() WHERE id = ${itemId} RETURNING *`;
    return result[0];
};

export const deleteItemRowById = async (itemId: string): Promise<Item> => {
    const result = await sql<Item[]>`DELETE FROM items WHERE id = ${itemId} RETURNING *`;
    return result[0];
};