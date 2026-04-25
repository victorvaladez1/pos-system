import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import { CreateCategoryRequest } from "../types/category.types.js";
import { 
    createCategoryRow,
    getAllCategoryRows,
    updateCategoryNameById,
    deleteCategoryRowById,
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

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await getAllCategoryRows();
        return res.status(200).json({ categories });
    } catch (error) {
        console.error("Error retrieving categories.", error);
        return res.status(500).json({ error: "Error retrieving categories." });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
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
};

export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Id must be a valid UUID." });
    }

    try {
        const deletedCategory = await deleteCategoryRowById(id);
        
        if (!deletedCategory) {
            return res.status(404).json({ error: "Category not found." });
        }

        return res.status(204);
    } catch (error) {
        console.error("Error deleting category.", error);
        return res.status(500).json({ error: "Error deleting category." });
    }
};