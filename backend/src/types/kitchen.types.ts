export interface KitchenModifier {
    order_item_modifier_id: string;
    modifier_id: string;
    modifier_name: string;
    quantity: number;
}

export interface KitchenItem {
    order_item_id: string;
    item_id: string;
    item_name: string;
    quantity: number;
    notes: string | null;
    order_item_status: string;
    modifiers: KitchenModifier[];
}

export interface KitchenOrder {
    order_id: string;
    ticket_name: string | null;
    order_type: string;
    table_id: string | null;
    opened_at: string;
    items: KitchenItem[];
}