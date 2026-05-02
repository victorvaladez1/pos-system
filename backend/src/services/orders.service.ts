import sql from "../db.js";
import { Order, CreateOrderRequest, UpdateOrderRequest } from "../types/order.types.js";

export const createOrderRow = async (fields: CreateOrderRequest): Promise<Order> => {
    const now = new Date().toISOString();

    const result = await sql<Order[]>`INSERT INTO orders (table_id, server_id, order_type, order_status, ticket_name, guest_count, opened_at) 
        VALUES (${fields.table_id ?? null}, ${fields.server_id ?? null}, ${fields.order_type}, ${fields.order_status}, ${fields.ticket_name ?? null},
            ${fields.guest_count ?? null}, ${fields.opened_at ?? now}) RETURNING *`;
    return result[0];
};

export const getOrderRows = async (): Promise<Order[]> => {
    const result = await sql<Order[]>`SELECT * FROM orders ORDER BY created_at DESC`;
    return result;
};