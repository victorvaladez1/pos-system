import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import {
    getModifierRows,
    getModifierRowByName,
    createModifierRow,
    updateModifierRowById,
    deleteModifierRowById
} from "../services/modifiers.service.js"

export async function createModifier(req: Request, res: Response) {
    const { name, price_in_cents } = req.body ?? {};

    if (!name || typeof name !== "string" || name.trim() == "") {
        return res.status(400).json({ error: "Enter valid name."});
    }

    if (!price_in_cents || typeof price_in_cents !== "number" || price_in_cents < 0) {
        return res.status(400).json({ error: "Enter valid price_in_cents" });
    }

    const existingModifier = await getModifierRowByName(name);

    if (existingModifier.length > 0) {
        return res.status(400).json({ error: "Cannot create duplicate modifier." });
    }

    try {
        const modifier = await createModifierRow(name, price_in_cents);
        return res.status(201).json({ modifier });
    } catch (error) {
        console.log("Failed to create modifier row in db.");
        return res.status(500).json({ error: "Failed to create modifier row in db."});
    }
}

export async function getModifiers(req: Request, res: Response) {
    try {   
        const modifiers = await getModifierRows();
        return res.status(200).json({ modifiers });
    } catch (error) {
        console.log("Failed to return modifier rows from db.");
        return res.status(500).json({error : "Failed to return modifier rows from db."});
    }
}

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
}

export async function deleteModifier(req: Request, res: Response) {
    const { id } = req.params ?? {};

    if (!id || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Enter valid modifier id." });
    }

    try {
        const deletedModifier = await deleteModifierRowById(id);
        return res.status(200).json({ deletedModifier });
    } catch (error) {
        console.log("Failed to delete modifier  row from db.", error);
        return res.status(500).json({ error: "Failed to delete modifier row from db."})
    }
}