import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, PackageOpen, AlertOctagon, TrendingDown, Search, Loader2 } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import type { InventoryItemInterface } from '@/types/inventory';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryDialog } from '@/components/inventory/InventoryDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/api';
import { toast } from 'sonner';

export default function InventoryManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemInterface | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItemInterface | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page, search],
    queryFn: () => inventoryApi.getAll({ page, limit: 20, search }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete item');
    }
  });

  const handleAdd = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: InventoryItemInterface) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDeleteClick = (item: InventoryItemInterface) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const items = data?.items || [];
  
  const totalItems = data?.total || 0;
  const criticalItems = items.filter(i => i.status === 'out_of_stock').length;
  const lowItems = items.filter(i => i.status === 'low_stock').length;
  const uniqueCategories = new Set(items.map(i => i.category)).size;

  return (
    <PageContainer>
      <SectionHeader 
        title="Inventory Control" 
        description="Monitor raw materials, manage stock levels, and predict shortages."
        action={
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" /> Receive Stock
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Items Tracked" value={totalItems} icon={<PackageOpen />} />
        <MetricCard title="Low Stock Alerts" value={lowItems} icon={<TrendingDown />} trend={{ value: lowItems, label: 'needs restock', isPositive: false }} />
        <MetricCard title="Out of Stock" value={criticalItems} icon={<AlertOctagon />} className={criticalItems > 0 ? "border-red-200 bg-red-50/50" : ""} trend={criticalItems > 0 ? { value: criticalItems, label: 'urgent action required', isPositive: false } : undefined} />
        <MetricCard title="Categories" value={uniqueCategories} icon={<PackageOpen />} />
      </div>

      <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by name, code, or category..." 
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <InventoryTable 
            items={items} 
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
          
          {data && data.pages > 1 && (
            <div className="flex justify-between items-center mt-4 px-2">
              <span className="text-sm text-slate-500">
                Showing page {page} of {data.pages}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === data.pages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <InventoryDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        item={selectedItem}
      />
      
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Inventory Item"
        description={`Are you sure you want to delete ${itemToDelete?.item_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </PageContainer>
  );
}
