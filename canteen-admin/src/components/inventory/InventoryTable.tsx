import React from 'react';
import type { InventoryItemInterface } from '@/types/inventory';
import { StockBadge } from './StockBadge';
import { Button } from '@/components/ui/button';
import { Edit2, PackagePlus } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

interface InventoryTableProps {
  items: InventoryItemInterface[];
  onEdit?: (item: InventoryItemInterface) => void;
  onDelete?: (item: InventoryItemInterface) => void;
}

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
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
              <td className="px-4 py-3 font-bold text-slate-800">{item.item_name}</td>
              <td className="px-4 py-3 font-medium text-slate-600">{item.category}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-800 text-base">{item.stock_quantity}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">{item.unit}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Min: {item.min_stock} {item.unit}</div>
              </td>
              <td className="px-4 py-3">
                <StockBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-slate-600">{item.supplier_name || '-'}</td>
              <td className="px-4 py-3 text-xs font-medium text-slate-500">
                {formatDistanceToNowStrict(new Date(item.updated_at))} ago
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => onEdit?.(item)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete?.(item)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
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
