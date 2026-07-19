import { LoginPage } from "./features/auth/LoginPage";
import { useAuth } from "./features/auth/useAuth";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <main>
      <div>
        <h1>Restaurant POS</h1>
        <p>Loading session...</p>
      </div>
    </main>
  }

  if (!user) {
    return <LoginPage />
  }

  return <DashboardPage />
}

export default App
