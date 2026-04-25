import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import type { Modifier, CreateModifierRequest, UpdateModifierRequest } from "../types/modifier.types.js";
import {
    getModifierRows,
    getModifierRowByName,
    createModifierRow,
    updateModifierRowById,
    deleteModifierRowById
} from "../services/modifiers.service.js"

export const createModifier = async (req: Request, res: Response) => {
    const { name, price_in_cents } = req.body ?? {};

    if (!name || typeof name !== "string" || name.trim() == "") {
        return res.status(400).json({ error: "Enter valid name."});
    }

    if (!price_in_cents || typeof price_in_cents !== "number" || !Number.isInteger(price_in_cents) || price_in_cents < 0) {
        return res.status(400).json({ error: "Enter valid price_in_cents" });
    }

    const newModifierValues: CreateModifierRequest = {
        name,
        price_in_cents
    };

    try {
        const modifier = await createModifierRow(newModifierValues);
        return res.status(201).json({ modifier });
    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Modifier name already exists." });
        }

        console.error("Failed to create modifier.", error);
        return res.status(500).json({ error: "Failed to create modifier." });
    }
};

export const getModifiers = async (req: Request, res: Response) => {
    try {   
        const modifiers = await getModifierRows();
        return res.status(200).json({ modifiers });
    } catch (error) {
        console.log("Failed to return modifier rows from db.");
        return res.status(500).json({error : "Failed to return modifier rows from db."});
    }
};

export async function updateModifier(req: Request, res: Response) {
    const { id } = req.params ?? {};
    const { name, price_in_cents } = req.body ?? {};
 
    if (!id || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Enter valid modifier id." });
    }

    if (!name || typeof name !== "string" || name.trim() == "") {
        return res.status(400).json({ error: "Enter valid name." });
    }

    if (!price_in_cents || typeof price_in_cents !== "number" || price_in_cents < 0) {
        return res.status(400).json({ error: "Enter valid price_in_cents" });
    }

    const existingModifier = await getModifierRowByName(name);

    if (existingModifier.length > 0) {
        return res.status(400).json({ error: "Cannot create duplicate modifier" });
    }

    try {
        const updatedModifier = await updateModifierRowById(id, name, price_in_cents);
        return res.status(200).json({ updatedModifier });
    } catch (error) {
        console.log("Failed to update modifier row in db.", error);
        return res.status(500).json({ error: "Failed to update modifier row in db."});
    }
};

export async function deleteModifier(req: Request, res: Response) {
    const { id } = req.params ?? {};

    if (!id || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Id must be valid UUID." });
    }

    try {
        const deletedModifier = await deleteModifierRowById(id);

        if (!deletedModifier) {
            return res.status(404).json({ error: "Modifier not found." });
        }

        return res.sendStatus(204);
    } catch (error) {
        console.log("Error deleting modifier.", error);
        return res.status(500).json({ error: "Error deleting modifier." });
    }
};