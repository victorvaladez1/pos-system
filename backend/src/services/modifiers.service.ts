import sql from "../db.js";

export async function getModifierRows() {
    const result = await sql `SELECT * FROM modifiers`;
    return result;
}

export async function getModifierRowByName(name: string) {
    const result = await sql `SELECT * FROM modifiers WHERE name = ${name} LIMIT 1`;
    return result;
}

export async function createModifierRow(name: string, price_in_cents: number) {
    const result = await sql `INSERT INTO modifiers (name, price_in_cents) VALUES (${name}, ${price_in_cents}) RETURNING id`;
    return result;
}

export async function updateModifierRowById(modifierId: string, name: string, price_in_cents: number) {
    const result = await sql`UPDATE modifiers SET name = ${name}, price_in_cents = ${price_in_cents} WHERE id = ${modifierId} RETURNING id`;
    return result;
}

export async function deleteModifierRowById(modifierId: string) {
    const result = await sql `DELETE FROM modifiers WHERE id = ${modifierId} RETURNING id`;
    return result;
}