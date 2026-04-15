import { Request, Response } from "express";
import { 
    createCategoryRow,
    getAllCategoryRows,
    getCategoryRowByName
} from "../services/categoryService.js"

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

export function updateCategory(req: Request, res: Response) {
    res.json({ msg: "Update existing category"});
}

export function deleteCategory(req: Request, res: Response) {
    res.json({ msg: "Delete existing category"});
}

