import sql from "../db.js";
import type {
    OrderSummary,
    OrderSummaryOrder,
    OrderSummaryItem,
    OrderSummaryModifier
} from "../types/orderSummary.types.js";

interface OrderItemSummaryRow {
    order_item_id: string;
    item_id: string;
    item_name: string;
    quantity: number;
    unit_price_in_cents: number;
    line_total_in_cents: number;
    notes: string | null;
    order_item_status: string;
}

interface ModifierSummaryRow {
    order_item_id: string;
    order_item_modifier_id: string;
    modifier_id: string;
    modifier_name: string;
    quantity: number;
    price_in_cents: number;
    line_total_in_cents: number;
}

interface PaymentTotalRow {
    payments_total_in_cents: number | null;
}

export const getOrderSummarybyId = async (
    orderId: string
): Promise<OrderSummary | undefined> => {
    const orderResult = await sql<OrderSummaryOrder[]>`
        SELECT 
            id, 
            order_type, 
            order_status, 
            ticket_name, 
            guest_count, 
            table_id, 
            server_id, 
            opened_at, 
            closed_at, 
            created_at, 
            updated_at 
        FROM orders 
        WHERE id =${orderId}`;

    const order = orderResult[0];

    if (!order) {
        return undefined;
    }

    const itemRows = await sql<OrderItemSummaryRow[]>`
        SELECT 
            oi.id AS order_item_id,
            i.id AS item_id,
            i.name AS item_name,
            oi.quantity,
            oi.unit_price_in_cents,
            oi.quantity * oi.unit_price_in_cents AS line_total_in_cents,
            oi.notes,
            oi.order_item_status
        FROM order_items oi
        JOIN items i ON i.id = oi.item_id
        WHERE oi.order_id = ${orderId}
        ORDER BY oi.created_at ASC
    `;

    const modifierRows = await sql<ModifierSummaryRow[]>`
        SELECT
            oim.order_item_id,
            oim.id AS order_item_modifier_id,
            m.id AS modifier_id,
            m.name AS modifier_name,
            oim.quantity,
            m.price_in_cents,
            oim.quantity * m.price_in_cents AS line_total_in_cents
        FROM order_item_modifiers oim
        JOIN modifiers m on m.id = oim.modifier_id
        JOIN order_items oi on oi.id = oim.order_item_id
        WHERE oi.order_id = ${orderId}
        ORDER BY oim.created_at ASC
    `;

    const paymentTotalResult = await sql<PaymentTotalRow[]>`
        SELECT COALESCE(SUM(amount_in_cents), 0)::int AS payments_total_in_cents
        FROM payments
        WHERE order_id = ${orderId}
            AND payment_status = 'completed'
        `;

    const modifiersByOrderItemId = new Map<string, OrderSummaryModifier[]>();

    for (const modifierRow of modifierRows) {
        const modifier: OrderSummaryModifier = {
            order_item_modifier_id: modifierRow.order_item_modifier_id,
            modifier_id: modifierRow.modifier_id,
            modifier_name: modifierRow.modifier_name,
            quantity: modifierRow.quantity,
            price_in_cents: modifierRow.price_in_cents,
            line_total_in_cents: modifierRow.line_total_in_cents
        };

        const currentModifiers = modifiersByOrderItemId.get(modifierRow.order_item_id) ?? [];
        currentModifiers.push(modifier);
        modifiersByOrderItemId.set(modifierRow.order_item_id, currentModifiers);
    }

    const items: OrderSummaryItem[] = itemRows.map((itemRow) => ({
        order_item_id: itemRow.order_item_id,
        item_id: itemRow.item_id,
        item_name: itemRow.item_name,
        quantity: itemRow.quantity,
        unit_price_in_cents: itemRow.unit_price_in_cents,
        line_total_in_cents: itemRow.line_total_in_cents,
        notes: itemRow.notes,
        order_item_status: itemRow.order_item_status,
        modifiers: modifiersByOrderItemId.get(itemRow.order_item_id) ?? []
    }));

    const itemsTotalInCents = items.reduce(
        (total, item) => total + item.line_total_in_cents,
        0
    );

    const modifiersTotalInCents = items.reduce(
        (total, item) => 
            total +
            item.modifiers.reduce(
                (modifierTotal, modifier) => modifierTotal + modifier.line_total_in_cents,
                0
            ),
        0
    );

    const subtotalInCents = itemsTotalInCents + modifiersTotalInCents;
    const paymentsTotalInCents = paymentTotalResult[0]?.payments_total_in_cents ?? 0;
    const balanceDueInCents = subtotalInCents - paymentsTotalInCents;

    return {
        order,
        items,
        totals: {
            items_total_in_cents: itemsTotalInCents,
            modifiers_total_in_cents: modifiersTotalInCents,
            subtotal_in_cents: subtotalInCents,
            payments_total_in_cents: paymentsTotalInCents,
            balance_due_in_cents: balanceDueInCents
        }
    };
};