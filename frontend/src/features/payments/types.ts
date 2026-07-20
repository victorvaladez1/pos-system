export type PaymentMethod = 
    | "cash"
    | "card"
    | "gift_card"
    | "mobile_pay"
    | "other";

export type PaymentStatus = 
    | "pending"
    | "completed"
    | "failed"
    | "refunded"
    | "voided";

export type Payment = {
    id: string;
    order_id: string;
    amount_in_cents: number;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    created_at: string;
    updated_at: string;
};

export type PaymentsResponse = {
    payments: Payment[];
};

export type CreatePaymentInput = {
    order_id: string;
    amount_in_cents: number;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
};

export type PaymentResponse = {
    payment: Payment;
};