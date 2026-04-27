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

export async function getItemRowById(itemId: string) {
    const result = await sql`SELECT * FROM items WHERE id = ${itemId} LIMIT 1`;
    return result;
}

export async function getItemRowByName(name: string) {
    const result = await sql`SELECT * FROM items WHERE name = ${name} LIMIT 1`;
    return result;
}

export async function updateItemRowById(itemId: string, name: string, description: string, price_in_cents: number, category_id: string, is_active: boolean) {
    const result = await sql`UPDATE items SET name = ${name}, description = ${description}, price_in_cents = ${price_in_cents}, category_id = ${category_id}, is_active = ${is_active} WHERE id = ${itemId} RETURNING id`; 
    return result;
}

export async function deleteItemRowById(itemId: string) {
    const result = await sql`DELETE FROM items WHERE id = ${itemId}`;
    return result;
}