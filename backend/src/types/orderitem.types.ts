export const orderItemStatusEnum = ['pending', 'submitted', 'ready', 'served', 'voided'] as const;

export type OrderItemStatus = typeof orderItemStatusEnum[number];

export interface OrderItem {
    id: string;
    order_id: string;
    item_id: string;
    quantity: number;
    unit_price_in_cents: number;
    notes: string | null;
    order_item_status: OrderItemStatus;
    created_at: string;
    updated_at: string;
}

export const isOrderItemStatus = (value: unknown): value is OrderItemStatus => {
    return typeof value === 'string' && orderItemStatusEnum.includes(value as OrderItemStatus);
};

export interface CreateOrderItemRequest {
    order_id: string;
    item_id: string;
    quantity: number;
    unit_price_in_cents: number;
    notes?: string | null;
    order_item_status: OrderItemStatus;
}

export interface UpdateOrderItemRequest {
    quantity?: number;
    unit_price_in_cents?: number;
    notes?: string | null;
    order_item_status?: OrderItemStatus;
}