import sql from "../db.js";
import type { Modifier, CreateModifierRequest, UpdateModifierRequest } from "../types/modifier.types.js";

export async function createModifierRow(newModifierValues: CreateModifierRequest): Promise<Modifier> {
    const result = await sql<Modifier[]> `INSERT INTO modifiers (name, price_in_cents) VALUES (${newModifierValues.name}, ${newModifierValues.price_in_cents}) RETURNING *`;
    return result[0];
}

export async function getModifierRows() {
    const result = await sql `SELECT * FROM modifiers`;
    return result;
}

export async function getModifierRowByName(name: string) {
    const result = await sql `SELECT * FROM modifiers WHERE name = ${name} LIMIT 1`;
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