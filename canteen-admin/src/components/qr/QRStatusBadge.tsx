import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { QRScanState } from '@/types/qr';

interface QRStatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: QRScanState;
}

const qrStatusVariants: Record<QRScanState, string> = {
  waiting: 'bg-slate-200 text-slate-700',
  verifying: 'bg-blue-100 text-blue-700 animate-pulse',
  valid: 'bg-green-100 text-green-800',
  invalid: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
  used: 'bg-slate-300 text-slate-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function QRStatusBadge({ status, className, ...props }: QRStatusBadgeProps) {
  return (
    <Badge 
      variant="outline"
      className={cn("px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border-0", qrStatusVariants[status], className)} 
      {...props}
    >
      {status}
    </Badge>
  );
}
