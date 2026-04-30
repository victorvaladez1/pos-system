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

export const updateTableRowById = async (tableId: string, fieldsToUpdate: UpdateTableRequest): Promise<Table | undefined> => {
    const result = await sql<Table[]>`UPDATE tables SET table_number = COALESCE(${fieldsToUpdate.table_number ?? null}, table_number), capacity = COALESCE(${fieldsToUpdate.capacity ?? null}, capacity), current_status = COALESCE(${fieldsToUpdate.current_status ?? null}, current_status), updated_at = NOW() WHERE id = ${tableId} RETURNING *`;
    return result[0];
};

export const deleteTableRowById = async (tableId: string): Promise<Table> => {
    const result = await sql<Table[]>`DELETE FROM tables WHERE id = ${tableId} RETURNING *`;
    return result[0];
};