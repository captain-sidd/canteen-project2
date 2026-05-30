import React from 'react';
import { ScanLine, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface QRScannerPlaceholderProps {
  onSimulate: (code: string) => void;
  isVerifying: boolean;
}

export function QRScannerPlaceholder({ onSimulate, isVerifying }: QRScannerPlaceholderProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800">Scanner Ready</h2>
          <p className="text-xs text-slate-500">Point customer's QR code to the camera</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-green-600 uppercase">Camera Active</span>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden min-h-[300px]">
        {/* Mock Camera Viewfinder */}
        <div className="relative w-64 h-64 border-2 border-dashed border-white/30 rounded-xl flex items-center justify-center">
          <QrCode className="w-24 h-24 text-white/20" />
          
          {/* Animated Scan Line */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          />
          
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
        </div>

        {isVerifying && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <ScanLine className="w-12 h-12 text-primary animate-pulse mb-3" />
            <h3 className="text-white font-bold tracking-wider">VERIFYING QR...</h3>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Simulate Scan Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="bg-green-50 hover:bg-green-100 hover:text-green-700 text-green-700 border-green-200"
            onClick={() => onSimulate('QR_VALID_123')}
            disabled={isVerifying}
          >
            Valid Order
          </Button>
          <Button 
            variant="outline"
            className="bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-700 border-red-200"
            onClick={() => onSimulate('QR_INVALID_XYZ')}
            disabled={isVerifying}
          >
            Invalid QR
          </Button>
          <Button 
            variant="outline"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
            onClick={() => onSimulate('QR_USED_456')}
            disabled={isVerifying}
          >
            Already Used
          </Button>
          <Button 
            variant="outline"
            className="bg-orange-50 hover:bg-orange-100 hover:text-orange-700 text-orange-700 border-orange-200"
            onClick={() => onSimulate('QR_EXPIRED_789')}
            disabled={isVerifying}
          >
            Expired
          </Button>
        </div>
      </div>
    </div>
  );
}
