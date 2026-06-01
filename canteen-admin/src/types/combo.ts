export interface ComboItemInterface {
  menuItemId: string;
  name: string;
  quantity: number;
  originalPrice: number;
}

export interface ComboInterface {
  id: string;
  name: string;
  description: string;
  items: ComboItemInterface[];
  originalTotal: number;
  comboPrice: number;
  savingsPercentage: number;
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isSpecial?: boolean;
  imageUrl?: string;
}
