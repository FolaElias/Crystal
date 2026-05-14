import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAppSelector((s) => s.auth);
  if (isInitializing) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
