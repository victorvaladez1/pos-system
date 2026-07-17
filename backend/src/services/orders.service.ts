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

export const updateOrderRowById = async (id: string, fieldsToUpdate: UpdateOrderRequest): Promise<Order | undefined> => {
    const result = await sql<Order[]>`UPDATE orders SET ${sql(fieldsToUpdate)}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
    return result[0];
};

export const deleteOrderRowById = async (id: string): Promise<Order | undefined> => {
    const result = await sql<Order[]>`DELETE FROM orders WHERE id = ${id} RETURNING *`
    return result[0];
};

export const closeOrderRowById = async (orderId: string): Promise<Order | undefined> => {
    const result = await sql<Order[]>`
        UPDATE orders 
        SET 
            order_status = 'paid',
            closed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING *
    `;

    return result[0];
};

export const getOpenOrderRows = async (): Promise<Order[]> => {
    const result = await sql<Order[]>`
        SELECT *
        FROM orders
        WHERE order_status = 'open'
        ORDER BY opened_at DESC
    `;

    return result;
};

export const cancelOrderRowById = async (orderId: string): Promise<Order | undefined> => {
    const result = await sql<Order[]>`
        UPDATE orders
        SET
            order_status = 'cancelled',
            closed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING *
    `;

    return result[0];
};

export const getOpenOrderRowByTableId = async (
    tableId: string
): Promise<Order | undefined> => {
    const result = await sql<Order[]>`
        SELECT *
        FROM orders
        WHERE table_id = ${tableId}
            AND order_status IN ('open', 'submitted')
        ORDER BY opened_at DESC
        LIMIT 1
    `;

    return result[0];
}