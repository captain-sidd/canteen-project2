import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { UtensilsCrossed, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import type { MenuItemInterface } from '@/types/menu';
import { MenuFilters } from '@/components/menu/MenuFilters';
import { MenuTable } from '@/components/menu/MenuTable';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { MenuItemDialog } from '@/components/menu/MenuItemDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi, parseApiError } from '@/api';
import { toast } from 'sonner';

export default function MenuManagement() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemInterface | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItemInterface | null>(null);

  const { data: realItems, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['menu'],
    queryFn: menuApi.getAll,
    retry: 1
  });

  const items = realItems ?? [];

  const filteredItems = items.filter((item: MenuItemInterface) => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: menuApi.delete,
    onSuccess: () => {
      toast.success('Menu item deleted');
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (err) => {
      toast.error('Failed to delete item', { description: parseApiError(err) });
    }
  });

  const saveMutation = useMutation({
    mutationFn: (item: any) => item.id ? menuApi.update(item) : menuApi.create(item),
    onSuccess: () => {
      toast.success(selectedItem ? 'Menu item updated' : 'Menu item created');
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      setIsDialogOpen(false);
    },
    onError: (err) => {
      toast.error('Failed to save item', { description: parseApiError(err) });
    }
  });

  const handleDelete = async () => {
    if (itemToDelete) {
      await deleteMutation.mutateAsync(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleSave = async (newItem: any) => {
    await saveMutation.mutateAsync(newItem);
  };

  return (
    <PageContainer>
      <SectionHeader 
        title="Menu Management" 
        description="Manage canteen food items, pricing, and availability."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Sync
            </Button>
            <Button onClick={() => { setSelectedItem(null); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>
        }
      />

      {isError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6 text-sm text-red-800">
          <strong>Menu load failed:</strong> Verify the backend and try syncing again.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Items" value={items.length} icon={<UtensilsCrossed />} trend={{ value: 5, label: 'this week', isPositive: true }} />
        <MetricCard title="Trending Items" value={items.filter((i: MenuItemInterface) => i.isTrending).length} icon={<TrendingUp />} />
        <MetricCard title="Out of Stock" value={items.filter((i: MenuItemInterface) => !i.inStock).length} icon={<AlertCircle />} trend={{ value: items.filter((i: MenuItemInterface) => !i.inStock).length > 0 ? 12 : 0, label: 'action needed', isPositive: false }} />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <MenuFilters search={search} onSearchChange={setSearch} />
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <Button variant={view === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setView('table')}><List className="w-4 h-4" /></Button>
          <Button variant={view === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setView('grid')}><LayoutGrid className="w-4 h-4" /></Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Loading menu...</div>
      ) : view === 'table' ? (
        <MenuTable 
          items={filteredItems} 
          onEdit={(i) => { setSelectedItem(i); setIsDialogOpen(true); }}
          onDelete={setItemToDelete}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item: MenuItemInterface) => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              onEdit={() => { setSelectedItem(item); setIsDialogOpen(true); }}
              onDelete={() => setItemToDelete(item)}
            />
          ))}
        </div>
      )}

      {isDialogOpen && (
        <MenuItemDialog 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
          item={selectedItem}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Menu Item"
        description={`Are you sure you want to delete ${itemToDelete?.name}? This action cannot be undone.`}
        variant="destructive"
        confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
      />
    </PageContainer>
  );
}
