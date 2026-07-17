export interface DailySalesReport {
    date: string;
    gross_sales_in_cents: number;
    payment_count: number;
}

export interface PaymentMethodReport {
    payment_method: string;
    gross_sales_in_cents: number;
    payment_count: number;
}

export interface TopItemReport {
    item_id: string;
    item_name: string;
    quantity_sold: number;
    gross_sales_in_cents: number;
}

export interface OpenBalanceReport {
    order_id: string;
    ticket_name: string | null;
    order_type: string;
    order_status: string;
    subtotal_in_cents: number;
    payments_total_in_cents: number;
    balance_due_in_cents: number;
}
