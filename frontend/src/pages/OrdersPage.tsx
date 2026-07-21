import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { getOrders, getOrdersSummary } from "../features/orders/ordersApi";
import type {
    Order,
    OrderItemStatus,
    OrderSummary,
    OrderType
} from "../features/orders/types";

const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(cents / 100);
};

const orderTypeLabels: Record<OrderType, string> = {
    dine_in: "Dine In",
    takeout: "Takeout",
    delivery: "Delivery"
};

const orderStatusLabels: Record<Order["order_status"], string> = {
    open: "Open",
    submitted: "Submitted",
    paid: "Paid",
    cancelled: "Cancelled"
};

const itemStatusLabels: Record<OrderItemStatus, string> = {
    pending: "Pending",
    submitted: "Submitted",
    ready: "Ready",
    served: "Served",
    voided: "Voided"
};

export const OrdersPage = () => {
    const { token } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedSummary, setSelectedSummary] = useState<OrderSummary | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            if (!token) {
                setIsLoadingOrders(false);
                return;
            }

            try {
                setError(null);
                setIsLoadingOrders(true);
                
                const response = await getOrders(token);
                setOrders(response.orders);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to load orders.");
            } finally {
                setIsLoadingOrders(false);
            }
        };

        loadOrders();
    }, [token]);

    const handleViewSummary = async (orderId: string) => {
        if (!token) {
            return;
        }

        try {
            setSelectedOrderId(orderId);
            setSummaryError(null);
            setIsLoadingSummary(true);

            const response = await getOrdersSummary(token, orderId);
            setSelectedSummary(response);
        } catch (error) {
            setSelectedSummary(null);
            setSummaryError(error instanceof Error ? error.message : "Failed to load order summary.");
        } finally {
            setIsLoadingSummary(false);
        }
    };

    if (isLoadingOrders) {
        return (
            <section>
                <h2 className="text-2xl font-bold">Orders</h2>
                <p className="mt-2 text-slate-400">Loading orders...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <h2 className="text-2xl font-bold">Orders</h2>
                <p className="mt-2 rounded-lg border border-red-950/50 px-4 py-3 text-sm text-red-200"></p>
            </section>
        );
    }


    return (
        <section>
            <div className="mb-8">
                <h2 className="text-2xl font-bold">Orders</h2>
                <p className="mt-2 text-slate-400">
                    Create, view, update, close, and cancel orders.
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-slate-400">No orders found.</p>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,480px)]">
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <article
                                key={order.id}
                                className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {order.ticket_name}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {orderTypeLabels[order.order_type]} ·{" "}
                                            {order.guest_count} guest
                                            {order.guest_count === 1 ? "" : "s"} · Order{" "}
                                            {order.id.slice(0, 8)}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Opened{" "}
                                            {new Date(order.opened_at).toLocaleString()}
                                        </p>
                                    </div>

                                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                                        {orderStatusLabels[order.order_status]}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleViewSummary(order.id)}
                                    className="mt-5 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                                >
                                    View Summary
                                </button>
                            </article>
                        ))}
                    </div>

                    <aside className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                        <h3 className="text-lg font-semibold">Order Summary</h3>

                        {!selectedOrderId ? (
                            <p className="mt-2 text-sm text-slate-400"> 
                                Select an order to view its items, modifiers, and totals.
                            </p>
                        ) : null} 

                        {isLoadingSummary ? (
                            <p className="mt-4 text-sm text-slate-400">
                                Loading order summary...
                            </p>
                        ) : null}

                        {summaryError ? (
                            <p className="mt-4 rounded-lg border border-red-900/70 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                                {summaryError}
                            </p>
                        ) : null}

                        {selectedSummary && !isLoadingSummary ? (
                            <div className="mt-5">
                                <div className="border-b border-slate-800 pb-4">
                                    <h4 className="font-semibold">
                                        {selectedSummary.order.ticket_name}
                                    </h4>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {orderTypeLabels[selectedSummary.order.order_type]} ·{" "}
                                        {orderStatusLabels[selectedSummary.order.order_status]}
                                    </p>
                                </div>

                                <div className="mt-4 space-y-4">
                                    {selectedSummary.items.map((item) => (
                                        <div
                                            key={item.order_item_id}
                                            className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-slate-100">
                                                        {item.quantity}× {item.item_name}
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        {formatCurrency(
                                                            item.line_total_in_cents
                                                        )}
                                                    </p>
                                                </div>

                                                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                                                    {
                                                        itemStatusLabels[item.order_item_status]
                                                    }
                                                </span>
                                            </div>

                                            {item.notes ? (
                                                <p className="mt-3 text-sm text-slate-400">
                                                    Notes: {item.notes}
                                                </p>
                                            ) : null}

                                            {item.modifiers.length > 0 ? (
                                                <ul className="mt-3 space-y-2">
                                                    {item.modifiers.map((modifier) => (
                                                        <li
                                                            key={
                                                                modifier.order_item_modifier_id
                                                            }
                                                            className="flex justify-between gap-3 text-sm text-slate-400"
                                                        >
                                                            <span>
                                                                {modifier.quantity}×{" "}
                                                                {modifier.modifier_name}
                                                            </span>
                                                            <span>
                                                                {formatCurrency(
                                                                    modifier.line_total_in_cents
                                                                )}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : null}
                                        </div>   
                                    ))}
                                </div>

                                <div className="mt-5 space-y-2 rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Items</span>
                                        <span>
                                            {formatCurrency(
                                                selectedSummary.totals
                                                    .items_total_in_cents
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-slate-400">
                                        <span>Modifiers</span>
                                        <span>
                                            {formatCurrency(
                                                selectedSummary.totals
                                                    .modifiers_total_in_cents
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-t border-slate-800 pt-2 text-slate-200">
                                        <span>Subtotal</span>
                                        <span>
                                            {formatCurrency(
                                                selectedSummary.totals
                                                    .subtotal_in_cents
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-slate-400">
                                        <span>Payments</span>
                                        <span>
                                            {formatCurrency(
                                                selectedSummary.totals
                                                    .payments_total_in_cents
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-base font-semibold text-white">
                                        <span>Balance Due</span>
                                        <span>
                                            {formatCurrency(
                                                selectedSummary.totals
                                                    .balance_due_in_cents
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </aside>
                </div>
            )}

        </section>
    );  
};