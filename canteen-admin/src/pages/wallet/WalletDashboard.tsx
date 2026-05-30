import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Download, Wallet, CreditCard, XCircle, ArrowUpRight } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import type { TransactionInterface } from '@/types/wallet';
import { TransactionTable } from '@/components/wallet/TransactionTable';
import { walletApi, parseApiError } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function WalletDashboard() {
  const { user } = useAuth();

  type WalletDetails = {
    balance: number;
    walletId?: string;
    isWalletActive: boolean;
  };

  type WalletHistoryResponse = {
    items: TransactionInterface[];
    page?: number;
    limit?: number;
    total?: number;
    has_more?: boolean;
  };

  const { data: walletDetails, isLoading: isWalletLoading, isError: walletError } = useQuery<WalletDetails>({
    queryKey: ['wallet-details'],
    queryFn: walletApi.getDetails,
    retry: 1,
  });

  const { data: walletHistory, isLoading: isHistoryLoading, isError: historyError } = useQuery<WalletHistoryResponse>({
    queryKey: ['wallet-history'],
    queryFn: walletApi.getHistory,
    retry: 1,
  });

  useEffect(() => {
    if (walletError) {
      toast.error('Unable to load wallet details', { description: parseApiError(new Error('Could not fetch wallet details')) });
    }
  }, [walletError]);

  useEffect(() => {
    if (historyError) {
      toast.error('Unable to load wallet history', { description: parseApiError(new Error('Could not fetch wallet history')) });
    }
  }, [historyError]);

  const transactions: TransactionInterface[] = walletHistory?.items ?? [];
  const totalFailed = transactions.filter((txn) => txn.status === 'failed').length;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Wallet Balance"
          value={isWalletLoading ? 'Loading…' : `₹${walletDetails?.balance?.toFixed(2) ?? '0.00'}`}
          icon={<Wallet />}
          trend={{ value: 0, label: walletDetails?.isWalletActive ? 'Wallet active' : 'Wallet inactive', isPositive: !!walletDetails?.isWalletActive }}
        />
        <MetricCard
          title="Recent Transactions"
          value={isHistoryLoading ? 'Loading…' : `${transactions.length}`}
          icon={<ArrowUpRight />}
          trend={{ value: 0, label: 'last 10 entries', isPositive: true }}
        />
        <MetricCard
          title="Wallet Status"
          value={walletDetails?.isWalletActive ? 'Active' : 'Inactive'}
          icon={<CreditCard />}
        />
        <MetricCard
          title="Failed Transactions"
          value={isHistoryLoading ? 'Loading…' : `${totalFailed}`}
          icon={<XCircle />}
          className="border-red-200 bg-red-50/30"
          trend={{ value: totalFailed, label: 'need review', isPositive: totalFailed === 0 }}
        />
      </div>

      <div className="bg-white rounded-xl border p-5 shadow-sm mb-4">
        <h3 className="font-bold text-slate-800 mb-4 tracking-tight text-lg">Recent Transactions</h3>
        <TransactionTable transactions={transactions} />
      </div>
    </PageContainer>
  );
}
