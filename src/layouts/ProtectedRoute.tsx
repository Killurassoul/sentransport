import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '@/api/types';
import { useAuthStore } from '@/store/auth';
import { Spinner } from '@/components/ui/EmptyState';

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const token = useAuthStore((s) => s.token);
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const location = useLocation();

  if (!token || !utilisateur) {
    const redirection = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirection)}`}
        replace
        state={{ depuis: redirection }}
      />
    );
  }

  if (roles && roles.length > 0 && !roles.includes(utilisateur.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

export function ChargementSession() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Spinner className="h-7 w-7" />
    </div>
  );
}
