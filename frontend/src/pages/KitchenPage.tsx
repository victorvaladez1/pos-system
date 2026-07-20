import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { getKitchenOrders } from "../features/kitchen/kitchenApi";
import type { KitchenOrder, KitchenOrderItem } from "../features/kitchen/types";

const statusLabels: Record<KitchenOrderItem["order_item_status"], string> = {
    submitted: "Submitted",
    ready: "Ready"
};

const orderTypeLabels: Record<KitchenOrder["order_type"], string> = {
    dine_in: "Dine In",
    takeout: "Takeout",
    delivery: "Delivery"
};

export const KitchenPage = () => {
    const { token } = useAuth();

    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadKitchenQueue = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                setError(null);
                setIsLoading(true);

                const response = await getKitchenOrders(token);
                setOrders(response.orders);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to load kitchen orders.");
            } finally {
                setIsLoading(false);
            }
        };

        loadKitchenQueue();
    }, [token]);

    if (isLoading) {
        return (
            <section>
                <h2 className="text-2xl font-bold">Kitchen</h2>
                <p className="mt-2 text-slate-400">Loading kitchen orders...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <h2 className="text-2xl font-bold">Kitchen</h2>
                <p className="mt-2 rounded-lg border border-red-900/70 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                    {error}
                </p>
            </section>
        );
    }

    return (
        <section>
            <div className="mb-8">
                <h2 className="text-2xl font-bold">Kitchen</h2>
                <p className="mt-2 text-slate-400">
                    View submitted and ready items grouped by order.
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-slate-400">No kitchen orders found.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {orders.map((order) => (
                        <article
                            key={order.order_id}
                            className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm"
                        >
                            <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {order.ticket_name}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {orderTypeLabels[order.order_type]} · Order{" "}
                                            {order.order_id.slice(0,8)}
                                        </p>
                                    </div>

                                    <p className="text-sm text-slate-500">
                                        Opened {new Date(order.opened_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-800">
                                {order.items.map((item) => (
                                    <div
                                        key={item.order_item_id}
                                        className="px-5 py-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="font-medium text-white">
                                                    {item.quantity}x {item.item_name}
                                                </h4>

                                                {item.notes ? (
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Notes: {item.notes}
                                                    </p>
                                                ) : null}

                                                {item.modifiers.length > 0 ? (
                                                    <ul className="mt-3 flex flex-wrap gap-2">
                                                        {item.modifiers.map((modifier) => (
                                                            <li
                                                                key={modifier.order_item_modifier_id}
                                                                className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                                                            >
                                                                {modifier.quantity}x{" "}
                                                                {modifier.modifier_name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : null}
                                            </div>

                                            <span className="rounded-full border border-slate-700 px-3 py-1 text-sm font-medium text-slate-300">
                                                {statusLabels[item.order_item_status]}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};