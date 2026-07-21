export type OrderType = "dine_in" | "takeout" | "delivery";

export type OrderStatus = "open" | "submitted" | "paid" | "cancelled";

export type OrderItemStatus = 
    | "pending" 
    | "submitted"
    | "ready" 
    | "served"
    | "voided";

export type Order = {
    id: string;
    table_id: string | null;
    server_id: string;
    order_type: OrderType;
    order_status: OrderStatus;
    ticket_name: string;
    guest_count: number;
    opened_at: string;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
};

export type OrdersResponse = {
    orders: Order[];
}

export type OrderSummaryModifier = {
    order_item_modifier_id: string;
    modifier_id: string;
    modifier_name: string;
    quantity: number;
    price_in_cents: number;
    line_total_in_cents: number;
};

export type OrderSummaryItem = {
    order_item_id: string;
    item_id: string;
    item_name: string;
    quantity: number;
    unit_price_in_cents: number;
    line_total_in_cents: number;
    notes: string | null;
    order_item_status: OrderItemStatus;
    modifiers: OrderSummaryModifier[];
};

export type OrderSummaryTotals = {
    items_total_in_cents: number;
    modifiers_total_in_cents: number;
    subtotal_in_cents: number;
    payments_total_in_cents: number;
    balance_due_in_cents: number;
};

export type OrderSummary = {
    order: Order;
    items: OrderSummaryItem[];
    totals: OrderSummaryTotals;
};

export type OrderSummaryResponse = OrderSummary;