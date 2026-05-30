import React from 'react';
import type { OrderStatus } from '@/types/order';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface OrderStatusTabsProps {
  activeStatus: OrderStatus;
  onChange: (status: OrderStatus) => void;
  stats: Record<OrderStatus, number>;
}

const TABS: { id: OrderStatus; label: string }[] = [
  { id: 'pending', label: 'NEW' },
  { id: 'preparing', label: 'PREPARING' },
  { id: 'ready', label: 'READY' },
  { id: 'completed', label: 'COMPLETED' },
  { id: 'cancelled', label: 'CANCELLED' },
];

export const OrderStatusTabs = React.memo(({ activeStatus, onChange, stats }: OrderStatusTabsProps) => {
  return (
    <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm pt-2 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-slate-200/50 rounded-xl">
        {TABS.map((tab) => {
          const isActive = activeStatus === tab.id;
          const count = stats[tab.id];
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex-1 min-w-[120px] py-2.5 px-3 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap",
                isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative flex items-center justify-center gap-2">
                <span>{tab.label}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-bold",
                  isActive ? "bg-slate-100 text-slate-900" : "bg-slate-200 text-slate-500"
                )}>
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});
