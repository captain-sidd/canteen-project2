import { apiClient } from './client';
import { AxiosError } from 'axios';
import type { OrderInterface } from '@/types/order';
import type { MenuItemInterface } from '@/types/menu';
import type { TransactionInterface } from '@/types/wallet';
import type { UserInterface } from '@/types/user';
import type { InventoryItemInterface, PaginatedInventoryResponse } from '@/types/inventory';

// Centralized API Error Parser
export const parseApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response) {
      // Backend returned an error response
      return error.response.data?.detail || error.response.data?.message || 'Server error occurred.';
    } else if (error.request) {
      // Request was made but no response received
      return 'No response from server. Please check your connection.';
    }
  }
  return 'An unexpected error occurred.';
};

const mapOrder = (backendOrder: any): OrderInterface => ({
  id: backendOrder.id,
  orderNumber: backendOrder.order_number || backendOrder.id.slice(-4).toUpperCase(),
  customerName: backendOrder.customer_name || (backendOrder.user_id ? `User ${backendOrder.user_id.slice(-6)}` : 'Unknown customer'),
  items: backendOrder.items?.map((i: any) => ({
    id: i.menu_item_id,
    name: i.name,
    quantity: i.quantity,
    price: i.price,
  })) || [],
  totalAmount: backendOrder.total_amount,
  paymentMethod: backendOrder.payment_method,
  paymentStatus: backendOrder.payment_status === 'completed' ? 'paid' : backendOrder.payment_status,
  orderType: backendOrder.order_type,
  status: backendOrder.order_status || backendOrder.status || 'pending',
  createdAt: backendOrder.created_at,
  updatedAt: backendOrder.updated_at,
});

const mapMenuItem = (item: any): MenuItemInterface => ({
  id: item.id,
  name: item.name,
  categoryId: item.category || 'uncategorized',
  categoryName: item.category || 'Uncategorized',
  price: item.price,
  offerPrice: item.discount_price ?? undefined,
  dietType: item.is_veg ? 'veg' as const : 'non-veg' as const,
  inStock: item.is_available ?? true,
  stockQuantity: item.stock_quantity ?? 0,
  prepTimeMins: item.preparation_time ?? 0,
  rating: item.rating ?? 0,
  isTrending: item.is_trending ?? false,
  isFeatured: item.is_featured ?? false,
  imageUrl: item.image_url ?? undefined,
});

const normalizeMenuPayload = (payload: any) => ({
  name: payload.name,
  description: payload.description ?? payload.name,
  price: payload.price,
  category: payload.categoryName || payload.categoryId || 'Uncategorized',
  image_url: payload.imageUrl,
  discount_price: payload.offerPrice,
  is_available: payload.inStock,
  is_veg: payload.dietType === 'veg',
  is_featured: payload.isFeatured,
  is_trending: payload.isTrending,
  preparation_time: payload.prepTimeMins,
  stock_quantity: payload.stockQuantity,
});

const mapCombo = (combo: any) => ({
  id: combo.id,
  name: combo.name,
  description: combo.description ?? '',
  items: (combo.items || []).map((item: any) => {
    const menuItemId = String(item.menu_item_id ?? item.menuItemId ?? item.menu_item_id ?? '');
    return {
      menuItemId,
      name: item.name ?? item.menu_item_name ?? '',
      quantity: Number(item.quantity ?? 1),
      originalPrice: item.original_price ?? item.originalPrice ?? 0,
    };
  }),
  originalTotal: combo.original_price ?? combo.originalTotal ?? 0,
  comboPrice: combo.combo_price ?? combo.comboPrice ?? 0,
  savingsPercentage: combo.discount_percentage ?? combo.savingsPercentage ?? 0,
  isActive: combo.is_available ?? combo.isActive ?? true,
  isFeatured: combo.is_featured ?? combo.isFeatured ?? false,
  isTrending: combo.is_trending ?? combo.isTrending ?? false,
  imageUrl: combo.image_url ?? combo.imageUrl ?? undefined,
});

const normalizeComboPayload = (payload: any) => ({
  name: payload.name,
  description: payload.description,
  items: (payload.items || []).map((item: any) => ({
    menu_item_id: item.menuItemId,
    quantity: item.quantity,
  })),
  combo_price: payload.comboPrice,
  original_price: payload.originalTotal,
  discount_percentage: payload.savingsPercentage,
  image_url: payload.imageUrl,
  is_available: payload.isActive,
  is_featured: payload.isFeatured,
  is_trending: payload.isTrending,
});

const mapWalletTransaction = (txn: any, currentUserName: string = 'You'): TransactionInterface => ({
  id: txn.id,
  userId: txn.user_id,
  userName: currentUserName,
  amount: txn.amount,
  type: txn.type,
  method: txn.reference_id || txn.payment_method || 'wallet',
  status: txn.status,
  description: txn.description,
  timestamp: txn.created_at,
  referenceId: txn.reference_id || txn.transaction_id,
});

export const authApi = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },
};

export const ordersApi = {
  getAll: async (): Promise<OrderInterface[]> => {
    const { data } = await apiClient.get('/orders/all');
    return data.map(mapOrder);
  },
  getById: async (id: string): Promise<OrderInterface> => {
    const { data } = await apiClient.get(`/orders/${id}`);
    return mapOrder(data);
  },
  updateStatus: async ({ id, status }: { id: string; status: string }): Promise<OrderInterface> => {
    const { data } = await apiClient.patch(`/orders/${id}/status`, { status });
    return mapOrder(data);
  },
};

export const qrApi = {
  verify: async (qrData: string): Promise<{ order: OrderInterface; message: string }> => {
    const { data } = await apiClient.post('/qr/verify', { data: qrData });
    return data;
  },
};

export const menuApi = {
  getAll: async () => {
    const { data } = await apiClient.get('/menu', { params: { available_only: false } });
    return Array.isArray(data) ? data.map(mapMenuItem) : [];
  },
  create: async (payload: any) => {
    const { data } = await apiClient.post('/menu', normalizeMenuPayload(payload));
    return mapMenuItem(data);
  },
  update: async ({ id, ...payload }: any) => {
    const { data } = await apiClient.patch(`/menu/${id}`, normalizeMenuPayload(payload));
    return mapMenuItem(data);
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/menu/${id}`);
    return data;
  },
};

export const combosApi = {
  getAll: async () => {
    const { data } = await apiClient.get('/combos');
    const items = Array.isArray(data.items) ? data.items : [];
    return { ...data, items: items.map(mapCombo) };
  },
  create: async (payload: any) => {
    const { data } = await apiClient.post('/combos', normalizeComboPayload(payload));
    return mapCombo(data);
  },
  update: async ({ id, ...payload }: any) => {
    const { data } = await apiClient.patch(`/combos/${id}`, normalizeComboPayload(payload));
    return mapCombo(data);
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/combos/${id}`);
    return data;
  },
};

export const usersApi = {
  getAll: async (): Promise<UserInterface[]> => {
    const { data } = await apiClient.get('/users');
    return Array.isArray(data) ? data.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      profileImage: item.profile_image ?? item.profileImage ?? null,
      role: item.role,
      walletBalance: item.wallet_balance ?? item.walletBalance ?? 0,
      isActive: item.is_active ?? item.isActive ?? true,
      isVerified: item.is_verified ?? item.isVerified ?? false,
      lastLogin: item.last_login ?? item.lastLogin ?? null,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })) : [];
  },
};

export const walletApi = {
  getDetails: async () => {
    const { data } = await apiClient.get('/wallet');
    return {
      balance: data.balance,
      walletId: data.wallet_id,
      isWalletActive: data.is_wallet_active,
    };
  },
  getHistory: async () => {
    const { data } = await apiClient.get('/wallet/history');
    const items = Array.isArray(data.items) ? data.items : [];
    return {
      ...data,
      items: items.map((txn: any) => mapWalletTransaction(txn)),
    };
  },
};

export const inventoryApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedInventoryResponse> => {
    const { data } = await apiClient.get('/inventory', { params });
    return data;
  },
  getById: async (id: string): Promise<InventoryItemInterface> => {
    const { data } = await apiClient.get(`/inventory/${id}`);
    return data;
  },
  create: async (payload: Partial<InventoryItemInterface>): Promise<InventoryItemInterface> => {
    const { data } = await apiClient.post('/inventory', payload);
    return data;
  },
  update: async ({ id, ...payload }: Partial<InventoryItemInterface> & { id: string }): Promise<InventoryItemInterface> => {
    const { data } = await apiClient.patch(`/inventory/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/inventory/${id}`);
  },
};
