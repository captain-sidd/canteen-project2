import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StockStatus } from '@/types/inventory';

interface StockBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StockStatus;
}

const statusVariants: Record<StockStatus, string> = {
  available: 'bg-green-100 text-green-800 border-green-200',
  low_stock: 'bg-warning/10 text-warning border-warning/20',
  out_of_stock: 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse',
};

export function StockBadge({ status, className, ...props }: StockBadgeProps) {
  return (
    <Badge 
      variant="outline"
      className={cn("px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider", statusVariants[status], className)} 
      {...props}
    >
      {status === 'low_stock' ? 'Low Stock' : status === 'out_of_stock' ? 'Out of Stock' : 'Available'}
    </Badge>
  );
}
