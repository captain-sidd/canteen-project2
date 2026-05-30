import React from 'react';
import type { OrderInterface } from '@/types/order';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatElapsedTime } from '@/utils/orderUtils';
import { IndianRupee, MapPin } from 'lucide-react';

interface OrderDetailsDrawerProps {
  order: OrderInterface | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsDrawer({ order, isOpen, onClose }: OrderDetailsDrawerProps) {
  if (!order) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b pb-4 mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">#{order.orderNumber}</SheetTitle>
            <StatusBadge status={order.status}>{order.status.toUpperCase()}</StatusBadge>
          </div>
          <p className="text-sm text-muted-foreground">Placed {formatElapsedTime(order.createdAt)} ago</p>
        </SheetHeader>

        <div className="space-y-6">
          {/* Customer Details */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Customer</h3>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="font-semibold text-slate-800">{order.customerName}</p>
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                <MapPin className="w-4 h-4" />
                {order.orderType === 'takeaway' ? 'Takeaway Pickup' : 'Dine-in'}
              </div>
            </div>
          </section>

          {/* Items */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Order Items</h3>
            <ul className="space-y-3 bg-slate-50 rounded-lg p-3">
              {order.items.map(item => (
                <li key={item.id} className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <span className="font-bold text-slate-700">{item.quantity}x</span>
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      {item.specialInstructions && (
                        <p className="text-xs text-destructive mt-0.5">Note: {item.specialInstructions}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-medium text-slate-700">₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Payment Details */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Payment</h3>
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Method</span>
                <span className="font-medium uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Status</span>
                <StatusBadge status={order.paymentStatus === 'paid' ? 'success' : 'failed'}>{order.paymentStatus}</StatusBadge>
              </div>
              <div className="pt-2 mt-2 border-t flex justify-between items-center">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-lg text-slate-900 flex items-center">
                  <IndianRupee className="w-4 h-4" />
                  {order.totalAmount}
                </span>
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
