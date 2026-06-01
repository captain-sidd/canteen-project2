export type DietType = 'veg' | 'non-veg' | 'vegan';

export interface MenuItemInterface {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  price: number;
  offerPrice?: number;
  dietType: DietType;
  inStock: boolean;
  stockQuantity: number;
  prepTimeMins: number;
  rating: number;
  isTrending: boolean;
  isFeatured: boolean;
  isSpecial?: boolean;
  imageUrl?: string;
}
