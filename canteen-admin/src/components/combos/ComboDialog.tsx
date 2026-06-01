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
import type { MenuItemInterface } from '@/types/menu';
import { Input } from '@/components/ui/input';

interface ComboDialogProps {
  isOpen: boolean;
  onClose: () => void;
  combo: ComboInterface | null;
  menuItems: MenuItemInterface[];
  isSaving?: boolean;
  onSave: (combo: any) => void;
}

export function ComboDialog({ isOpen, onClose, combo, menuItems, isSaving = false, onSave }: ComboDialogProps) {
  const [name, setName] = React.useState(combo?.name || '');
  const [description, setDescription] = React.useState(combo?.description || '');
  const [imageUrl, setImageUrl] = React.useState(combo?.imageUrl || '');
  const [comboPrice, setComboPrice] = React.useState(combo?.comboPrice || 0);
  const [isActive, setIsActive] = React.useState(combo?.isActive ?? true);
  const [isFeatured, setIsFeatured] = React.useState(combo?.isFeatured || false);
  const [isTrending, setIsTrending] = React.useState(combo?.isTrending || false);
  const [isSpecial, setIsSpecial] = React.useState(combo?.isSpecial || false);
  const [selectedMenuItemId, setSelectedMenuItemId] = React.useState('');
  const [items, setItems] = React.useState(combo?.items || []);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    setName(combo?.name || '');
    setDescription(combo?.description || '');
    setImageUrl(combo?.imageUrl || '');
    setComboPrice(combo?.comboPrice || 0);
    setIsActive(combo?.isActive ?? true);
    setIsFeatured(combo?.isFeatured || false);
    setIsTrending(combo?.isTrending || false);
    setIsSpecial(combo?.isSpecial || false);
    setItems(combo?.items || []);
  }, [combo]);

  const selectedItemIds = items.map((item) => item.menuItemId);
  const availableMenuOptions = menuItems
    .filter((item) => !selectedItemIds.includes(item.id))
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const addSelectedItem = () => {
    if (!selectedMenuItemId) return;
    const menuItem = menuItems.find((item) => item.id === selectedMenuItemId);
    if (!menuItem) return;

    setItems((current) => [
      ...current,
      {
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        originalPrice: menuItem.price,
      },
    ]);
    setSelectedMenuItemId('');
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: quantity < 1 ? 1 : quantity }
          : item
      )
    );
  };

  const removeItem = (menuItemId: string) => {
    setItems((current) => current.filter((item) => item.menuItemId !== menuItemId));
  };

  const originalTotal = items.reduce((sum, item) => sum + Number(item.originalPrice ?? 0) * Number(item.quantity ?? 1), 0);
  const savingsPercentage = originalTotal > 0 ? Math.round(((originalTotal - Number(comboPrice)) / originalTotal) * 100) : 0;

  const handleSave = () => {
    if (!name.trim() || Number(comboPrice) <= 0 || items.length === 0) {
      return;
    }

    onSave({
      id: combo?.id,
      name: name.trim(),
      description: description.trim(),
      items,
      originalTotal,
      comboPrice: Number(comboPrice),
      savingsPercentage: savingsPercentage > 0 ? savingsPercentage : 0,
      isActive,
      isFeatured,
      isTrending,
      isSpecial,
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl flex flex-col">
        <DialogHeader>
          <DialogTitle>{combo ? 'Edit Combo' : 'Create New Combo'}</DialogTitle>
          <DialogDescription>
            Group menu items together and set a discount price for the combo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Combo Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Exam Night Fuel" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Combo Price (₹)</label>
                <Input
                  type="number"
                  value={comboPrice}
                  onChange={(e) => setComboPrice(Number(e.target.value))}
                  placeholder="220"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the combo..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Image URL</label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/combo.jpg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Available</label>
                <select
                  value={isActive ? 'true' : 'false'}
                  className="w-full rounded-md border border-slate-200 p-2"
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Featured</label>
                <select
                  value={isFeatured ? 'true' : 'false'}
                  className="w-full rounded-md border border-slate-200 p-2"
                  onChange={(e) => setIsFeatured(e.target.value === 'true')}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Trending</label>
                <select
                  value={isTrending ? 'true' : 'false'}
                  className="w-full rounded-md border border-slate-200 p-2"
                  onChange={(e) => setIsTrending(e.target.value === 'true')}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Search Menu Items</label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by item name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Pick a menu item</label>
                <select
                  value={selectedMenuItemId}
                  className="w-full rounded-md border border-slate-200 p-2"
                  onChange={(e) => setSelectedMenuItemId(e.target.value)}
                >
                  <option value="">Select an item</option>
                  {availableMenuOptions.map((menuItem) => (
                    <option key={menuItem.id} value={menuItem.id}>{menuItem.name} — ₹{menuItem.price}</option>
                  ))}
                </select>
              </div>
              <Button onClick={addSelectedItem} disabled={!selectedMenuItemId}>Add Item</Button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-semibold text-slate-700">Combo Items</span>
                <span className="text-xs text-slate-500">{items.length} selected</span>
              </div>

              {items.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-sm text-slate-600">
                  Add at least one menu item to build this combo.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.menuItemId} className="grid grid-cols-1 md:grid-cols-[1fr_120px_80px] gap-3 items-center rounded-xl border p-3">
                      <div>
                        <div className="font-semibold text-slate-800">{item.name}</div>
                        <div className="text-sm text-slate-500">₹{item.originalPrice?.toFixed(2) || 0} each</div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Quantity</label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.menuItemId, Number(e.target.value))}
                          min={1}
                        />
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className="text-sm font-semibold text-slate-700">₹{((item.originalPrice ?? 0) * item.quantity).toFixed(2)}</span>
                        <Button variant="outline" size="sm" onClick={() => removeItem(item.menuItemId)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Original Total</div>
                <div className="mt-2 text-xl font-semibold">₹{originalTotal.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Combo Price</div>
                <div className="mt-2 text-xl font-semibold">₹{Number(comboPrice).toFixed(2)}</div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Savings</div>
                <div className="mt-2 text-xl font-semibold">{savingsPercentage}%</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || items.length === 0 || Number(comboPrice) <= 0 || isSaving}>
            {isSaving ? 'Saving...' : combo ? 'Update Combo' : 'Create Combo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

