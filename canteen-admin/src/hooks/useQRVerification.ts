import { useState } from 'react';
import type { QRScanState, RecentScanInterface } from '@/types/qr';
import type { OrderInterface } from '@/types/order';
import { qrApi, parseApiError } from '@/api';
import { toast } from 'sonner';

export function useQRVerification() {
  const [scanState, setScanState] = useState<QRScanState>('waiting');
  const [verifiedOrder, setVerifiedOrder] = useState<OrderInterface | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScanInterface[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const logScan = (orderNumber: string, status: 'valid' | 'invalid' | 'expired' | 'used', studentName?: string) => {
    const newScan: RecentScanInterface = {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber,
      scannedAt: new Date().toISOString(),
      status,
      message: studentName ? `Scanned for ${studentName}` : undefined
    };
    setRecentScans(prev => [newScan, ...prev].slice(0, 10)); // Keep last 10
  };

  const simulateScan = async (mockOutcome: 'valid' | 'invalid' | 'expired' | 'used', rawData: string = "mock_data") => {
    setScanState('verifying');
    setErrorMessage('');
    
    // Attempt real API call first
    try {
      const response = await qrApi.verify(rawData);
      setVerifiedOrder(response.order);
      setScanState('valid');
      logScan(response.order.orderNumber || response.order.id, 'valid', response.order.customerName || 'Student');
      toast.success('Order Verified', { description: response.message });
      return;
    } catch (err: any) {
      // Backend returned error or is offline
      const msg = parseApiError(err);
      
      // If we're strictly doing a demo fallback because backend is offline, we'll use the mockOutcome
      if (err.code === 'ERR_NETWORK' || msg.includes('No response')) {
        toast.error('Backend Offline', { description: 'Using mock QR verification logic.' });
        // Fallback to mock logic delay
        setTimeout(() => {
          if (mockOutcome === 'valid') {
            setVerifiedOrder({
              id: 'ORD-MOCK-1',
              orderNumber: 'MOCK',
              customerName: 'Demo Student',
              items: [{ id: '1', name: 'Burger', price: 100, quantity: 1 }],
              totalAmount: 100,
              orderType: 'takeaway',
              paymentMethod: 'wallet',
              paymentStatus: 'paid',
              status: 'ready',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            setScanState('valid');
            logScan('ORD-MOCK-1', 'valid', 'Demo Student');
          } else {
            setVerifiedOrder(null);
            setScanState(mockOutcome);
            setErrorMessage(`QR code is ${mockOutcome}`);
            logScan('UNKNOWN', mockOutcome);
          }
        }, 800);
      } else {
        // Real API returned an invalid state (e.g. 400 Bad Request)
        setVerifiedOrder(null);
        setScanState('invalid');
        setErrorMessage(msg);
        logScan('UNKNOWN', 'invalid');
        toast.error('Verification Failed', { description: msg });
      }
    }
  };

  const markAsHandedOver = () => {
    if (verifiedOrder) {
      setScanState('used');
      setVerifiedOrder(null);
      // In a real app, the verification endpoint already marked it complete.
      // Or we'd fire ordersApi.updateStatus(verifiedOrder.id, 'completed') here if needed.
      toast.success('Order Handed Over', { description: 'Status set to Completed.' });
    }
  };

  const resetScanner = () => {
    setScanState('waiting');
    setVerifiedOrder(null);
    setErrorMessage('');
  };

  return {
    scanState,
    verifiedOrder,
    recentScans,
    errorMessage,
    simulateScan,
    markAsHandedOver,
    resetScanner
  };
}
