import sql from "../db.js";
import { Table, CreateTableRequest, UpdateTableRequest } from "../types/table.types.js";

export const createTableRow = async (fields: CreateTableRequest): Promise<Table> => {
    const result = await sql<Table[]>`INSERT INTO tables (table_number, capacity, current_status) VALUES (${fields.table_number}, ${fields.capacity}, ${fields.current_status}) RETURNING *`;
    return result[0];
};

export const getTableRows = async (): Promise<Table[]> => {
    const result = await sql<Table[]>`SELECT * FROM tables ORDER BY table_number ASC`;
    return result;
};

export async function updateTableRowById(tableId: string, table_number: number, capacity: number, current_status: string) {
    return await sql`UPDATE tables SET table_number = ${table_number}, capacity = ${capacity}, current_status = ${current_status} WHERE id = ${tableId} RETURNING id`;
}

export const deleteTableRowById = async (tableId: string): Promise<Table> => {
    const result = await sql<Table[]>`DELETE FROM tables WHERE id = ${tableId} RETURNING *`;
    return result[0];
};