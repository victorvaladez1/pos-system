import sql from "../db.js";
import { 
    OrderItem,
    CreateOrderItemRequest,
    UpdateOrderItemRequest,
    OrderItemStatus
} from "../types/orderitem.types.js"

export const createOrderItemRow = async (fields: CreateOrderItemRequest): Promise<OrderItem> => {
    const result = await sql<OrderItem[]>`INSERT INTO order_items (order_id, item_id, quantity, unit_price_in_cents, notes, order_item_status) 
        VALUES (${fields.order_id}, ${fields.item_id}, ${fields.quantity}, ${fields.unit_price_in_cents}, ${fields.notes ?? null}, ${fields.order_item_status}) RETURNING *`
    return result[0];
};

export const getOrderItemRows = async (): Promise<OrderItem[]> => {
    const result = await sql<OrderItem[]>`SELECT * FROM order_items ORDER BY created_at DESC`;
    return result;
};

export const updateOrderItemRowById = async (
    orderItemId: string,
    fieldsToUpdate: UpdateOrderItemRequest
) : Promise<OrderItem | undefined> => {
    const result = await sql<OrderItem[]>`UPDATE order_items SET ${sql(fieldsToUpdate)}, updated_at = NOW() WHERE id = ${orderItemId} RETURNING *`;

    return result[0];
};

export const deleteOrderItemRowById = async (
    orderItemId: string
) : Promise<OrderItem | undefined> => {
    const result = await sql<OrderItem[]>`DELETE FROM order_items WHERE id = ${orderItemId} RETURNING *`;

    return result[0];
}

export const updateOrderItemStatusById = async (
    orderItemId: string,
    orderItemStatus: OrderItemStatus
) : Promise<OrderItem | undefined> => {
    const result = await sql<OrderItem[]>`
        UPDATE order_items
        SET 
            order_item_status = ${orderItemStatus},
            updated_at = NOW()
        WHERE id = ${orderItemId}
        RETURNING *
    `;

    return result[0];
};