export type PaymentMethod = 'wallet' | 'upi' | 'cash';
export type TransactionStatus = 'success' | 'failed' | 'refunded' | 'pending';
export type TransactionType = 'credit' | 'debit';

export interface TransactionInterface {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: TransactionType;
  method: PaymentMethod;
  status: TransactionStatus;
  description: string;
  timestamp: string;
  referenceId: string;
}
