import React from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable } from '@/components/ui/DataTable';
import { IndianRupee, ShoppingCart, Users, TrendingUp } from 'lucide-react';

const mockRecentOrders = [
  { id: '#ORD-001', customer: 'Siddhesh', items: 3, total: '₹450', status: 'pending', time: '2 mins ago' },
  { id: '#ORD-002', customer: 'Rahul', items: 1, total: '₹120', status: 'success', time: '15 mins ago' },
  { id: '#ORD-003', customer: 'Neha', items: 2, total: '₹280', status: 'warning', time: '1 hour ago' },
  { id: '#ORD-004', customer: 'Pooja', items: 5, total: '₹890', status: 'success', time: '2 hours ago' },
];

const columns = [
  { header: 'Order ID', accessorKey: 'id', cell: (row: any) => <span className="font-medium">{row.id}</span> },
  { header: 'Customer', accessorKey: 'customer' },
  { header: 'Items', accessorKey: 'items' },
  { header: 'Total', accessorKey: 'total', cell: (row: any) => <span className="font-semibold">{row.total}</span> },
  { header: 'Time', accessorKey: 'time', cell: (row: any) => <span className="text-muted-foreground">{row.time}</span> },
  { 
    header: 'Status', 
    accessorKey: 'status',
    cell: (row: any) => <StatusBadge status={row.status}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</StatusBadge>
  },
];

export default function Dashboard() {
  return (
    <PageContainer>
      <SectionHeader 
        title="Dashboard Overview" 
        description="Monitor your canteen's live performance and metrics."
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Today's Revenue" 
          value="₹12,450" 
          description="+15% from yesterday"
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <DashboardCard 
          title="Total Orders" 
          value="142" 
          description="32 pending preparation"
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <DashboardCard 
          title="Active Users" 
          value="1,240" 
          description="+12 new today"
          icon={<Users className="h-4 w-4" />}
        />
        <DashboardCard 
          title="Conversion Rate" 
          value="68.2%" 
          description="View analytics details"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7 mt-4">
        <div className="md:col-span-4 lg:col-span-5 space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">Recent Orders</h3>
          <DataTable columns={columns} data={mockRecentOrders} searchPlaceholder="Search orders..." />
        </div>
        <div className="md:col-span-3 lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">Low Stock Alerts</h3>
          <div className="bg-white rounded-md border p-4 space-y-4">
            {[
              { name: 'Coca Cola Can', stock: 12 },
              { name: 'Veg Burger Patty', stock: 8 },
              { name: 'French Fries (1kg)', stock: 3 },
            ].map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-destructive font-bold">{item.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
