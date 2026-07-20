export type KitchenItemStatus = "submitted" | "ready";

export type kitchenOrderType = "dine_in" | "takeout" | "delivery";

export type KitchenOrderItemModifier = {
    order_item_modifier_id: string;
    modifier_id: string;
    modifier_name: string;
    quantity: number;
};

export type KitchenOrderItem = {
    order_item_id: string;
    item_id: string;
    item_name: string;
    quantity: number;
    notes: string | null;
    order_item_status: KitchenItemStatus;
    modifiers: KitchenOrderItemModifier[];
};

export type KitchenOrder = {
    order_id: string;
    ticket_name: string;
    order_type: kitchenOrderType;
    table_id: string | null;
    opened_at: string;
    items: KitchenOrderItem[];
};

export type KitchenOrdersResponse = {
    orders: KitchenOrder[];
};