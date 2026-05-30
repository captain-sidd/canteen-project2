import React, { useEffect, useState } from 'react';
import type { OrderInterface, OrderStatus } from '@/types/order';
import { formatCurrency, formatElapsedTime, getOrderPriority } from '@/utils/orderUtils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Clock, IndianRupee, MapPin, ReceiptText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: OrderInterface;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onViewDetails: (order: OrderInterface) => void;
}

export const OrderCard = React.memo(({ order, onStatusChange, onViewDetails }: OrderCardProps) => {
  // Local timer to force re-render every minute for elapsed time
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  const priority = getOrderPriority(order.createdAt, order.status);
  
  const priorityStyles = {
    normal: 'border-l-4 border-l-transparent',
    warning: 'border-l-4 border-l-warning bg-warning/5',
    danger: 'border-l-4 border-l-destructive bg-destructive/5'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn("overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow", priorityStyles[priority])}>
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">#{order.orderNumber}</span>
              {order.orderType === 'takeaway' && <StatusBadge status="default">Takeaway</StatusBadge>}
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-1">{order.customerName}</p>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className={cn(
              "flex items-center gap-1.5 text-sm font-semibold px-2 py-1 rounded-md",
              priority === 'danger' ? 'text-destructive bg-destructive/10' : 
              priority === 'warning' ? 'text-warning bg-warning/10' : 
              'text-muted-foreground bg-slate-100'
            )}>
              <Clock className="w-3.5 h-3.5" />
              {formatElapsedTime(order.createdAt)}
            </div>
            {priority === 'danger' && <span className="text-[10px] font-bold text-destructive uppercase">Delayed</span>}
          </div>
        </CardHeader>

        <CardContent className="p-4 py-2 flex-1">
          <ul className="space-y-2">
            {order.items.map(item => (
              <li key={item.id} className="flex justify-between items-start text-sm">
                <div className="flex gap-2">
                  <span className="font-semibold">{item.quantity}x</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{item.name}</span>
                    {item.specialInstructions && (
                      <span className="text-xs text-destructive mt-0.5">Note: {item.specialInstructions}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="p-4 pt-3 border-t bg-slate-50 flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <IndianRupee className="w-4 h-4" />
              {order.totalAmount}
              <StatusBadge status={order.paymentStatus === 'paid' ? 'success' : 'warning'} className="ml-1 scale-90 origin-left">
                {order.paymentStatus}
              </StatusBadge>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full pt-1">
            {order.status === 'pending' && (
              <>
                <Button variant="outline" className="flex-1" onClick={() => onStatusChange(order.id, 'cancelled')}>Reject</Button>
                <Button className="flex-1" onClick={() => onStatusChange(order.id, 'preparing')}>Accept</Button>
              </>
            )}
            
            {order.status === 'preparing' && (
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => onStatusChange(order.id, 'ready')}>
                Mark Ready
              </Button>
            )}

            {order.status === 'ready' && (
              <>
                <Button variant="outline" size="icon" onClick={() => onViewDetails(order)}><ReceiptText className="w-4 h-4" /></Button>
                <Button className="flex-1 bg-success hover:bg-success/90" onClick={() => onStatusChange(order.id, 'completed')}>
                  Mark Delivered
                </Button>
              </>
            )}

            {(order.status === 'completed' || order.status === 'cancelled') && (
              <Button variant="outline" className="w-full" onClick={() => onViewDetails(order)}>
                View Details
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});
