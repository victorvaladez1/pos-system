import sql from "../db.js";

export async function createCategoryRow(categoryName: string) {
    const result = await sql`INSERT INTO categories (name) VALUES (${categoryName})`;
    return result;
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