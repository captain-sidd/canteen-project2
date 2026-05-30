import React from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useQRVerification } from '@/hooks/useQRVerification';
import { QRScannerPlaceholder } from '@/components/qr/QRScannerPlaceholder';
import { VerificationStateCard } from '@/components/qr/VerificationStateCard';
import { VerifiedOrderCard } from '@/components/qr/VerifiedOrderCard';
import { RecentScansList } from '@/components/qr/RecentScansList';
import { QrCode, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function QRVerification() {
  const { 
    scanState, 
    verifiedOrder: activeOrder, 
    recentScans, 
    errorMessage, 
    simulateScan, 
    markAsHandedOver: markDelivered, 
    resetScanner 
  } = useQRVerification();

  const handleSimulate = (code: string) => {
    let outcome: 'valid' | 'invalid' | 'expired' | 'used' = 'invalid';
    if (code.includes('VALID')) outcome = 'valid';
    else if (code.includes('USED')) outcome = 'used';
    else if (code.includes('EXPIRED')) outcome = 'expired';
    
    simulateScan(outcome, code);
  };

  return (
    <PageContainer className="flex flex-col h-full bg-slate-50/50">
      <SectionHeader 
        title="QR Verification Terminal" 
        description="Scan student QR codes to hand over orders."
        action={
          <Button variant="outline" size="sm" onClick={resetScanner} disabled={scanState === 'waiting' || scanState === 'verifying'}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Scanner
          </Button>
        }
      />
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Left Panel: Scanner & History */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="h-[450px]">
            <QRScannerPlaceholder 
              onSimulate={handleSimulate} 
              isVerifying={scanState === 'verifying'} 
            />
          </div>
          <RecentScansList scans={recentScans} />
        </div>

        {/* Right Panel: State & Order Details */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {scanState !== 'waiting' && scanState !== 'verifying' && (
              <motion.div
                key="state-card"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <VerificationStateCard state={scanState} errorMessage={errorMessage} />
              </motion.div>
            )}

            {activeOrder && (
              <motion.div
                key="order-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-1 min-h-[500px]"
              >
                <VerifiedOrderCard 
                  order={activeOrder} 
                  onMarkDelivered={markDelivered}
                  canMarkDelivered={scanState === 'valid'}
                />
              </motion.div>
            )}

            {scanState === 'waiting' && (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <QrCode className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Waiting for Scan</h3>
                <p className="text-slate-500 mt-2 text-center max-w-sm">
                  Point the scanner at the student's phone to instantly verify their order.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
}
