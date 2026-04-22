import sql from "../db.js";

export async function createTableRow(table_number: number, capacity: number, current_status: string) {
    return await sql`INSERT INTO tables (table_number, capacity, current_status) VALUES (${table_number}, ${capacity}, ${current_status}) RETURNING id`;
}

export async function getTableRows() {
    return await sql`SELECT * FROM tables`;
}

export async function getTableRowByTableNumber(table_number: number) {
    return await sql`SELECT * FROM tables WHERE table_number = ${table_number} LIMIT 1`;
}

export async function updateTableRowById(tableId: string, table_number: number, capacity: number, current_status: string) {
    return await sql`UPDATE tables SET table_number = ${table_number}, capacity = ${capacity}, current_status = ${current_status} WHERE id = ${tableId} RETURNING id`;
}

export async function deleteTableRowById(tableId: string) {
    return await sql`DELETE FROM tables WHERE id = ${tableId} RETURNING id`;
}