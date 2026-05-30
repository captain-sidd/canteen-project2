import React from 'react';
import type { RecentScanInterface } from '@/types/qr';
import { QRStatusBadge } from './QRStatusBadge';
import { Clock } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

interface RecentScansListProps {
  scans: RecentScanInterface[];
}

export function RecentScansList({ scans }: RecentScansListProps) {
  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4">
        <Clock className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm font-medium text-slate-500">No recent scans</p>
        <p className="text-xs text-slate-400 mt-1">Scan history will appear here</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Recent Scans</h3>
      <div className="space-y-2">
        {scans.map((scan) => (
          <div key={scan.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">
                {scan.orderNumber ? `#${scan.orderNumber}` : 'Unknown QR'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {scan.message || 'Scanned'} • {formatDistanceToNowStrict(new Date(scan.scannedAt))} ago
              </span>
            </div>
            <QRStatusBadge status={scan.status} className="scale-90 origin-right" />
          </div>
        ))}
      </div>
    </div>
  );
}
