import React from 'react';
import type { OrderInterface } from '@/types/order';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { IndianRupee, Printer, Check, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatElapsedTime } from '@/utils/orderUtils';

interface VerifiedOrderCardProps {
  order: OrderInterface;
  onMarkDelivered: () => void;
  canMarkDelivered: boolean;
}

export function VerifiedOrderCard({ order, onMarkDelivered, canMarkDelivered }: VerifiedOrderCardProps) {
  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col h-full">
      <CardHeader className="p-5 bg-slate-50 border-b flex flex-row items-start justify-between space-y-0">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800">#{order.orderNumber}</h2>
          <div className="flex items-center gap-2 mt-1 text-slate-600">
            <User className="w-4 h-4" />
            <span className="font-medium">{order.customerName}</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <StatusBadge status={order.orderType === 'takeaway' ? 'warning' : 'default'}>
            {order.orderType === 'takeaway' ? 'Takeaway' : 'Dine-in'}
          </StatusBadge>
          <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5" />
            Placed {formatElapsedTime(order.createdAt)} ago
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="p-5 flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Items</h3>
          <ul className="space-y-3">
            {order.items.map(item => (
              <li key={item.id} className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.quantity}x
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    {item.specialInstructions && (
                      <p className="text-xs text-destructive mt-0.5 font-medium">Note: {item.specialInstructions}</p>
                    )}
                  </div>
                </div>
                <span className="font-semibold text-slate-600">₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 bg-slate-50 border-t space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Payment Status</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase text-slate-500">{order.paymentMethod}</span>
              <StatusBadge status={order.paymentStatus === 'paid' ? 'success' : 'failed'}>
                {order.paymentStatus}
              </StatusBadge>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t pt-3 border-slate-200">
            <span className="text-lg font-bold text-slate-800">Total Amount</span>
            <span className="text-2xl font-black text-slate-900 flex items-center">
              <IndianRupee className="w-5 h-5" />
              {order.totalAmount}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" className="flex-1 border-slate-300">
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            {canMarkDelivered && (
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                onClick={onMarkDelivered}
              >
                <Check className="w-4 h-4 mr-2" />
                Hand Over Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
