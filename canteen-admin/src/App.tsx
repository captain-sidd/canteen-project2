import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import Dashboard from '@/pages/dashboard/Dashboard';
import Login from '@/pages/Login';
import LiveOrders from '@/pages/orders/LiveOrders';
import QRVerification from '@/pages/qr/QRVerification';
import MenuManagement from '@/pages/menu/MenuManagement';
import ComboManagement from '@/pages/combos/ComboManagement';
import InventoryManagement from '@/pages/inventory/InventoryManagement';
import WalletDashboard from '@/pages/wallet/WalletDashboard';
import Users from '@/pages/Users';
import ReportsAnalytics from '@/pages/reports/ReportsAnalytics';
import Profile from '@/pages/profile/Profile';
import Settings from '@/pages/settings/Settings';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<LiveOrders />} />
              <Route path="qr" element={<QRVerification />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="combos" element={<ComboManagement />} />
              <Route path="inventory" element={<Navigate to="/" replace />} />
              <Route path="offers" element={<div className="p-8">Offers Placeholder</div>} />
              <Route path="users" element={<Users />} />
              <Route path="wallet" element={<WalletDashboard />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
