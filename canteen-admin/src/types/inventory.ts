export type StockStatus = 'available' | 'low_stock' | 'out_of_stock';

export interface InventoryItemInterface {
  id: string;
  item_name: string;
  item_code: string;
  category: string;
  stock_quantity: number;
  min_stock: number;
  max_stock?: number;
  unit: string;
  supplier_name?: string;
  supplier_contact?: string;
  purchase_price?: number;
  selling_price?: number;
  expiry_date?: string;
  status: StockStatus;
  created_at: string;
  updated_at: string;
}

export interface PaginatedInventoryResponse {
  items: InventoryItemInterface[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
