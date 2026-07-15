export const paymentMethodEnum = [
    "cash",
    "card",
    "gift_card",
    "mobile_pay",
    "other"
] as const;

export type PaymentMethod = typeof paymentMethodEnum[number];

export const paymentStatusEnum = [
    "pending",
    "completed",
    "failed",
    "refunded",
    "voided"
] as const;

export type PaymentStatus = typeof paymentStatusEnum[number];

export interface Payment {
    id: string;
    order_id: string;
    amount_in_cents: number;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    created_at: string;
    updated_at: string;
}

export interface CreatePaymentRequest {
    order_id: string;
    amount_in_cents: number;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
}

export interface UpdatePaymentRequest {
    amount_in_cents?: number;
    payment_method?: PaymentMethod;
    payment_status?: PaymentStatus;
}

export const isPaymentMethod = (value: unknown): value is PaymentMethod => {
    return typeof value === "string" && paymentMethodEnum.includes(value as PaymentMethod);
};

export const isPaymentStatus = (value: unknown): value is PaymentStatus => {
    return typeof value === "string" && paymentStatusEnum.includes(value as PaymentStatus);
};