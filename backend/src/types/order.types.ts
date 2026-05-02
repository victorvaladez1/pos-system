export const orderTypeEnum = ["dine_in", "takeout", "delivery"] as const;
export const orderStatusEnum = ["open", "submitted", "paid", "cancelled"] as const;

export type OrderType = typeof orderTypeEnum[number];
export type OrderStatus = typeof orderStatusEnum[number];

export interface Order {
    id: string;
    table_id: string | null;
    server_id: string | null;
    order_type: OrderType;
    order_status: OrderStatus;
    ticket_name: string | null;
    guest_count: number | null;
    opened_at: string;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
}

export const isOrderType = (value: unknown): value is OrderType => {
    return typeof value === "string" && orderTypeEnum.includes(value as OrderType);
};

export const isOrderStatus = (value: unknown): value is OrderStatus => {
    return typeof value === "string" && orderStatusEnum.includes(value as OrderStatus);
};

export interface CreateOrderRequest {
    table_id?: string;
    server_id?: string;
    order_type: OrderType;
    order_status: OrderStatus;
    ticket_name?: string;
    guest_count?: number;
    opened_at?: string;
}

export interface UpdateOrderRequest {
    table_id?: string | null;
    server_id?: string | null;
    order_type?: OrderType;
    order_status?: OrderStatus;
    ticket_name?: string | null;
    guest_count?: number | null;
    opened_at?: string;
    closed_at?: string | null;
}