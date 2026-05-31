import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Download, Wallet, CreditCard, XCircle, ArrowUpRight } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import type { TransactionInterface } from '@/types/wallet';
import { TransactionTable } from '@/components/wallet/TransactionTable';
import { ordersApi, parseApiError } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function WalletDashboard() {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem('admin_token');
  const hasAuth = isAuthenticated && !!token;

  // React Query calls with absolute security: only query if authenticated to prevent 401
  const { data: realOrders, isLoading, isError, error } = useQuery({
    queryKey: ['live-orders'],
    queryFn: ordersApi.getAll,
    enabled: hasAuth,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      toast.error('Unable to load payments data', { description: parseApiError(error) });
    }
  }, [isError, error]);

  const usingMocks = !hasAuth || isError || !realOrders;

  // Skeletons during initial loading to prevent layout shifting
  const isScreenLoading = hasAuth && isLoading;

  // Dynamic calculations following user criteria:
  // Revenue: strictly paid or completed
  const getTotalRevenue = () => {
    if (usingMocks) return 460.0;
    return realOrders
      .filter(order => {
        const status = (order.status || '').toLowerCase();
        const payStatus = (order.paymentStatus || '').toLowerCase();
        const isCompletedOrPaid = status === 'completed' || payStatus === 'paid';
        const isExcluded = ['pending', 'preparing', 'cancelled'].includes(status);
        return isCompletedOrPaid && !isExcluded;
      })
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  };

  const getTotalTransactions = () => {
    if (usingMocks) return 3;
    return realOrders.length;
  };

  const getWalletPaymentsCount = () => {
    if (usingMocks) return 1;
    return realOrders.filter(o => o.paymentMethod === 'wallet').length;
  };

  const getUPIPaymentsCount = () => {
    if (usingMocks) return 1;
    return realOrders.filter(o => o.paymentMethod === 'upi').length;
  };

  const getTransactionsList = (): TransactionInterface[] => {
    if (usingMocks) {
      return [
        { id: 'TXN-001', userId: 'u1', userName: 'Siddhesh M.', amount: 160, type: 'credit' as const, method: 'upi', status: 'success', description: 'Order #ORD-101 Payment', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), referenceId: 'TXN101UPI' },
        { id: 'TXN-002', userId: 'u2', userName: 'Rahul K.', amount: 120, type: 'credit' as const, method: 'wallet', status: 'success', description: 'Order #ORD-102 Payment', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), referenceId: 'TXN102WLT' },
        { id: 'TXN-003', userId: 'u3', userName: 'Neha J.', amount: 180, type: 'credit' as const, method: 'cash', status: 'pending', description: 'Order #ORD-103 Payment', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), referenceId: 'TXN103CSH' }
      ];
    }

    return [...realOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(order => {
        const orderStatus = (order.status || '').toLowerCase();
        const payStatus = (order.paymentStatus || '').toLowerCase();
        const isSuccess = orderStatus === 'completed' || payStatus === 'paid';
        const isFailed = orderStatus === 'cancelled';
        
        return {
          id: order.id,
          userId: order.id,
          userName: order.customerName || 'Customer',
          amount: order.totalAmount,
          type: 'credit' as const, // inflow/credit for canteen
          method: order.paymentMethod || 'wallet',
          status: isSuccess ? 'success' : isFailed ? 'failed' : 'pending',
          description: `Order #${order.orderNumber || order.id.slice(-4).toUpperCase()} Payment`,
          timestamp: order.createdAt,
          referenceId: order.id.slice(-8).toUpperCase(),
        };
      });
  };

  const transactions = getTransactionsList();

  return (
    <PageContainer>
      <SectionHeader 
        title="Wallet & Payments" 
        description="Monitor digital wallet balances, topups, and refund processing."
        action={
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        }
      />

      {usingMocks && hasAuth && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mb-6 text-xs text-amber-800 rounded-r-lg">
          <strong>Offline Mode:</strong> Displaying fallback mock payment values.
        </div>
      )}

      {isScreenLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white border rounded-xl p-6 shadow-sm space-y-3 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Revenue (Paid)"
            value={`₹${getTotalRevenue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<Wallet />}
          />
          <MetricCard
            title="Total Transactions"
            value={getTotalTransactions().toString()}
            icon={<ArrowUpRight />}
          />
          <MetricCard
            title="Wallet Payments"
            value={getWalletPaymentsCount().toString()}
            icon={<CreditCard />}
          />
          <MetricCard
            title="UPI Payments"
            value={getUPIPaymentsCount().toString()}
            icon={<XCircle className="text-blue-500" />}
          />
        </div>
      )}

      <div className="bg-white rounded-xl border p-5 shadow-sm mb-4">
        <h3 className="font-bold text-slate-800 mb-4 tracking-tight text-lg">System Payments Registry</h3>
        {isScreenLoading ? (
          <div className="bg-white border rounded-xl p-8 flex flex-col gap-4 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-full" />
            <div className="h-10 bg-slate-200 rounded w-full" />
            <div className="h-10 bg-slate-200 rounded w-full" />
          </div>
        ) : (
          <TransactionTable transactions={transactions} />
        )}
      </div>
    </PageContainer>
  );
}
