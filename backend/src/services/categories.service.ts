import sql from "../db.js";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types/category.types.js";

export const createCategoryRow = async (newCategory: CreateCategoryRequest): Promise<Category> => {
    const result = await sql<Category[]>`INSERT INTO categories (name) VALUES (${newCategory.name}) RETURNING *`;

    return result[0];
};

export const getAllCategoryRows = async (): Promise<Category[]> => {
    const result = await sql<Category[]>`SELECT * FROM categories ORDER BY name ASC`;
    return result;
};

export const updateCategoryNameById = async (categoryId: string, categoryName: string) => {
    const result = await sql`UPDATE categories SET name = ${categoryName} WHERE id = ${categoryId}`;
    return result;
};

export const deleteCategoryRowById = async (categoryId: string): Promise<Category | undefined> => {
    const result = await sql<Category[]>`DELETE FROM categories WHERE id = ${categoryId} RETURNING *`;
    return result[0];
};