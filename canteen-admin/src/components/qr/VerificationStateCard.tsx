import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import type { QRScanState } from '@/types/qr';
import { cn } from '@/lib/utils';

interface VerificationStateCardProps {
  state: QRScanState;
  errorMessage?: string;
}

export function VerificationStateCard({ state, errorMessage }: VerificationStateCardProps) {
  if (state === 'waiting' || state === 'verifying') return null;

  const stateConfig = {
    valid: {
      icon: CheckCircle2,
      title: 'QR Code Valid',
      desc: 'Order is ready to be handed off.',
      colors: 'bg-green-50 border-green-200 text-green-800',
      iconColor: 'text-green-600'
    },
    invalid: {
      icon: XCircle,
      title: 'Invalid QR Code',
      desc: errorMessage || 'This QR code is not recognized.',
      colors: 'bg-red-50 border-red-200 text-red-800',
      iconColor: 'text-red-600'
    },
    used: {
      icon: AlertTriangle,
      title: 'Already Scanned',
      desc: 'This order was already marked as delivered.',
      colors: 'bg-slate-100 border-slate-300 text-slate-800',
      iconColor: 'text-slate-600'
    },
    expired: {
      icon: Clock,
      title: 'Order Cancelled',
      desc: 'This order was cancelled and cannot be delivered.',
      colors: 'bg-orange-50 border-orange-200 text-orange-800',
      iconColor: 'text-orange-600'
    },
    cancelled: {
      icon: XCircle,
      title: 'Order Cancelled',
      desc: 'This order was cancelled.',
      colors: 'bg-red-50 border-red-200 text-red-800',
      iconColor: 'text-red-600'
    }
  };

  const config = stateConfig[state];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={cn("rounded-xl border p-6 flex items-start gap-4", config.colors)}>
      <Icon className={cn("w-10 h-10 shrink-0", config.iconColor)} />
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-1">{config.title}</h2>
        <p className="text-sm opacity-90">{config.desc}</p>
      </div>
    </div>
  );
}
