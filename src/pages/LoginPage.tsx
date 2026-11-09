import { Navigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/features/auth/LoginForm';
import { useAuthStore } from '@/store/auth';

export function LoginPage() {
  const token = useAuthStore((s) => s.token);
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const [parametres] = useSearchParams();
  const redirection = parametres.get('redirect');

  if (token) {
    const cible =
      redirection?.startsWith('/') && !redirection.startsWith('//')
        ? redirection
        : utilisateur?.role === 'livreur'
          ? '/livreur'
          : '/dashboard';
    return <Navigate to={cible} replace />;
  }

  return <LoginForm />;
}
