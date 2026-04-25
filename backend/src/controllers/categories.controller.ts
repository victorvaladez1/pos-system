import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import { CreateCategoryRequest } from "../types/category.types.js";
import { 
    createCategoryRow,
    getAllCategoryRows,
    deleteCategoryRowById,
    updateCategoryNameById,
    getCategoryRowByName
} from "../services/categories.service.js";

export const createCategory = async (req: Request, res: Response) => {
    const { name } = req.body ?? {};

    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Name must be a non-empty string." });
    }

    const newCategoryFields: CreateCategoryRequest = {
        name: name.trim()
    };

    try {
        const category = await createCategoryRow(newCategoryFields);
        
        return res.status(201).json({ category });
    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Category name already exists." });
        }

        console.error("Error creating category.", error);
        return res.status(500).json({ error: "Error creating category." });
    }
};

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