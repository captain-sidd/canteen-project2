import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'pending' | 'warning' | 'failed' | 'default' | 'preparing' | 'ready' | 'completed' | 'cancelled';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType;
  children: React.ReactNode;
}

const statusVariants: Record<StatusType, string> = {
  success: 'bg-success text-success-foreground hover:bg-success/80',
  pending: 'bg-primary text-primary-foreground hover:bg-primary/80',
  warning: 'bg-warning text-warning-foreground hover:bg-warning/80',
  failed: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
  default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  preparing: 'bg-yellow-500 text-white hover:bg-yellow-600',
  ready: 'bg-blue-500 text-white hover:bg-blue-600',
  completed: 'bg-green-600 text-white hover:bg-green-700',
  cancelled: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
};

export function StatusBadge({ status, children, className, ...props }: StatusBadgeProps) {
  return (
    <Badge 
      className={cn("px-2 py-0.5 text-xs font-semibold rounded-full", statusVariants[status], className)} 
      {...props}
    >
      {children}
    </Badge>
  );
}
