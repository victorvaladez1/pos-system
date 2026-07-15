export interface OrderItemModifier {
    id: string;
    order_item_id: string;
    modifier_id: string;
    quantity: number;
    created_at: string;
    updated_at: string;
}

export interface CreateOrderItemModifierRequest {
    order_item_id: string;
    modifier_id: string;
    quantity: number;
}