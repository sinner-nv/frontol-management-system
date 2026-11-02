import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Agents } from './pages/Agents';
import { AgentDetail } from './pages/AgentDetail';
import { Settings } from './pages/Settings';
import { Kkt } from './pages/Kkt';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<Agents />} />
            {/* ⚠️ КОНКРЕТНЫЙ маршрут — ПЕРЕД общим */}
            <Route path="/agents/:id/settings" element={<Settings />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/agents/:id/kkt" element={<Kkt />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}