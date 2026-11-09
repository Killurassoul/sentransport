import { Navigate } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { useAuthStore } from '@/store/auth';

export function RegisterPage() {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return <RegisterForm />;
}
