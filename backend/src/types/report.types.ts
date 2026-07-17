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