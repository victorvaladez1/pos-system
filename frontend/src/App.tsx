import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import { LoginPage } from "./features/auth/LoginPage";
import { useAuth } from "./features/auth/useAuth";
import { AppLayout } from "./components/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { TablesPage } from "./pages/TablesPage";
import { OrdersPage } from "./pages/OrdersPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { KitchenPage } from "./pages/KitchenPage";
import { ReportsPage } from "./pages/ReportsPage";
import { UsersPage } from "./pages/UsersPage";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Restaurant POS</h1>
          <p className="mt-2 text-slate-400">Loading session...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tables" element={<TablesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App
