import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Plus, Percent, Layers, Flame, RefreshCw } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import type { ComboInterface } from '@/types/combo';
import { ComboCard } from '@/components/combos/ComboCard';
import { ComboDialog } from '@/components/combos/ComboDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { combosApi, menuApi, parseApiError } from '@/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';


export default function ComboManagement() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboInterface | null>(null);
  const [comboToDelete, setComboToDelete] = useState<ComboInterface | null>(null);

  const { data: realResponse, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['combos'],
    queryFn: combosApi.getAll,
    retry: 1
  });

  const { data: menuItems, isLoading: isMenuLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: menuApi.getAll,
    retry: 1
  });

  const loadError = isError;

  // Resolve item names and original prices from the live menu items database
  const resolvedCombos = React.useMemo(() => {
    const rawItems = realResponse?.items;
    if (!Array.isArray(rawItems)) return [];

    const menuList = Array.isArray(menuItems) ? menuItems : [];

    return rawItems.map((combo: any) => {
      const resolvedItems = (combo.items ?? []).map((item: any) => {
        const menuItemIdStr = String(item.menuItemId ?? item.menu_item_id ?? '');
        const menuItem = menuList.find((m: any) => m.id === menuItemIdStr);
        const itemName = menuItem?.name || item.name || item.menu_item_name || `Item ${menuItemIdStr.slice(-4) || 'Combo Item'}`;
        const originalPrice = menuItem?.price ?? item.originalPrice ?? item.original_price ?? 0;

        return {
          ...item,
          menuItemId: menuItemIdStr,
          name: itemName,
          quantity: Number(item.quantity ?? 1),
          originalPrice,
        };
      });

      const originalTotal = resolvedItems.reduce((sum: number, it: any) => sum + (Number(it.originalPrice ?? 0) * Number(it.quantity ?? 1)), 0);
      const savingsPercentage = originalTotal > 0 ? Math.round(((originalTotal - Number(combo.comboPrice ?? 0)) / originalTotal) * 100) : 0;

      return {
        ...combo,
        items: resolvedItems,
        originalTotal: originalTotal > 0 ? originalTotal : Number(combo.originalTotal ?? combo.original_price ?? 0),
        savingsPercentage: savingsPercentage > 0 ? savingsPercentage : Number(combo.savingsPercentage ?? combo.discount_percentage ?? 0),
      };
    });
  }, [realResponse, menuItems]);

  const combos = resolvedCombos;

  const totalCombos = combos.length;
  const activeCombos = combos.filter((c: ComboInterface) => c.isActive).length;
  const avgSavings = Math.round(combos.reduce((acc: number, c: ComboInterface) => acc + Number(c.savingsPercentage ?? 0), 0) / (combos.length || 1));

  const deleteMutation = useMutation({
    mutationFn: combosApi.delete,
    onSuccess: () => {
      toast.success('Combo deleted');
      queryClient.invalidateQueries({ queryKey: ['combos'] });
    },
    onError: (err) => toast.error('Failed to delete', { description: parseApiError(err) })
  });

  const saveMutation = useMutation({
    mutationFn: (combo: any) => combo.id ? combosApi.update(combo) : combosApi.create(combo),
    onSuccess: () => {
      toast.success(selectedCombo ? 'Combo updated' : 'Combo created');
      queryClient.invalidateQueries({ queryKey: ['combos'] });
      setIsDialogOpen(false);
    },
    onError: (err) => toast.error('Failed to save', { description: parseApiError(err) })
  });

  const handleDelete = async () => {
    if (comboToDelete) {
      await deleteMutation.mutateAsync(comboToDelete.id);
      setComboToDelete(null);
    }
  };

  const handleSave = async (newCombo: any) => {
    await saveMutation.mutateAsync(newCombo);
  };

  const hasAuth = isAuthenticated && !!localStorage.getItem('admin_token');
  const isScreenLoading = hasAuth && (isLoading || isMenuLoading);

  return (
    <PageContainer>
      <SectionHeader 
        title="Combo Builder" 
        description="Bundle menu items into attractive combos to drive higher order value."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Sync
            </Button>
            <Button onClick={() => { setSelectedCombo(null); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Create Combo
            </Button>
          </div>
        }
      />

      {loadError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6 text-xs text-red-800 rounded-r-lg">
          <strong>Combo data failed to load.</strong> Please verify the backend is available.
        </div>
      )}

      {isScreenLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white border rounded-xl p-6 shadow-sm space-y-3 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard title="Active Combos" value={activeCombos} icon={<Layers />} trend={{ value: 2, label: 'this month', isPositive: true }} />
          <MetricCard title="Average Savings" value={`${avgSavings}%`} icon={<Percent />} />
          <MetricCard title="Trending Combos" value={combos.filter((c: ComboInterface) => c.isTrending).length} icon={<Flame />} />
        </div>
      )}

      {isScreenLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white border rounded-xl p-6 shadow-sm space-y-4 animate-pulse h-80 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-full" />
              </div>
              <div className="h-10 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo: ComboInterface) => (
            <ComboCard 
              key={combo.id} 
              combo={combo} 
              onEdit={() => { setSelectedCombo(combo); setIsDialogOpen(true); }}
              onDelete={() => setComboToDelete(combo)}
            />
          ))}
        </div>
      )}

      {isDialogOpen && (
        <ComboDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          combo={selectedCombo}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        isOpen={!!comboToDelete}
        onClose={() => setComboToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Combo"
        description={`Are you sure you want to delete "${comboToDelete?.name}"?`}
        variant="destructive"
        confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
      />
    </PageContainer>
  );
}
