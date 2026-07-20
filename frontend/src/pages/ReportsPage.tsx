import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import {
    getDailySalesReport,
    getOpenBalancesReport,
    getPaymentMethodsReport,
    getTopItemsReport
} from "../features/reports/reportsApi";

import type {
    DailySalesReport,
    OpenBalanceReportItem,
    PaymentMethodReportItem,
    TopItemReportItem
} from "../features/reports/types";

const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(cents / 100);
};

const paymentMethodLabels: Record<PaymentMethodReportItem["payment_method"], string> = {
    cash: "Cash",
    card: "Card",
    gift_card: "Gift Card",
    mobile_pay: "Mobile Pay",
    other: "Other"
};

const orderTypeLabels: Record<OpenBalanceReportItem["order_type"], string> = {
    dine_in: "Dine In",
    takeout: "Takeout",
    delivery: "Delivery"
};

export const ReportsPage = () => {
    const { token } = useAuth();

    const [dailySales, setDailySales] = useState<DailySalesReport | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodReportItem[]>([]);
    const [topItems, setTopItems] = useState<TopItemReportItem[]>([]);
    const [openBalances, setOpenBalances] = useState<OpenBalanceReportItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadReports = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                setError(null);
                setIsLoading(true);

                const [
                    dailySalesResponse,
                    paymentMethodsResponse,
                    topItemsResponse,
                    openBalancesResponse
                ] = await Promise.all([
                    getDailySalesReport(token),
                    getPaymentMethodsReport(token),
                    getTopItemsReport(token),
                    getOpenBalancesReport(token)
                ]);

                setDailySales(dailySalesResponse.report);
                setPaymentMethods(paymentMethodsResponse.report);
                setTopItems(topItemsResponse.report);
                setOpenBalances(openBalancesResponse.report);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to load reports.");
            } finally {
                setIsLoading(false);
            }
        };  

        loadReports();
    }, [token]);

    if (isLoading) {
        return (
            <section>
                <h2 className="text-2xl font-bold">Reports</h2>
                <p className="mt-2 text-slate-400">Loading reports...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <h2 className="text-2xl font-bold">Reports</h2>
                <p className="mt-2 rounded-lg border border-red-900/70 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                    {error}
                </p>
            </section>
        );
    }

    return (
        <section>
            <div className="mb-8">
                <h2 className="text-2xl font-bold">Reports</h2>
                <p className="mt-2 text-slate-400">
                    View sales, payment method, top item, and open balance reports.
                </p>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Daily Sales</p>
                    <p className="mt-2 text-2xl font-bold">
                        {formatCurrency(dailySales?.gross_sales_in_cents ?? 0)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {dailySales?.date ?? "Today"}
                    </p>
                </article>

                <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Payments</p>
                    <p className="mt-2 text-2xl font-bold">
                        {dailySales?.payment_count ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Completed payments today
                    </p>
                </article>

                <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Open Balance Due</p>
                    <p className="mt-2 text-2xl font-bold">
                        {formatCurrency(
                            openBalances.reduce(
                                (total, order) => total + order.balance_due_in_cents,
                                0
                            )
                        )}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Across {openBalances.length} open orders
                    </p>
                </article>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <article className="rounded-xl border border-slate-800 bg-slate-900">
                    <div className="border-b border-slate-800 px-5 py-4">
                        <h3 className="font-semibold">Payment Methods</h3>
                    </div>

                    {paymentMethods.length === 0 ? (
                        <p className="p-5 text-sm text-slate-400">
                            No payment method data found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-950/60 text-slate-300">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Method</th>
                                        <th className="px-5 py-3 font-medium">Sales</th>
                                        <th className="px-5 py-3 font-medium">Payments</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {paymentMethods.map((paymentMethod) => (
                                        <tr key={paymentMethod.payment_method}>
                                            <td className="px-5 py-3 text-slate-200">
                                                {paymentMethodLabels[paymentMethod.payment_method]}
                                            </td>
                                            <td className="px-5 py-3 text-slate-300">
                                                {formatCurrency(
                                                    paymentMethod.gross_sales_in_cents
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-slate-400">
                                                {paymentMethod.payment_count}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </article>

                <article className="rounded-xl border border-slate-800 bg-slate-900">
                    <div className="border-b border-slate-800 px-5 py-4">
                        <h3 className="font-semibold">Top Items</h3>
                    </div>

                    {topItems.length === 0 ? (
                        <p className="p-5 text-sm text-slate-400">
                            No top item data found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-950/60 text-slate-300">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Item</th>
                                        <th className="px-5 py-3 font-medium">Qty</th>
                                        <th className="px-5 py-3 font-medium">Sales</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {topItems.map((item) => (
                                        <tr key={item.item_id}>
                                            <td className="px-5 py-3 text-slate-200">
                                                {item.item_name}
                                            </td>
                                            <td className="px-5 py-3 text-slate-400">
                                                {item.quantity_sold}
                                            </td>
                                            <td className="px-5 py-3 text-slate-300">
                                                {formatCurrency(item.gross_sales_in_cents)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>      
                        </div>
                    )}
                </article>
            </div>

            <article className="mt-6 rounded-xl border border-slate-800 bg-slate-900">
                <div className="border-b border-slate-800 px-5 py-4">
                    <h3 className="font-semibold">Open Balances</h3>
                </div>

                {openBalances.length === 0 ? (
                    <p className="p-5 text-sm text-slate-400">
                        No open balance found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead className="bg-slate-950/60 text-slate-300">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Ticket</th>
                                    <th className="px-5 py-3 font-medium">Type</th>
                                    <th className="px-5 py-3 font-medium">Subtotal</th>
                                    <th className="px-5 py-3 font-medium">Paid</th>
                                    <th className="px-5 py-3 font-medium">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {openBalances.map((order) => (
                                    <tr key={order.order_id}>
                                        <td className="px-5 py-3 text-slate-200">
                                            <div className="font-medium">
                                                {order.ticket_name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Order {order.order_id.slice(0, 8)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-slate-400">
                                            {orderTypeLabels[order.order_type]}
                                        </td>
                                        <td className="px-5 py-3 text-slate-300">
                                            {formatCurrency(order.subtotal_in_cents)}
                                        </td>
                                        <td className="px-5 py-3 text-slate-300">
                                            {formatCurrency(order.payment_total_in_cents)}
                                        </td>
                                        <td className="px-5 py-3 font-medium text-slate-100">
                                            {formatCurrency(order.balance_due_in_cents)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </article>
        </section>
    );
};