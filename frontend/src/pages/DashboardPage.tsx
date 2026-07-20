import { Link } from "react-router-dom";
import { getDashboardLinksForRole } from "../features/dashboard/dashboardLinks";
import { useAuth } from "../features/auth/useAuth";

export const DashboardPage = () => {
    const { user } = useAuth();

    const links = user ? getDashboardLinksForRole(user.user_role) : [];

    return (
        <section>
            <div className="mb-8">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="mt-2 text-slate-400">
                    Choose a workflow to get started.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        to={link.href}
                        className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left shadow-sm transition hover:border-blue-500 hover:bg-slate-800"
                    >
                        <h3 className="text-lg font-semibold">
                            {link.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-400">
                            {link.description}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
};