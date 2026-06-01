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
import type { MenuItemInterface } from '@/types/menu';
import { Input } from '@/components/ui/input';

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItemInterface | null;
  onSave: (item: Partial<MenuItemInterface> & { id?: string }) => void;
}

export function MenuItemDialog({ isOpen, onClose, item, onSave }: MenuItemDialogProps) {
  const [name, setName] = React.useState(item?.name || '');
  const [description, setDescription] = React.useState(item?.description || '');
  const [categoryName, setCategoryName] = React.useState(item?.categoryName || item?.categoryId || 'Uncategorized');
  const [imageUrl, setImageUrl] = React.useState(item?.imageUrl || '');
  const [price, setPrice] = React.useState(item?.price || 0);
  const [offerPrice, setOfferPrice] = React.useState<number | undefined>(item?.offerPrice);
  const [stockQuantity, setStockQuantity] = React.useState(item?.stockQuantity || 0);
  const [prepTimeMins, setPrepTimeMins] = React.useState(item?.prepTimeMins || 0);
  const [dietType, setDietType] = React.useState<'veg' | 'non-veg' | 'vegan'>(item?.dietType || 'veg');
  const [inStock, setInStock] = React.useState(item?.inStock ?? true);
  const [isTrending, setIsTrending] = React.useState(item?.isTrending || false);
  const [isFeatured, setIsFeatured] = React.useState(item?.isFeatured || false);
  const [isSpecial, setIsSpecial] = React.useState(item?.isSpecial || false);

  React.useEffect(() => {
    setName(item?.name || '');
    setDescription(item?.description || '');
    setCategoryName(item?.categoryName || item?.categoryId || 'Uncategorized');
    setImageUrl(item?.imageUrl || '');
    setPrice(item?.price || 0);
    setOfferPrice(item?.offerPrice);
    setStockQuantity(item?.stockQuantity || 0);
    setPrepTimeMins(item?.prepTimeMins || 0);
    setDietType(item?.dietType || 'veg');
    setInStock(item?.inStock ?? true);
    setIsTrending(item?.isTrending || false);
    setIsFeatured(item?.isFeatured || false);
    setIsSpecial(item?.isSpecial || false);
  }, [item]);

  const handleSave = () => {
    onSave({
      id: item?.id,
      name: name.trim() || item?.name || 'New Item',
      description: description.trim(),
      categoryId: item?.categoryId || categoryName.trim() || 'uncategorized',
      categoryName: categoryName.trim() || item?.categoryName || item?.categoryId || 'Uncategorized',
      imageUrl: imageUrl.trim() || undefined,
      price: Number(price),
      offerPrice: offerPrice == null ? undefined : Number(offerPrice),
      dietType,
      inStock,
      stockQuantity: Number(stockQuantity),
      prepTimeMins: Number(prepTimeMins),
      rating: item?.rating ?? 0,
      isTrending,
      isFeatured,
      isSpecial,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl flex flex-col">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
          <DialogDescription>
            Configure item details, pricing, and availability.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-bold text-slate-700">Item Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Masala Dosa" />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description" />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-bold text-slate-700">Category</label>
            <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g. Main Course" />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-bold text-slate-700">Image URL</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Price (₹)</label>
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="100" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Offer Price (₹)</label>
            <Input
              type="number"
              value={offerPrice ?? ''}
              onChange={(e) => setOfferPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Stock Quantity</label>
            <Input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} placeholder="50" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Prep Time (mins)</label>
            <Input type="number" value={prepTimeMins} onChange={(e) => setPrepTimeMins(Number(e.target.value))} placeholder="15" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Diet Type</label>
            <select
              value={dietType}
              className="w-full rounded-md border border-slate-200 p-2"
              onChange={(e) => setDietType(e.target.value as 'veg' | 'non-veg' | 'vegan')}
            >
              <option value="veg">veg</option>
              <option value="non-veg">non-veg</option>
              <option value="vegan">vegan</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Available</label>
            <select
              value={inStock ? 'true' : 'false'}
              className="w-full rounded-md border border-slate-200 p-2"
              onChange={(e) => setInStock(e.target.value === 'true')}
            >
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
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

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Special</label>
            <select
              value={isSpecial ? 'true' : 'false'}
              className="w-full rounded-md border border-slate-200 p-2"
              onChange={(e) => setIsSpecial(e.target.value === 'true')}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || Number(price) <= 0 || !categoryName.trim()}>
            Save Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
