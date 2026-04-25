import sql from "../db.js";
import type { Modifier, CreateModifierRequest, UpdateModifierRequest } from "../types/modifier.types.js";

export const createModifierRow = async (newModifierValues: CreateModifierRequest): Promise<Modifier> => {
    const result = await sql<Modifier[]>`INSERT INTO modifiers (name, price_in_cents) VALUES (${newModifierValues.name}, ${newModifierValues.price_in_cents}) RETURNING *`;
    return result[0];
};

export const getModifierRows = async (): Promise<Modifier[]> => {
    const result = await sql<Modifier[]>`SELECT * FROM modifiers`;
    return result;
};

export const getModifierRowByName = async (name: string): Promise<Modifier> => {
    const result = await sql<Modifier[]> `SELECT * FROM modifiers WHERE name = ${name} LIMIT 1`;
    return result[0];
};

export const updateModifierRowById = async (modifierId: string, fieldsToUpdate: UpdateModifierRequest): Promise<Modifier> => {
    const result = await sql<Modifier[]>`UPDATE modifiers SET name = COALESCE(${fieldsToUpdate.name ?? null}, name), price_in_cents = COALESCE(${fieldsToUpdate.price_in_cents ?? null}, price_in_cents), updated_at = NOW() WHERE id = ${modifierId} RETURNING *`;
    return result[0];
};

export const deleteModifierRowById = async (modifierId: string): Promise<Modifier | undefined> => {
    const result = await sql<Modifier[]>`DELETE FROM modifiers WHERE id = ${modifierId} RETURNING *`;
    return result[0];
};