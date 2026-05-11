import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { WalletPage } from './pages/wallet/WalletPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/wallet', element: <WalletPage /> },
          { path: '/trade', element: <div className="p-4 text-muted-foreground">Trade — Phase 4</div> },
          { path: '/transfer', element: <div className="p-4 text-muted-foreground">Transfer — Phase 6</div> },
          { path: '/history', element: <div className="p-4 text-muted-foreground">History — Phase 5</div> },
          { path: '/settings', element: <div className="p-4 text-muted-foreground">Settings — Phase 7</div> },
        ],
      },
    ],
  },
]);
