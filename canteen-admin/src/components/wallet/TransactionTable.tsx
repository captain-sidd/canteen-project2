import React from 'react';
import type { TransactionInterface } from '@/types/wallet';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { format } from 'date-fns';
import { IndianRupee, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: TransactionInterface[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-y">
          <tr>
            <th className="px-4 py-3">Transaction</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Date & Time</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map(txn => (
            <tr key={txn.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    txn.type === 'credit' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                  )}>
                    {txn.type === 'credit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{txn.description}</div>
                    <div className="text-xs text-slate-500 font-medium font-mono">{txn.referenceId}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className={cn(
                  "font-bold flex items-center text-base",
                  txn.type === 'credit' ? "text-green-600" : "text-slate-800"
                )}>
                  {txn.type === 'credit' ? '+' : '-'}
                  <IndianRupee className="w-3.5 h-3.5 ml-0.5" />
                  {txn.amount}
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-slate-700">{txn.userName}</td>
              <td className="px-4 py-3">
                <span className="uppercase text-xs font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                  {txn.method}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 font-medium">
                {format(new Date(txn.timestamp), 'dd MMM yyyy, hh:mm a')}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={txn.status === 'success' ? 'success' : txn.status === 'failed' ? 'failed' : 'warning'}>
                  {txn.status}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
