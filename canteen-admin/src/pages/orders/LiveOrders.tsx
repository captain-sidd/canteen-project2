import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useOrders } from '@/hooks/useOrders';
import type { OrderStatus, OrderInterface } from '@/types/order';
import { OrderStatusTabs } from '@/components/orders/OrderStatusTabs';
import { OrderCard } from '@/components/orders/OrderCard';
import { EmptyOrdersState } from '@/components/orders/EmptyOrdersState';
import { OrderDetailsDrawer } from '@/components/orders/OrderDetailsDrawer';
import { AnimatePresence } from 'framer-motion';
import { RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LiveOrders() {
  const { getOrdersByStatus, changeOrderStatus, stats, isLoading, isSyncing, usingMocks, refreshOrders } = useOrders();
  const [activeTab, setActiveTab] = useState<OrderStatus>('pending');
  const [selectedOrder, setSelectedOrder] = useState<OrderInterface | null>(null);

  const displayedOrders = getOrdersByStatus(activeTab);

  return (
    <PageContainer className="flex flex-col h-full bg-slate-50">
      <SectionHeader 
        title="Live Orders" 
        description="Manage active kitchen operations and POS orders."
      />
      
      <div className="flex-1 flex flex-col mt-2">
        <div className="flex items-center justify-between mb-4 sticky top-4 z-30">
          <OrderStatusTabs 
            activeStatus={activeTab} 
            onChange={setActiveTab} 
            stats={stats} 
          />
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center text-xs font-bold px-2.5 py-1.5 rounded-full bg-white shadow-sm border text-slate-500">
              {usingMocks ? (
                <><span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse" /> Offline (Mock Mode)</>
              ) : (
                <><Wifi className={`w-3.5 h-3.5 mr-2 text-green-500 ${isSyncing ? 'animate-pulse' : ''}`} /> Live Sync Active</>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => refreshOrders()} disabled={isSyncing} className="bg-white">
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto mt-4 px-1 pb-10">
          {displayedOrders.length === 0 ? (
            <EmptyOrdersState status={activeTab} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max items-start">
              <AnimatePresence mode="popLayout">
                {displayedOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusChange={changeOrderStatus} 
                    onViewDetails={setSelectedOrder}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <OrderDetailsDrawer 
        order={selectedOrder} 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </PageContainer>
  );
}
