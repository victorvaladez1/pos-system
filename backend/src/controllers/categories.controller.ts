import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import { CreateCategoryRequest, UpdateCategoryRequest } from "../types/category.types.js";
import { 
    createCategoryRow,
    getAllCategoryRows,
    updateCategoryById,
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
    const { id } = req.params;

    if (!isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Id must be a valid UUID." });
    }

    const { name }: UpdateCategoryRequest = req.body ?? {};

    if (name !== undefined && (typeof name !== "string" || name.trim() == "")) {
        return res.status(400).json({ error: "Category name must be non-empty string." });
    }

    const fieldsToUpdate: UpdateCategoryRequest = {};

    if (name !== undefined) {
        fieldsToUpdate.name = name.trim();
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ error: "No valid fields provided to update." });
    }

    try {
        const updatedCategory = await updateCategoryById(id, fieldsToUpdate);

        if (!updatedCategory) {
            return res.status(404).json({ error: "Category not found." });
        }

        return res.status(200).json({ category: updatedCategory });
    } catch (error: any ) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Category name already exists." });
        }

        console.error("Failed to update category.", error);
        return res.status(500).json({ error: "Failed to update category." });
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