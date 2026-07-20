export type PaymentMethod = 
    | "cash"
    | "card"
    | "gift_card"
    | "mobile_pay"
    | "other";

export type OrderType = "dine_in" | "takeout" | "delivery";

export type OrderStatus = "open" | "submitted" | "paid" | "cancelled";

export type DailySalesReport = {
    date: string;
    gross_sales_in_cents: number;
    payment_count: number;
};

export type PaymentMethodReportItem = {
    payment_method: PaymentMethod;
    gross_sales_in_cents: number;
    payment_count: number;
};

export type TopItemReportItem = {
    item_id: string;
    item_name: string;
    quantity_sold: number;
    gross_sales_in_cents: number;
};

export type OpenBalanceReportItem = {
    order_id: string;
    ticket_name: string;
    order_type: OrderType;
    order_status: OrderStatus;
    subtotal_in_cents: number;
    payment_total_in_cents: number;
    balance_due_in_cents: number;
};

export type DailySalesResponse = {
    report: DailySalesReport;
};

export type PaymentMethodsResponse = {
    report: PaymentMethodReportItem[];
};

export type TopItemsResponse = {
    report: TopItemReportItem[];
};

export type OpenBalancesResponse = {
    report: OpenBalanceReportItem[];
};