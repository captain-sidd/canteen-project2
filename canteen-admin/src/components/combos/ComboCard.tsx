import React from 'react';
import type { ComboInterface } from '@/types/combo';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, IndianRupee, Tag, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComboCardProps {
  combo: ComboInterface;
  onEdit: () => void;
  onDelete: () => void;
}

export function ComboCard({ combo, onEdit, onDelete }: ComboCardProps) {
  return (
    <Card className={cn("overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow", !combo.isActive && "opacity-75")}>
      <CardHeader className="p-5 border-b bg-slate-50">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            {!combo.isActive && <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-sm font-bold">INACTIVE</span>}
            {combo.isTrending && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-sm font-bold">TRENDING</span>}
            {combo.isFeatured && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-sm font-bold">FEATURED</span>}
          </div>
          <div className="flex items-center text-xs font-black text-green-700 bg-green-100 px-2 py-1 rounded-md border border-green-200">
            <Tag className="w-3 h-3 mr-1" />
            SAVE {combo.savingsPercentage}%
          </div>
        </div>
        <h3 className="font-bold text-lg text-slate-800 tracking-tight leading-tight">{combo.name}</h3>
        <p className="text-xs font-medium text-slate-500 mt-1">{combo.description}</p>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col gap-4 bg-white">
        <div className="space-y-2 flex-1">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Included Items</h4>
          {combo.items.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between text-sm">
              <div className="flex gap-2">
                <span className="font-bold text-slate-600 bg-slate-100 px-1.5 rounded">{item.quantity}x</span>
                <span className="font-medium text-slate-700">{item.name}</span>
              </div>
              <span className="text-slate-400 font-medium">₹{item.originalPrice * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between border-t pt-4 mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Total</span>
            <span className="text-sm font-medium text-slate-400 line-through decoration-slate-400">₹{combo.originalTotal}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Combo Price</span>
            <div className="flex items-center font-black text-2xl text-slate-900 leading-none">
              <IndianRupee className="w-5 h-5" />
              {combo.comboPrice}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 bg-slate-50 border-t flex gap-2">
        <Button variant="outline" className="flex-1 text-slate-600 border-slate-300" onClick={onEdit}>
          <Edit2 className="w-4 h-4 mr-2" /> Edit
        </Button>
        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
