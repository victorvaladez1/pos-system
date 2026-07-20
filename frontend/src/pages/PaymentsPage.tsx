import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { getPayments } from "../features/payments/paymentsApi";
import type { Payment } from "../features/payments/types";

const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(cents / 100);
};

const paymentMethodLabels: Record<Payment["payment_method"], string> = {
    cash: "Cash",
    card: "Card",
    gift_card: "Gift Card",
    mobile_pay: "Mobile Pay",
    other: "Other"
};

const paymentStatusLabels: Record<Payment["payment_status"], string> = {
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    refunded: "Refunded",
    voided: "Voided"
};

export const PaymentsPage = () => {
    const { token } = useAuth();

    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPayments = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                setError(null);
                setIsLoading(true);

                const response = await getPayments(token);
                setPayments(response.payments);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to load payments.");
            } finally { 
                setIsLoading(false);
            }
        };
        
        loadPayments();
    }, [token]);

    const completedTotal = payments
        .filter((payment) => payment.payment_status === "completed")
        .reduce((total, payment) => total + payment.amount_in_cents, 0);

    const pendingTotal = payments
        .filter((payment) => payment.payment_status === "pending")
        .reduce((total, payment) => total + payment.amount_in_cents, 0);

    if (isLoading) {
        return (
            <section>
                <h2 className="text-2xl font-bold">Payments</h2>
                <p className="mt-2 text-slate-400">Loading payments....</p>
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <h2 className="text-2xl font-bold">Payments</h2>
                <p className="mt-2 rounded-lg border border-red-900/70 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                    {error}
                </p>
            </section>
        );
    }

    return (
        <section>
            <div className="mb-8">   
                <h2 className="text-2xl font-bold">Payments</h2>
                <p className="mt-2 text-slate-400">
                    View payments recorded against customer orders.
                </p>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Total Payments</p>
                    <p className="mt-2 text-2xl font-bold">
                        {payments.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        All payment records
                    </p>
                </article>

                <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Completed Total</p>
                    <p className="mt-2 text-2xl font-bold">
                        {formatCurrency(completedTotal)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Completed payments only
                    </p>
                </article>

                <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Pending Total</p>
                    <p className="mt-2 text-2xl font-bold">
                        {formatCurrency(pendingTotal)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Pending payments only
                    </p>
                </article>
            </div>

            {payments.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-slate-400">No payments found.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-950/60 text-slate-300">
                            <tr>
                                <th className="px-5 py-3 font-medium">Payment</th>
                                <th className="px-5 py-3 font-medium">Order</th>
                                <th className="px-5 py-3 font-medium">Method</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Amount</th>
                                <th className="px-5 py-3 font-medium">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {payments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="hover:bg-slate-800/60"
                                >
                                    <td className="px-5 py-3 text-slate-200">
                                        <div>
                                            {payment.id.slice(0, 8)}
                                        </div>
                                    </td>

                                    <td className="px-5 py-3 text-slate-400">
                                        {payment.order_id.slice(0, 8)}
                                    </td>

                                    <td className="px-5 py-3 text-slate-300">
                                        {paymentMethodLabels[payment.payment_method]}
                                    </td>

                                    <td className="px-5 py-3">
                                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                                            {paymentStatusLabels[payment.payment_status]}
                                        </span>
                                    </td>

                                    <td className="px-5 py-3 font-medium text-slate-100">
                                        {formatCurrency(payment.amount_in_cents)}
                                    </td>

                                    <td className="px-5 py-3 text-slate-400">
                                        {new Date(payment.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};