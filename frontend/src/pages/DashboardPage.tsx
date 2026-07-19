import { useAuth } from "../features/auth/useAuth";

export const DashboardPage = () => {
    const { user, logout } = useAuth();

    return (
        <main className="min-h-screen bg-slate-950 text-white">

            <header className="border-b border-slate-800 bg-slate-900">

                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

                    <div>

                        <h1 className="text-xl font-bold">Restaurant POS</h1>

                        <p className="text-sm text-slate-400">

                            Logged in as {user?.first_name} {user?.last_name} · {user?.user_role}

                        </p>

                    </div>

                    <button

                        onClick={logout}

                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"

                    >

                        Logout

                    </button>

                </div>

            </header>

            <section className="mx-auto max-w-6xl px-6 py-8">

                <h2 className="text-2xl font-bold">Dashboard</h2>

                <p className="mt-2 text-slate-400">

                    Frontend auth is connected. Next we can build role-based POS navigation.

                </p>

            </section>

        </main>
    );
};