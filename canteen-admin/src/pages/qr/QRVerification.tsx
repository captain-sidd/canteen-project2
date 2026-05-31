import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useQRVerification } from '@/hooks/useQRVerification';
import { QRScannerPlaceholder } from '@/components/qr/QRScannerPlaceholder';
import { VerificationStateCard } from '@/components/qr/VerificationStateCard';
import { VerifiedOrderCard } from '@/components/qr/VerifiedOrderCard';
import { RecentScansList } from '@/components/qr/RecentScansList';
import { QrCode, RotateCcw, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ordersApi, parseApiError } from '@/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { OrderInterface } from '@/types/order';

export default function QRVerification() {
  const queryClient = useQueryClient();
  const { 
    scanState, 
    verifiedOrder: activeOrder, 
    recentScans, 
    errorMessage, 
    simulateScan, 
    markAsHandedOver: markDelivered, 
    resetScanner 
  } = useQRVerification();

  const [manualOrderNumber, setManualOrderNumber] = useState('');
  const [isVerifyingManual, setIsVerifyingManual] = useState(false);
  const [manualOrder, setManualOrder] = useState<OrderInterface | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  const handleSimulate = (code: string) => {
    let outcome: 'valid' | 'invalid' | 'expired' | 'used' = 'invalid';
    if (code.includes('VALID')) outcome = 'valid';
    else if (code.includes('USED')) outcome = 'used';
    else if (code.includes('EXPIRED')) outcome = 'expired';
    
    simulateScan(outcome, code);
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualOrderNumber.trim()) return;

    setIsVerifyingManual(true);
    setManualError(null);
    setManualOrder(null);
    resetScanner(); // Clear QR state if any

    try {
      const order = await ordersApi.getById(manualOrderNumber.trim());
      
      let error = null;
      if (order.status === 'completed') {
        error = "Order already collected.";
      } else if (order.status === 'cancelled') {
        error = "Order cancelled.";
      } else if (order.status === 'pending' || order.status === 'preparing') {
        error = "Order is not ready for collection.";
      }

      setManualOrder(order);
      setManualError(error);
    } catch (err) {
      setManualError("Order not found or an error occurred.");
    } finally {
      setIsVerifyingManual(false);
    }
  };

  const handleManualMarkCompleted = async () => {
    if (!manualOrder) return;
    try {
      await ordersApi.updateStatus({ id: manualOrder.id, status: 'completed' });
      toast.success('Order marked as completed');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setManualOrder(null);
      setManualOrderNumber('');
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const resetAll = () => {
    resetScanner();
    setManualOrder(null);
    setManualError(null);
    setManualOrderNumber('');
  };

  const isManualMode = manualOrder !== null || manualError !== null || isVerifyingManual;

  return (
    <PageContainer className="flex flex-col h-full bg-slate-50/50">
      <SectionHeader 
        title="QR Verification Terminal" 
        description="Scan student QR codes or enter Order Number to hand over orders."
        action={
          <Button variant="outline" size="sm" onClick={resetAll} disabled={(scanState === 'waiting' || scanState === 'verifying') && !isManualMode}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Terminal
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
          
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-4">
            <h3 className="font-semibold text-slate-800">Enter Order Number</h3>
            <form onSubmit={handleManualVerify} className="flex gap-2">
              <Input
                placeholder="Enter Order Number"
                value={manualOrderNumber}
                onChange={e => setManualOrderNumber(e.target.value)}
                disabled={isVerifyingManual}
              />
              <Button type="submit" disabled={!manualOrderNumber.trim() || isVerifyingManual}>
                {isVerifyingManual ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </Button>
            </form>
          </div>

          <RecentScansList scans={recentScans} />
        </div>

        {/* Right Panel: State & Order Details */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {!isManualMode && scanState !== 'waiting' && scanState !== 'verifying' && (
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

            {!isManualMode && activeOrder && (
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
            
            {/* Manual Verification UI */}
            {isManualMode && manualError && (
              <motion.div
                key="manual-error"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <VerificationStateCard state="invalid" errorMessage={manualError} />
              </motion.div>
            )}
            
            {isManualMode && manualOrder && !manualError && (
              <motion.div
                key="manual-state-card"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <VerificationStateCard state="valid" />
              </motion.div>
            )}

            {isManualMode && manualOrder && (
              <motion.div
                key="manual-order-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-1 min-h-[500px]"
              >
                <VerifiedOrderCard 
                  order={manualOrder} 
                  onMarkDelivered={handleManualMarkCompleted}
                  canMarkDelivered={!manualError && manualOrder.status === 'ready'}
                />
              </motion.div>
            )}

            {!isManualMode && scanState === 'waiting' && (
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
                <h3 className="text-xl font-bold text-slate-700">Waiting for Verification</h3>
                <p className="text-slate-500 mt-2 text-center max-w-sm">
                  Point the scanner at the student's phone or enter an order number to verify.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
}
