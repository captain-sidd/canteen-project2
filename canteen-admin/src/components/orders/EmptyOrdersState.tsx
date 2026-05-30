import React from 'react';
import { ShoppingBag } from 'lucide-react';
import type { OrderStatus } from '@/types/order';

interface EmptyOrdersStateProps {
  status: OrderStatus;
}

export function EmptyOrdersState({ status }: EmptyOrdersStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <ShoppingBag className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">No {status} orders</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1">
        There are currently no orders in the <span className="uppercase font-semibold">{status}</span> queue.
        New orders will appear here automatically.
      </p>
    </div>
  );
}
