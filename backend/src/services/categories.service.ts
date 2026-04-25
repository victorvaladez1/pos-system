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

export async function getCategoryRowById(categoryId: string) {
    const result = await sql`SELECT * FROM categories WHERE id = ${categoryId} LIMIT 1`;
    return result;
}

export const updateCategoryById = async (categoryId: string, fieldsToUpdate: UpdateCategoryRequest): Promise<Category | undefined> => {
    const result = await sql<Category[]>`UPDATE categories SET name = COALESCE(${fieldsToUpdate.name ?? null}, name), updated_at = NOW() WHERE id = ${categoryId} RETURNING *`;

    return result[0];
};

export const deleteCategoryRowById = async (categoryId: string): Promise<Category | undefined> => {
    const result = await sql<Category[]>`DELETE FROM categories WHERE id = ${categoryId} RETURNING *`;
    return result[0];
};