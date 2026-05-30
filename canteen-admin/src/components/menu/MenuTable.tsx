import React from 'react';
import type { MenuItemInterface } from '@/types/menu';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, IndianRupee } from 'lucide-react';

interface MenuTableProps {
  items: MenuItemInterface[];
  onEdit: (item: MenuItemInterface) => void;
  onDelete: (item: MenuItemInterface) => void;
}

export function MenuTable({ items, onEdit, onDelete }: MenuTableProps) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs font-semibold">
          <tr>
            <th className="px-4 py-3">Item Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Diet</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <div className="font-bold text-slate-800">{item.name}</div>
                <div className="flex gap-1 mt-1">
                  {item.isTrending && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded-sm font-bold">TRENDING</span>}
                  {item.isFeatured && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded-sm font-bold">FEATURED</span>}
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-slate-600">{item.categoryName}</td>
              <td className="px-4 py-3">
                <div className="flex items-center font-bold text-slate-800">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {item.offerPrice || item.price}
                </div>
                {item.offerPrice && <div className="text-xs text-slate-400 line-through">₹{item.price}</div>}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={item.dietType === 'veg' ? 'success' : item.dietType === 'non-veg' ? 'failed' : 'warning'}>
                  {item.dietType}
                </StatusBadge>
              </td>
              <td className="px-4 py-3">
                {item.inStock ? (
                  <div className="flex flex-col">
                    <span className="text-green-600 font-bold">In Stock</span>
                    <span className="text-xs text-slate-500">{item.stockQuantity} units left</span>
                  </div>
                ) : (
                  <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md text-xs">Out of Stock</span>
                )}
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => onEdit(item)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(item)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-medium">
                No menu items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
