export const tableStatusEnum = ['available', 'occupied', 'reserved', 'dirty', 'out_of_service'] as const;

export type TableStatus = typeof tableStatusEnum[number];

export interface Table {
    id: string;
    table_number: number;
    capacity: number;
    current_status: TableStatus;
    created_at: string;
    updated_at: string;
}

export const isTableStatus = (value: unknown): value is TableStatus => {
    return typeof value === "string" && tableStatusEnum.includes(value as TableStatus);
}

export interface CreateTableRequest {
    table_number: number;
    capacity: number;
    current_status: TableStatus;
}

 export interface UpdateTableRequest {
    table_number?: number;
    capacity?: number;
    current_status?: TableStatus;
}