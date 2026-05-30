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
import { combosApi, parseApiError } from '@/api';
import { toast } from 'sonner';

const MOCK_COMBOS: ComboInterface[] = [
  {
    id: 'cb1', name: 'Student Power Breakfast', description: 'Perfect heavy breakfast before morning lectures.',
    items: [{ menuItemId: 'm1', name: 'Masala Dosa', quantity: 1, originalPrice: 80 }, { menuItemId: 'm2', name: 'Filter Coffee', quantity: 1, originalPrice: 30 }, { menuItemId: 'm3', name: 'Idli (2pcs)', quantity: 1, originalPrice: 40 }],
    originalTotal: 150, comboPrice: 120, savingsPercentage: 20, isActive: true, isFeatured: true, isTrending: true
  },
  {
    id: 'cb2', name: 'Exam Night Fuel', description: 'Heavy caffeine and quick carbs for late night studying.',
    items: [{ menuItemId: 'm4', name: 'Cold Coffee Thick', quantity: 2, originalPrice: 180 }, { menuItemId: 'm5', name: 'Veg Grilled Sandwich', quantity: 1, originalPrice: 100 }],
    originalTotal: 280, comboPrice: 220, savingsPercentage: 21, isActive: true, isFeatured: false, isTrending: true
  }
];

export default function ComboManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboInterface | null>(null);
  const [comboToDelete, setComboToDelete] = useState<ComboInterface | null>(null);

  const { data: realResponse, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['combos'],
    queryFn: combosApi.getAll,
    retry: 1
  });

  const usingMocks = isError || !realResponse?.items;
  // Fallback map since backend combo list returns { items: [], total: x }
  const combos = usingMocks ? MOCK_COMBOS : realResponse.items;

  const activeCombos = combos.filter((c: ComboInterface) => c.isActive).length;
  const avgSavings = Math.round(combos.reduce((acc: number, c: ComboInterface) => acc + c.savingsPercentage, 0) / (combos.length || 1));

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
      if (usingMocks) {
        toast.success(`Mock: Deleted ${comboToDelete.name}`);
        setComboToDelete(null);
        return;
      }
      await deleteMutation.mutateAsync(comboToDelete.id);
      setComboToDelete(null);
    }
  };

  const handleSave = async (newCombo: any) => {
    if (usingMocks) {
      toast.success(`Mock: Saved ${newCombo.name}`);
      setIsDialogOpen(false);
      return;
    }
    await saveMutation.mutateAsync(newCombo);
  };

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

      {usingMocks && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mb-6 text-sm text-amber-800">
          <strong>Backend Offline:</strong> Displaying mock combo data. Changes will not be persisted.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Active Combos" value={activeCombos} icon={<Layers />} trend={{ value: 2, label: 'this month', isPositive: true }} />
        <MetricCard title="Average Savings" value={`${avgSavings}%`} icon={<Percent />} />
        <MetricCard title="Trending Combos" value={combos.filter((c: ComboInterface) => c.isTrending).length} icon={<Flame />} />
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Loading combos...</div>
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
