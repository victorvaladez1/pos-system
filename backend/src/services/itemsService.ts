import sql from "../db.js";

export async function createItemRow(name: string, price_in_cents: number, category_id: string) {
    const result = await sql`INSERT INTO items (name, price_in_cents, category_id) VALUES (${name}, ${price_in_cents}, ${category_id})`;
    return result;
}

export async function createItemRowDesc(name: string, description: string, price_in_cents: number, category_id: string) {
    const result = await sql`INSERT INTO items (name, description, price_in_cents, category_id) VALUES (${name}, ${description}, ${price_in_cents}, ${category_id})`;
    return result;
}

export async function createItemRowAct(name: string, price_in_cents: number, category_id: string, is_active: boolean) {
    const result = await sql`INSERT INTO items (name, price_in_cents, category_id, is_active) VALUES (${name}, ${price_in_cents}, ${category_id}, ${is_active})`;
    return result;
}

export async function createItemRowDescAct(name: string, description: string, price_in_cents: number, category_id: string, is_active: boolean) {
    const result = await sql`INSERT INTO items (name, description, price_in_cents, category_id, is_active) VALUES (${name}, ${description}, ${price_in_cents}, ${category_id}, ${is_active})`;
    return result;
}

export async function getAllItemRows() {
    const result = await sql`SELECT * FROM items`;
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