import sql from "../db.js";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types/category.types.js";

export const createCategoryRow = async (newCategory: CreateCategoryRequest): Promise<Category> => {
    const result = await sql<Category[]>`INSERT INTO categories (name) VALUES (${newCategory.name}) RETURNING *`;

    return result[0];
};

export async function getAllCategoryRows() {
    const result = await sql`SELECT * FROM categories`;
    return result;
};

export async function updateCategoryNameById(categoryId: string, categoryName: string) {
    const result = await sql`UPDATE categories SET name = ${categoryName} WHERE id = ${categoryId}`;
    return result;
}

export async function deleteCategoryRowById(categoryId: string) {
    const result = await sql`DELETE FROM categories WHERE id = ${categoryId}`;
    return result;
}

export async function getCategoryRowByName(categoryName: string) {
    const result = await sql`SELECT * FROM categories WHERE name = ${categoryName} LIMIT 1`;
    return result;
}

export async function getCategoryRowById(categoryId: string) {
    const result = await sql`SELECT * FROM categories WHERE id = ${categoryId} LIMIT 1`;
    return result;
}