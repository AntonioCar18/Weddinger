import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 1. Importaj ovo
import LoginPage from "./pages/login";
import Dashboard from "./pages/dashboard";
import Guests from "./pages/guests";
import ProtectedRoute from "./components/protected_route";
import SittingSchedule from "./pages/sitting_schedule";
import Budget from "./pages/budget";
import Tasks from "./pages/tasks";
import Partners from "./pages/partners";
import Settings from "./pages/settings";
import Documents from "./pages/documents";
import Onboarding from "./pages/onboarding";
import Privacy from "./pages/privacy";
import Terms from "./pages/terms";

// 2. Kreiraj instancu klijenta izvan komponente da se ne re-kreira kod svakog rendera
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Opcionalno: sprječava ponovni fetch kad klikneš natrag na tab preglednika
    },
  },
});

const HomeRedirect = () => <Navigate to="/login" replace />;

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
  const isAuthRoute = url.includes("/api/login") || url.includes("/api/register");

  if (response.status === 401 && !isAuthRoute) {
    queryClient.clear();
    window.location.href = "/login";
  }
  return response;
};

function App() {
  return (
    // 3. Omotaj sve u QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/sitting-schedule" element={<SittingSchedule />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/onboarding" element={<Onboarding />} />

          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;