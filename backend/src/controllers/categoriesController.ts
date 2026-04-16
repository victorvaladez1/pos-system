import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import { 
    createCategoryRow,
    getAllCategoryRows,
    deleteCategoryRowById,
    updateCategoryNameById,
    getCategoryRowByName
} from "../services/categoryService.js";

export async function createCategory(req: Request, res: Response) {
    const { name } = req.body ?? {};

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Category name is required." });
    }

    const existingRow = await getCategoryRowByName(name);

    if (existingRow.length > 0) {
        return res.status(409).json({ error: "Cannot create duplicate category." });
    }
    
    const categoryRow = await createCategoryRow(name);
    return res.status(201).json({ categoryRow });
}

export async function getAllCategories(req: Request, res: Response) {
    try {
        const categoryRows = await getAllCategoryRows();
        res.json({ categoryRows });
    } catch (error) {
        console.error("Failed to fetch category rows from db:", error);
        res.status(500).json({ error: "Failed to fetch category rows from db." });
    }
}

export async function updateCategory(req: Request, res: Response) {
    const { id } = req.params ?? {};

    if (!isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Invalid UUID" });
    }

    const { name } = req.body ?? {};

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Category name is required." });
    }

    try {
        const updatedRow = await updateCategoryNameById(id, name);
        return res.json({ updatedRow });
    } catch (error) {
        console.error("Failed to update category row name column in db.");
        res.status(500).json({ error: "Failed to update category row name column in db." });
    }
}

export async function deleteCategory(req: Request, res: Response) {
    const { id } = req.params ?? {};

    if (!isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Invalid UUID" });
    }

    try {
        const deletedRow = await deleteCategoryRowById(id);
        res.json({ deletedRow });
    } catch (error) {
        console.error("Failed to delete category row from db:", error);
        res.status(500).json({ error: "Failed to delete category row from db." });
    }
}