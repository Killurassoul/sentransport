import { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/Toaster';
import { AppShell } from '@/layouts/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/layouts/ProtectedRoute';
import { surExpirationSession } from '@/api/client';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ColisListPage } from '@/pages/ColisListPage';
import { ColisNewPage } from '@/pages/ColisNewPage';
import { ColisDetailPage } from '@/pages/ColisDetailPage';
import { LivraisonsPage } from '@/pages/LivraisonsPage';
import { CartePage } from '@/pages/CartePage';
import { LivreurPage } from '@/pages/LivreurPage';
import { AdminPage } from '@/pages/AdminPage';
import { ParametresPage } from '@/pages/ParametresPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { SuiviPage } from '@/pages/SuiviPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

/** Redirige proprement vers /login quand l'API renvoie un 401. */
function ExpirationSession() {
  const navigate = useNavigate();
  useEffect(() => {
    const desabonner = surExpirationSession((chemin) => {
      navigate(`/login?redirect=${encodeURIComponent(chemin)}`, { replace: true });
    });
    return () => {
      desabonner();
    };
  }, [navigate]);
  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <ScrollToTop />
          <ExpirationSession />
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route path="/suivi" element={<SuiviPage />} />
            <Route path="/suivi/:numero" element={<SuiviPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/colis" element={<ColisListPage />} />
                <Route path="/colis/nouveau" element={<ColisNewPage />} />
                <Route path="/colis/:numero" element={<ColisDetailPage />} />
                <Route path="/livraisons" element={<LivraisonsPage />} />
                <Route path="/carte" element={<CartePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/parametres" element={<ParametresPage />} />
                <Route path="/403" element={<ForbiddenPage />} />
                <Route element={<ProtectedRoute roles={['livreur']} />}>
                  <Route path="/livreur" element={<LivreurPage />} />
                </Route>
                <Route element={<ProtectedRoute roles={['administrateur']} />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
