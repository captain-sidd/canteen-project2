export type QRScanState = 'waiting' | 'verifying' | 'valid' | 'invalid' | 'expired' | 'used' | 'cancelled';

export interface RecentScanInterface {
  id: string;
  scannedAt: string;
  status: QRScanState;
  orderNumber?: string;
  message?: string;
}
