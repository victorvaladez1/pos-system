import sql from "../db.js";
import type { DailySalesReport, PaymentMethodReport } from "../types/report.types.js";

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