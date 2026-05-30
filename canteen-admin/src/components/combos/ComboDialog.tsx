import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ComboInterface } from '@/types/combo';
import { Input } from '@/components/ui/input';

interface ComboDialogProps {
  isOpen: boolean;
  onClose: () => void;
  combo: ComboInterface | null;
  onSave: (combo: ComboInterface) => void;
}

export function ComboDialog({ isOpen, onClose, combo, onSave }: ComboDialogProps) {
  const handleSave = () => {
    onSave({
      id: combo?.id || Math.random().toString(36).substr(2, 9),
      name: combo?.name || 'New Value Combo',
      description: combo?.description || 'A great combination of our best items.',
      items: combo?.items || [
        { menuItemId: 'mock1', name: 'Placeholder Item', quantity: 1, originalPrice: 100 }
      ],
      originalTotal: combo?.originalTotal || 100,
      comboPrice: combo?.comboPrice || 80,
      savingsPercentage: combo?.savingsPercentage || 20,
      isActive: combo?.isActive ?? true,
      isFeatured: combo?.isFeatured || false,
      isTrending: combo?.isTrending || false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{combo ? 'Edit Combo' : 'Create New Combo'}</DialogTitle>
          <DialogDescription>
            Group menu items together and set a discounted combo price.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-bold text-slate-700">Combo Name</label>
            <Input defaultValue={combo?.name || ''} placeholder="e.g. Exam Night Fuel" />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <Input defaultValue={combo?.description || ''} placeholder="Describe the combo..." />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Combo Price (₹)</label>
            <Input type="number" defaultValue={combo?.comboPrice || ''} placeholder="220" />
          </div>

          {/* Note: Real implementation would have a dynamic item selector list here */}
          <div className="col-span-2 mt-4 p-4 border border-dashed rounded-lg bg-slate-50 text-center text-sm text-slate-500">
            [ Interactive Menu Item Selector UI goes here in implementation ]
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Combo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
