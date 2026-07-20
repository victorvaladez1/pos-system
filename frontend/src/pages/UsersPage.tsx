import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { getUsers } from "../features/users/usersApi";
import type { User } from "../features/users/types";

const roleLabels: Record<User["user_role"], string> = {
    admin: "Admin",
    manager: "Manager",
    cashier: "Cashier",
    server: "Server",
    kitchen: "Kitchen",
    host: "Host"
};

export const UsersPage = () => {
    const { token } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                setError(null);
                setIsLoading(true);

                const response = await getUsers(token);
                setUsers(response.users);
            } catch (error) {   
                setError(error instanceof Error ? error.message : "Failed to load users.");
            } finally {
                setIsLoading(false);
            }
        };

        loadUsers();
    }, [token]);

    if (isLoading) {
        return (
            <section>
                <h2 className="text-2xl font-bold">Users</h2>
                <p className="mt-2 text-slate-400">Loading users...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <h2 className="text-2xl font-bold">Users</h2>
                <p className="mt-2 rounded-lg border border-red-900/70 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                    {error}
                </p>
            </section>
        );
    }

    return (
        <section>
            <div className="mb-8">
                <h2 className="text-2xl font-bold">Users</h2>
                <p className="mt-2 text-slate-400">
                    View staff accounts and role assignments.
                </p>
            </div>

            {users.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-slate-400">No users found.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-950/60 text-slate-300">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Created</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/60">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white">
                                            {user.first_name}{" "}
                                            {user.middle_name ? `${user.middle_name} ` : ""}
                                            {user.last_name}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-slate-300">
                                        {roleLabels[user.user_role]}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                                            {user.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-slate-400">
                                        {new Date(user.created_at).toLocaleDateString()}
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