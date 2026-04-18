import sql from "../db.js";

export async function createItemRow(name: string, description: string, price_in_cents: number, category_id: string, is_active: boolean) {
    const result = await sql`INSERT INTO items (name, description, price_in_cents, category_id, is_active) VALUES (${name}, ${description}, ${price_in_cents}, ${category_id}, ${is_active})`;
    return result;
}

export async function getAllItemRows() {
    const result = await sql`SELECT * FROM items`;
    return result;
};