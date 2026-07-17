import sql from "../db.js";
import {
    KitchenOrder,
    KitchenItem,
    KitchenModifier
} from "../types/kitchen.types.js";

interface KitchenItemRow {
    order_id: string;
    order_item: string;
    ticket_name: string | null;
    order_type: string;
    table_id: string | null;
    opened_at: string;
    order_item_id: string;
    item_id: string;
    item_name: string;
    quantity: number;
    notes: string | null;
    order_item_status: string;
}

interface KitchenModifierRow {
    order_item_id: string;
    order_item_modifier_id: string;
    modifier_id: string;
    modifier_name: string;
    quantity: number;
}

export const getKitchenOrders = async (): Promise<KitchenOrder[]> => {
    const itemRows = await sql<KitchenItemRow[]>`
        SELECT
            o.id AS order_id,
            o.ticket_name,
            o.order_type,
            o.table_id,
            o.opened_at,
            oi.id AS order_item_id,
            i.id AS item_id,
            i.name AS item_name,
            oi.quantity,
            oi.notes,
            oi.order_item_status
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN items i ON i.id = oi.item_id
        WHERE oi.order_item_status IN ('submitted', 'ready')
        ORDER BY o.opened_at ASC, oi.created_at ASC
    `;

    if (itemRows.length === 0) {
        return [];
    }

    const orderItemIds = itemRows.map((itemRow) => itemRow.order_item_id);

    const modifierRows = await sql<KitchenModifierRow[]>`
        SELECT
            oim.order_item_id,
            oim.id AS order_item_modifier_id,
            m.id AS modifier_id,
            m.name AS modifier_name,
            oim.quantity
        FROM order_item_modifiers oim
        JOIN modifiers m ON m.id = oim.modifier_id
        WHERE oim.order_item_id = ANY(${orderItemIds})
        ORDER BY oim.created_at ASC
    `;

    const modifiersByOrderItemId = new Map<string, KitchenModifier[]>();

    for (const modifierRow of modifierRows) {
        const modifier: KitchenModifier = {
            order_item_modifier_id: modifierRow.order_item_modifier_id,
            modifier_id: modifierRow.modifier_id,
            modifier_name: modifierRow.modifier_name,
            quantity: modifierRow.quantity
        };

        const currentModifiers = modifiersByOrderItemId.get(modifierRow.order_item_id) ?? [];

        currentModifiers.push(modifier);
        modifiersByOrderItemId.set(modifierRow.order_item_id, currentModifiers);
    }

    const ordersById = new Map<string, KitchenOrder>();

    for (const itemRow of itemRows) {
        const kitchenItem: KitchenItem = {
            order_item_id: itemRow.order_item_id,
            item_id: itemRow.item_id,
            item_name: itemRow.item_name,
            quantity: itemRow.quantity,
            notes: itemRow.notes,
            order_item_status: itemRow.order_item_status,
            modifiers: modifiersByOrderItemId.get(itemRow.order_item_id) ?? []
        };

        const existingOrder = ordersById.get(itemRow.order_id);

        if (existingOrder) {
            existingOrder.items.push(kitchenItem);
        } else {
            ordersById.set(itemRow.order_id, {
                order_id: itemRow.order_id,
                ticket_name: itemRow.ticket_name,
                order_type: itemRow.order_type,
                table_id: itemRow.table_id,
                opened_at: itemRow.opened_at,
                items: [kitchenItem]
            });
        }
    };

    return Array.from(ordersById.values());
}