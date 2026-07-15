import sql from "../db.js";
import type {
    OrderItemModifier,
    CreateOrderItemModifierRequest
} from "../types/orderItemModifier.types.js";

export const createOrderItemModifierRow = async (
    fields: CreateOrderItemModifierRequest
): Promise<OrderItemModifier> => {
    const result = await sql<OrderItemModifier[]>`
        INSERT INTO order_item_modifiers 
            (order_item_id, modifier_id, quantity)
        VALUES 
            (${fields.order_item_id}, ${fields.modifier_id}, ${fields.quantity})
        RETURNING *
    `;

    return result[0];
};

export const getOrderItemModifierRows = async (): Promise<OrderItemModifier[]> => {
    const result = await sql<OrderItemModifier[]>`
        SELECT * FROM order_item_modifiers
        ORDER BY created_at DESC
    `;

    return result;
};

export const deleteOrderItemModifierRowById = async (
    id: string
): Promise<OrderItemModifier | undefined> => {
    const result = await sql<OrderItemModifier[]>`
        DELETE FROM order_item_modifiers
        WHERE id = ${id}
        RETURNING *
    `;

    return result[0];
};