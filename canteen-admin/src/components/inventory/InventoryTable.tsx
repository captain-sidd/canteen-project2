import React from 'react';
import type { InventoryItemInterface } from '@/types/inventory';
import { StockBadge } from './StockBadge';
import { Button } from '@/components/ui/button';
import { Edit2, PackagePlus } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

interface InventoryTableProps {
  items: InventoryItemInterface[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs font-semibold">
          <tr>
            <th className="px-4 py-3">Item Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Current Stock</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Supplier</th>
            <th className="px-4 py-3">Last Restocked</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-bold text-slate-800">{item.name}</td>
              <td className="px-4 py-3 font-medium text-slate-600">{item.category}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-800 text-base">{item.quantity}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">{item.unit}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Min: {item.minStockLevel} {item.unit}</div>
              </td>
              <td className="px-4 py-3">
                <StockBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-slate-600">{item.supplierName}</td>
              <td className="px-4 py-3 text-xs font-medium text-slate-500">
                {formatDistanceToNowStrict(new Date(item.lastRestocked))} ago
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <Button variant="outline" size="sm" className="h-8">
                  <PackagePlus className="w-4 h-4 mr-1.5" /> Restock
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-medium">
                No inventory items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
