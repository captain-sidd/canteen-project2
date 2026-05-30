import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Plus, PackageOpen, AlertOctagon, TrendingDown } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import type { InventoryItemInterface } from '@/types/inventory';
import { InventoryTable } from '@/components/inventory/InventoryTable';

const MOCK_INVENTORY: InventoryItemInterface[] = [
  { id: 'inv1', name: 'Burger Buns', category: 'Bakery', quantity: 120, unit: 'pcs', minStockLevel: 50, supplierName: 'Daily Fresh Bakers', lastRestocked: '2023-10-01T10:00:00Z', expiryDate: '2023-10-05T00:00:00Z', status: 'healthy' },
  { id: 'inv2', name: 'Pizza Base', category: 'Bakery', quantity: 15, unit: 'pcs', minStockLevel: 30, supplierName: 'Daily Fresh Bakers', lastRestocked: '2023-09-28T10:00:00Z', expiryDate: '2023-10-02T00:00:00Z', status: 'critical' },
  { id: 'inv3', name: 'Cheese Slices', category: 'Dairy', quantity: 45, unit: 'packs', minStockLevel: 40, supplierName: 'Amul Distributors', lastRestocked: '2023-09-25T10:00:00Z', expiryDate: '2023-11-25T00:00:00Z', status: 'low' },
  { id: 'inv4', name: 'Coffee Beans', category: 'Beverages', quantity: 5, unit: 'kg', minStockLevel: 2, supplierName: 'Nescafe Wholesale', lastRestocked: '2023-09-15T10:00:00Z', expiryDate: '2024-05-15T00:00:00Z', status: 'healthy' },
  { id: 'inv5', name: 'Tomato Ketchup', category: 'Condiments', quantity: 2, unit: 'bottles', minStockLevel: 5, supplierName: 'Kissan Corp', lastRestocked: '2023-08-10T10:00:00Z', expiryDate: '2024-08-10T00:00:00Z', status: 'critical' },
];

export default function InventoryManagement() {
  const [items, setItems] = useState<InventoryItemInterface[]>(MOCK_INVENTORY);
  
  const totalItems = items.length;
  const criticalItems = items.filter(i => i.status === 'critical').length;
  const lowItems = items.filter(i => i.status === 'low').length;

  return (
    <PageContainer>
      <SectionHeader 
        title="Inventory Control" 
        description="Monitor raw materials, manage stock levels, and predict shortages."
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Receive Stock
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Items Tracked" value={totalItems} icon={<PackageOpen />} />
        <MetricCard title="Low Stock Alerts" value={lowItems} icon={<TrendingDown />} trend={{ value: lowItems, label: 'needs restock', isPositive: false }} />
        <MetricCard title="Critical Shortages" value={criticalItems} icon={<AlertOctagon />} className={criticalItems > 0 ? "border-red-200 bg-red-50/50" : ""} trend={criticalItems > 0 ? { value: criticalItems, label: 'urgent action required', isPositive: false } : undefined} />
      </div>

      <InventoryTable items={items} />
    </PageContainer>
  );
}
