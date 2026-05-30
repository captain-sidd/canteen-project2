import React from 'react';
import type { MenuItemInterface } from '@/types/menu';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, IndianRupee, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItemInterface;
  onEdit: () => void;
  onDelete: () => void;
}

export function MenuItemCard({ item, onEdit, onDelete }: MenuItemCardProps) {
  return (
    <Card className={cn("overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow", !item.inStock && "opacity-75")}>
      <CardHeader className="p-4 pb-2 border-b bg-slate-50 relative">
        {!item.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-md shadow-sm border border-red-200">OUT OF STOCK</span>
          </div>
        )}
        <div className="flex justify-between items-start mb-2">
          <StatusBadge status={item.dietType === 'veg' ? 'success' : item.dietType === 'non-veg' ? 'failed' : 'warning'} className="scale-90 origin-top-left">
            {item.dietType}
          </StatusBadge>
          <div className="flex gap-1">
            {item.isTrending && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-sm font-bold">TRENDING</span>}
            {item.isFeatured && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm font-bold">FEATURED</span>}
          </div>
        </div>
        <h3 className="font-bold text-slate-800 line-clamp-1" title={item.name}>{item.name}</h3>
        <p className="text-xs font-medium text-slate-500">{item.categoryName}</p>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center font-black text-xl text-slate-800">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              {item.offerPrice || item.price}
            </div>
            {item.offerPrice && <div className="text-xs font-medium text-slate-400 line-through decoration-slate-400">₹{item.price}</div>}
          </div>
          
          <div className="flex flex-col items-end gap-1 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.prepTimeMins} mins</span>
            <span className="flex items-center gap-1 text-amber-600"><Star className="w-3.5 h-3.5 fill-amber-500" /> {item.rating}</span>
          </div>
        </div>

        {item.inStock && (
          <div className="mt-auto text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-md border border-slate-100">
            Stock: <span className="text-slate-800 font-bold">{item.stockQuantity}</span> units
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 bg-slate-50 border-t flex gap-2 z-20 relative">
        <Button variant="outline" className="flex-1 text-slate-600" onClick={onEdit}>
          <Edit2 className="w-4 h-4 mr-2" /> Edit
        </Button>
        <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
