import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InventoryItemInterface } from '@/types/inventory';
import { toast } from 'sonner';
import { inventoryApi } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItemInterface | null;
}

export function InventoryDialog({ open, onOpenChange, item }: InventoryDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<InventoryItemInterface>>({
    item_name: '',
    item_code: '',
    category: '',
    stock_quantity: 0,
    min_stock: 0,
    unit: 'pcs',
    supplier_name: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        item_name: item.item_name,
        item_code: item.item_code,
        category: item.category,
        stock_quantity: item.stock_quantity,
        min_stock: item.min_stock,
        unit: item.unit,
        supplier_name: item.supplier_name || '',
      });
    } else {
      setFormData({
        item_name: '',
        item_code: '',
        category: '',
        stock_quantity: 0,
        min_stock: 0,
        unit: 'pcs',
        supplier_name: '',
      });
    }
  }, [item, open]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<InventoryItemInterface>) => {
      if (item) {
        return inventoryApi.update({ ...data, id: item.id });
      } else {
        return inventoryApi.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(`Item successfully ${item ? 'updated' : 'added'}`);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'An error occurred');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{item ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Name</label>
              <Input
                className="col-span-3"
                value={formData.item_name}
                onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Code</label>
              <Input
                className="col-span-3"
                value={formData.item_code}
                onChange={e => setFormData({ ...formData, item_code: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Category</label>
              <Input
                className="col-span-3"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Stock</label>
              <Input
                type="number"
                className="col-span-3"
                value={formData.stock_quantity}
                onChange={e => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                required
                min={0}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Min Stock</label>
              <Input
                type="number"
                className="col-span-3"
                value={formData.min_stock}
                onChange={e => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                required
                min={0}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Unit</label>
              <Input
                className="col-span-3"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Supplier</label>
              <Input
                className="col-span-3"
                value={formData.supplier_name}
                onChange={e => setFormData({ ...formData, supplier_name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
