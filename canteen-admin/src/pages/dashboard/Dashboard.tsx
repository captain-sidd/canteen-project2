import React from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable } from '@/components/ui/DataTable';
import { IndianRupee, ShoppingCart, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, usersApi, menuApi, combosApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

// Mock recent orders fallback if backend offline or unauthenticated
const mockRecentOrders = [
  { id: '#ORD-001', customer: 'Siddhesh', items: 3, total: '₹450', status: 'pending', time: '2 mins ago' },
  { id: '#ORD-002', customer: 'Rahul', items: 1, total: '₹120', status: 'success', time: '15 mins ago' },
  { id: '#ORD-003', customer: 'Neha', items: 2, total: '₹280', status: 'warning', time: '1 hour ago' },
  { id: '#ORD-004', customer: 'Pooja', items: 5, total: '₹890', status: 'success', time: '2 hours ago' },
];

const columns = [
  { header: 'Order ID', accessorKey: 'id', cell: (row: any) => <span className="font-medium">{row.id}</span> },
  { header: 'Customer', accessorKey: 'customer' },
  { header: 'Items', accessorKey: 'items' },
  { header: 'Total', accessorKey: 'total', cell: (row: any) => <span className="font-semibold">{row.total}</span> },
  { header: 'Time', accessorKey: 'time', cell: (row: any) => <span className="text-muted-foreground">{row.time}</span> },
  { 
    header: 'Status', 
    accessorKey: 'status',
    cell: (row: any) => {
      const s = row.status || 'pending';
      const statusMap: Record<string, string> = {
        success: 'success',
        pending: 'pending',
        warning: 'warning',
        failed: 'failed',
        preparing: 'preparing',
        ready: 'ready',
        completed: 'completed',
        cancelled: 'cancelled',
      };
      const badgeStatus = statusMap[s] || 'pending';
      return (
        <StatusBadge status={badgeStatus as any}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </StatusBadge>
      );
    }
  },
];

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem('admin_token');
  const hasAuth = isAuthenticated && !!token;

  // React Query calls with absolute security: only query if authenticated to prevent 401
  const { data: realOrders, isLoading: isOrdersLoading, isError: isOrdersError, refetch: refetchOrders } = useQuery({
    queryKey: ['live-orders'],
    queryFn: ordersApi.getAll,
    enabled: hasAuth,
    retry: 1,
  });

  const { data: realUsers, isLoading: isUsersLoading, isError: isUsersError, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    enabled: hasAuth,
    retry: 1,
  });

  const handleSyncAll = () => {
    if (hasAuth) {
      refetchOrders();
      refetchUsers();
    }
  };

  const isToday = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Helper for computing display orders
  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Unknown';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const usingMocks = !hasAuth || isOrdersError || isUsersError || !realOrders || !realUsers;

  // Skeletons during initial loading to prevent layout shifting
  const isScreenLoading = hasAuth && (isOrdersLoading || isUsersLoading);

  // Revenue calculation following the strict completed / paid rule:
  const getTodayRevenue = () => {
    if (usingMocks) return '₹12,450';
    const revenue = realOrders
      .filter(order => {
        const status = (order.status || '').toLowerCase();
        const payStatus = (order.paymentStatus || '').toLowerCase();
        // strict completed/paid check
        const isCompletedOrPaid = status === 'completed' || payStatus === 'paid';
        const isExcluded = ['pending', 'preparing', 'cancelled'].includes(status);
        return isToday(order.createdAt) && isCompletedOrPaid && !isExcluded;
      })
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    return `₹${revenue.toLocaleString()}`;
  };

  const getTotalOrders = () => {
    if (usingMocks) return '142';
    return realOrders.length.toString();
  };

  const getPendingPrepCount = () => {
    if (usingMocks) return '32 pending preparation';
    const pendingCount = realOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    return `${pendingCount} pending preparation`;
  };

  const getActiveUsers = () => {
    if (usingMocks) return '1,240';
    return realUsers.length.toString();
  };

  const getConversionRate = () => {
    if (usingMocks) return '68.2%';
    if (realOrders.length === 0) return '0.0%';
    const completedCount = realOrders.filter(o => o.status === 'completed').length;
    return `${((completedCount / realOrders.length) * 100).toFixed(1)}%`;
  };

  // Build real orders list for the data table
  const getRecentOrdersList = () => {
    if (usingMocks) return mockRecentOrders;
    
    // Sort real orders newest first and map them
    return [...realOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(o => ({
        id: o.orderNumber ? `#ORD-${o.orderNumber}` : `#${o.id.slice(-6).toUpperCase()}`,
        customer: o.customerName || 'Customer',
        items: o.items.reduce((acc, it) => acc + (it.quantity || 1), 0),
        total: `₹${o.totalAmount}`,
        status: o.status || 'pending',
        time: formatTimeAgo(o.createdAt),
      }));
  };

  return (
    <PageContainer>
      <SectionHeader 
        title="Dashboard Overview" 
        description="Monitor your canteen's live performance and metrics."
        action={
          hasAuth && (
            <Button variant="outline" size="sm" onClick={handleSyncAll} className="bg-white">
              <RefreshCw className={`w-4 h-4 mr-2 ${(isOrdersLoading || isUsersLoading) ? 'animate-spin' : ''}`} />
              Sync Live Data
            </Button>
          )
        }
      />
      
      {usingMocks && hasAuth && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mb-4 text-xs text-amber-800 rounded-r-lg">
          <strong>Offline Mode:</strong> Failed to fetch live sync data from backend. Displaying robust mock fallbacks.
        </div>
      )}

      {isScreenLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white border rounded-xl p-6 shadow-sm space-y-3 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard 
            title="Today's Revenue" 
            value={getTodayRevenue()} 
            description={usingMocks ? "+15% from yesterday" : "Strictly paid/completed"}
            icon={<IndianRupee className="h-4 w-4" />}
          />
          <DashboardCard 
            title="Total Orders" 
            value={getTotalOrders()} 
            description={getPendingPrepCount()}
            icon={<ShoppingCart className="h-4 w-4" />}
          />
          <DashboardCard 
            title="Active Users" 
            value={getActiveUsers()} 
            description={usingMocks ? "+12 new today" : "Total registered profiles"}
            icon={<Users className="h-4 w-4" />}
          />
          <DashboardCard 
            title="Success Rate" 
            value={getConversionRate()} 
            description={usingMocks ? "View analytics details" : "Completed vs Total ratio"}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-7 mt-4">
        <div className="col-span-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight text-slate-800">Recent Orders</h3>
            {!usingMocks && (
              <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                Live Data Connected
              </span>
            )}
          </div>
          {isScreenLoading ? (
            <div className="bg-white border rounded-xl p-8 flex flex-col gap-4 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-full" />
              <div className="h-10 bg-slate-200 rounded w-full" />
              <div className="h-10 bg-slate-200 rounded w-full" />
              <div className="h-10 bg-slate-200 rounded w-full" />
            </div>
          ) : (
            <DataTable columns={columns} data={getRecentOrdersList()} searchPlaceholder="Search orders..." />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
