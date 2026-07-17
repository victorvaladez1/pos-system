import sql from "../db.js";
import type { DailySalesReport, PaymentMethodReport, TopItemReport, OpenBalanceReport } from "../types/report.types.js";

interface DailySalesReportRow {
    date: string;
    gross_sales_in_cents: number | null;
    payment_count: number;
}

interface PaymentMethodReportRow {
    payment_method: string;
    gross_sales_in_cents: number;
    payment_count: number;
}

interface TopItemReportRow {
    item_id: string;
    item_name: string;
    quantity_sold: number;
    gross_sales_in_cents: number;
}

interface OpenBalanceReportRow {
    order_id: string;
    ticket_name: string | null;
    order_type: string;
    order_status: string;
    subtotal_in_cents: number;
    payments_total_in_cents: number;
    balance_due_in_cents: number;
}

export const getDailySalesReport = async(): Promise<DailySalesReport> => {
    const result = await sql<DailySalesReportRow[]>`
        SELECT
            CURRENT_DATE::text AS date,
            COALESCE(SUM(amount_in_cents), 0)::int AS gross_sales_in_cents,
            COUNT(*)::int AS payment_count
        FROM payments
        WHERE payment_status = 'completed'
            AND created_at >= CURRENT_DATE
            AND created_at < CURRENT_DATE + INTERVAL '1 day'    
    `;

    const report = result[0];

    return {
        date: report.date,
        gross_sales_in_cents: report.gross_sales_in_cents ?? 0,
        payment_count: report.payment_count
    };
};

export const getPaymentMethodReports = async (): Promise<PaymentMethodReport[]> => {
    const result = await sql<PaymentMethodReportRow[]>`
        SELECT
            payment_method,
            COALESCE(SUM(amount_in_cents), 0)::int AS gross_sales_in_cents,
            COUNT(*)::int AS payment_count
        FROM payments
        WHERE payment_status = 'completed'
        GROUP BY payment_method
        ORDER BY gross_sales_in_cents DESC
    `;

    return result;
};

export const getTopItemsReport = async (): Promise<TopItemReport[]> => {
    const result = await sql<TopItemReportRow[]>`
        SELECT
            i.id AS item_id,
            i.name AS item_name,
            SUM(oi.quantity)::int AS quantity_sold,
            SUM(oi.quantity * oi.unit_price_in_cents)::int AS gross_sales_in_cents
        FROM order_items oi
        JOIN items i ON i.id = oi.item_id
        WHERE oi.order_item_status != 'voided'
        GROUP BY i.id, i.name
        ORDER BY quantity_sold DESC, gross_sales_in_cents DESC
    `;

    return result;
};

export const getOpenBalancesReport = async (): Promise<OpenBalanceReport[]> => {
    const result = await sql<OpenBalanceReportRow[]>`
        SELECT
            o.id AS order_id,
            o.ticket_name,
            o.order_type,
            o.order_status,
            COALESCE(item_totals.subtotal_in_cents, 0)::int AS subtotal_in_cents,
            COALESCE(payment_totals.payments_total_in_cents, 0)::int AS payments_total_in_cents,
            (
                COALESCE(item_totals.subtotal_in_cents, 0)
                - COALESCE(payment_totals.payments_total_in_cents, 0)
            )::int AS balance_due_in_cents
        FROM orders o
        LEFT JOIN (
            SELECT 
                order_id,
                SUM(quantity * unit_price_in_cents)::int AS subtotal_in_cents
            FROM order_items
            WHERE order_item_status != 'voided'
            GROUP BY order_id
        ) item_totals ON item_totals.order_id = o.id
        LEFT JOIN (
            SELECT 
                order_id,
                SUM(amount_in_cents)::int AS payments_total_in_cents
            FROM payments
            WHERE payment_status = 'completed'
            GROUP BY order_id
        ) payment_totals ON payment_totals.order_id = o.id
        WHERE o.order_status IN ('open', 'submitted')
            AND (
                COALESCE(item_totals.subtotal_in_cents, 0)
                - COALESCE(payment_totals.payments_total_in_cents, 0)
        ) > 0
        ORDER BY balance_due_in_cents DESC
    `;

    return result;
};