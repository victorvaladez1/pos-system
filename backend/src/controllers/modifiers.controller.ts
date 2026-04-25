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
    const { id } = req.params;

    if (!isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Id must be a valid UUID." });
    }

    const { name, price_in_cents }: UpdateModifierRequest = req.body ?? {};

    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
        return res.status(400).json({ error: "Modifier name must be non-empty string." });
    }

    if (price_in_cents !== undefined && (typeof price_in_cents !== "number" || !Number.isInteger(price_in_cents) || price_in_cents < 0)) {
        return res.status(400).json({ error: "Price must be non-negative integer."});
    }

    const fieldsToUpdate: UpdateModifierRequest = {};

    if (name !== undefined) {
        fieldsToUpdate.name = name.trim();
    }

    if (price_in_cents !== undefined) {
        fieldsToUpdate.price_in_cents = price_in_cents;
    }

    if (Object.keys(fieldsToUpdate).length == 0) {
        return res.status(400).json({ error: "No valid fields provided to update." });
    }

    try {
        const updatedModifier = await updateModifierRowById(id, fieldsToUpdate);

        if (!updatedModifier) {
            return res.status(404).json({ error: "Category not found." });
        }

        return res.status(200).json({ modifier: updatedModifier });
    } catch(error: any) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Modifier name already exists."});
        }

        console.error("Failed to update modifier.", error);
        return res.status(500).json({ error: "Failed to update modifier." });
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