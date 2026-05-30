import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, parseApiError } from '@/api';
import type { OrderInterface, OrderStatus } from '@/types/order';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';

// Keep the mock array exactly as is to ensure demo functions if backend fails
const MOCK_ORDERS: OrderInterface[] = [
  { id: 'ORD-001', orderNumber: '101', customerName: 'Siddhesh M.', items: [{ id: '1', name: 'Masala Dosa', price: 80, quantity: 2 }], totalAmount: 160, orderType: 'dine_in', paymentMethod: 'upi', paymentStatus: 'paid', status: 'pending', createdAt: new Date(Date.now() - 5 * 60000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ORD-002', orderNumber: '102', customerName: 'Rahul K.', items: [{ id: '2', name: 'Veg Burger Combo', price: 120, quantity: 1 }], totalAmount: 120, orderType: 'takeaway', paymentMethod: 'wallet', paymentStatus: 'paid', status: 'preparing', createdAt: new Date(Date.now() - 15 * 60000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ORD-003', orderNumber: '103', customerName: 'Neha J.', items: [{ id: '3', name: 'Cold Coffee', price: 60, quantity: 3 }], totalAmount: 180, orderType: 'dine_in', paymentMethod: 'cash', paymentStatus: 'pending', status: 'ready', createdAt: new Date(Date.now() - 25 * 60000).toISOString(), updatedAt: new Date().toISOString() },
];

export function useOrders() {
  const queryClient = useQueryClient();
  const [usingMocks, setUsingMocks] = useState(false);

  const { data: realOrders, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['live-orders'],
    queryFn: ordersApi.getAll,
    refetchInterval: 10000, // Poll every 10 seconds
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 2,
    meta: {
      errorMessage: "Failed to fetch live orders"
    }
  });

  useEffect(() => {
    if (isError) {
      if (!usingMocks) {
        toast.error('Live Sync Failed', { description: 'Falling back to offline mock data.' });
        setUsingMocks(true);
      }
    } else if (realOrders && usingMocks) {
      setUsingMocks(false);
      toast.success('Live Sync Restored', { description: 'Connected to backend.' });
    }
  }, [isError, realOrders, usingMocks]);

  const rawOrders = usingMocks || !realOrders ? MOCK_ORDERS : realOrders;

  const updateStatusMutation = useMutation({
    mutationFn: ordersApi.updateStatus,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['live-orders'] });
      const previousOrders = queryClient.getQueryData<OrderInterface[]>(['live-orders']);
      if (previousOrders) {
        queryClient.setQueryData<OrderInterface[]>(['live-orders'], old => 
          old?.map(order => order.id === id ? { ...order, status: status as OrderStatus } : order)
        );
      }
      return { previousOrders };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['live-orders'], context?.previousOrders);
      toast.error('Update Failed', { description: parseApiError(err) });
    },
    onSuccess: (data) => {
      toast.success('Order Updated', { description: `Order ${data.id} is now ${data.status}` });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['live-orders'] });
    }
  });

  const [mockStateOrders, setMockStateOrders] = useState<OrderInterface[]>([]);
  useEffect(() => { setMockStateOrders(rawOrders); }, [rawOrders]);

  const activeOrders = usingMocks ? mockStateOrders : rawOrders;

  const getOrdersByStatus = (status: OrderStatus) => {
    return activeOrders.filter(order => order.status === status);
  };

  const changeOrderStatus = async (id: string, newStatus: OrderStatus) => {
    if (usingMocks) {
      setMockStateOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast.success(`Mock Updated: Order ${id} is now ${newStatus}`);
      return;
    }
    await updateStatusMutation.mutateAsync({ id, status: newStatus });
  };

  const stats = useMemo(() => {
    return {
      pending: getOrdersByStatus('pending').length,
      preparing: getOrdersByStatus('preparing').length,
      ready: getOrdersByStatus('ready').length,
      completed: getOrdersByStatus('completed').length,
      cancelled: getOrdersByStatus('cancelled').length,
    };
  }, [activeOrders]);

  return {
    orders: activeOrders,
    getOrdersByStatus,
    changeOrderStatus,
    stats,
    isLoading: isLoading && !usingMocks,
    isSyncing: isFetching,
    usingMocks,
    refreshOrders: refetch,
  };
}
