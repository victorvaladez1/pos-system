import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { getTables } from "../features/tables/tablesApi";
import type { RestaurantTable } from "../features/tables/types";

const statusLabels: Record<RestaurantTable["current_status"], string> = {
    available: "Available",
    occupied: "Occupied",
    reserved: "Reserved",
    dirty: "Dirty",
    out_of_service: "Out of Service"
};

export const TablesPage = () => {
    const { token } = useAuth();

    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTables = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                setError(null);
                setIsLoading(true);

                const response = await getTables(token);
                setTables(response.tables);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to load tables.");
            } finally {
                setIsLoading(false);
            }
        };

        loadTables();
    }, [token]);

    if (error) {
        return (
            <section>
                <h2 className="text-2xl font-bold">Tables</h2>
                <p className="mt-2 rounded-lg border border-red-900/70 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                    {error}
                </p>
            </section>
        );
    }

    return (
        <section>
            <div className="mb-8">
                <h2 className="text-2xl font-bold">Tables</h2>
                <p className="text-slate-400">
                    View restaurant tables and their current status.
                </p>
            </div>

            {tables.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-slate-400">No tables found.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tables.map((table) => (
                        <article
                            key={table.id}
                            className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Table {table.table_number}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Capacity: {table.capacity}
                                    </p>
                                </div>
                                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                                    {statusLabels[table.current_status]}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};