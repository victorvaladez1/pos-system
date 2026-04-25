import sql from "../db.js";
import type { Modifier, CreateModifierRequest, UpdateModifierRequest } from "../types/modifier.types.js";

export const createModifierRow = async (newModifierValues: CreateModifierRequest): Promise<Modifier> => {
    const result = await sql<Modifier[]> `INSERT INTO modifiers (name, price_in_cents) VALUES (${newModifierValues.name}, ${newModifierValues.price_in_cents}) RETURNING *`;
    return result[0];
};

export const getModifierRows = async () => {
    const result = await sql `SELECT * FROM modifiers`;
    return result;
};

export const getModifierRowByName = async (name: string) => {
    const result = await sql `SELECT * FROM modifiers WHERE name = ${name} LIMIT 1`;
    return result;
};

export const updateModifierRowById = async (modifierId: string, name: string, price_in_cents: number) => {
    const result = await sql`UPDATE modifiers SET name = ${name}, price_in_cents = ${price_in_cents} WHERE id = ${modifierId} RETURNING id`;
    return result;
};

export const deleteModifierRowById = async (modifierId: string): Promise<Modifier | undefined> => {
    const result = await sql<Modifier[]>`DELETE FROM modifiers WHERE id = ${modifierId} RETURNING *`;
    return result[0];
};