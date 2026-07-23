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
  if (response.status === 401) {
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

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Guests />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/sitting-schedule" element={<SittingSchedule />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/partners" element={<Partners />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;