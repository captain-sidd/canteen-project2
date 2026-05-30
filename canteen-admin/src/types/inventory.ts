export type StockStatus = 'healthy' | 'low' | 'critical';

export interface InventoryItemInterface {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  supplierName: string;
  lastRestocked: string;
  expiryDate?: string;
  status: StockStatus;
}
