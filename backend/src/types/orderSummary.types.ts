export interface OrderSummaryOrder {
    id: string;
    order_type: string;
    order_status: string | null;
    ticket_name: string | null;
    guest_count: number | null;
    table_id: string | null;
    server_id: string | null;
    opened_at: string | null;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderSummaryModifier {
    order_item_modifier_id: string;
    modifier_id: string;
    modifier_name: string;
    quantity: number;
    price_in_cents: number;
    line_total_in_cents: number;
}

export interface OrderSummaryItem {
    order_item_id: string;
    item_id: string;
    item_name: string;
    quantity: number;
    unit_price_in_cents: number;
    line_total_in_cents: number;
    order_item_status: string;
    modifiers: OrderSummaryModifier[];
}

export interface OrderSummaryTotals {
    items_total_in_cents: number;
    modifiers_total_in_cents: number;
    subtotal_in_cents: number;
    payments_total_in_cents: number;
    balance_due_in_cents: number;
}

export interface OrderSummary {
    order: OrderSummaryOrder;
    items: OrderSummaryItem[];
    totals: OrderSummaryTotals;
}
