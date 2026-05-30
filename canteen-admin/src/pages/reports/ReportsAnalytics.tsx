import React from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const REVENUE_DATA = [
  { name: 'Mon', revenue: 12400 },
  { name: 'Tue', revenue: 15600 },
  { name: 'Wed', revenue: 14800 },
  { name: 'Thu', revenue: 18200 },
  { name: 'Fri', revenue: 22000 },
  { name: 'Sat', revenue: 19500 },
  { name: 'Sun', revenue: 9000 },
];

const TOP_ITEMS_DATA = [
  { name: 'Veg Burger Combo', sales: 450 },
  { name: 'Cold Coffee', sales: 380 },
  { name: 'Masala Dosa', sales: 290 },
  { name: 'Chicken Roll', sales: 250 },
  { name: 'French Fries', sales: 210 },
];

const PAYMENT_METHOD_DATA = [
  { name: 'Wallet', value: 55, color: '#f97316' }, // orange-500
  { name: 'UPI', value: 35, color: '#3b82f6' }, // blue-500
  { name: 'Cash', value: 10, color: '#10b981' }, // emerald-500
];

export default function ReportsAnalytics() {
  return (
    <PageContainer>
      <SectionHeader 
        title="Reports & Analytics" 
        description="Business intelligence, sales trends, and canteen performance."
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white">
              <CalendarIcon className="w-4 h-4 mr-2" /> Last 7 Days
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Revenue" value="₹1,11,500" icon={<DollarSign />} trend={{ value: 15.2, label: 'vs last week', isPositive: true }} />
        <MetricCard title="Total Orders" value="842" icon={<ShoppingBag />} trend={{ value: 8.5, label: 'vs last week', isPositive: true }} />
        <MetricCard title="Active Students" value="1,204" icon={<Users />} trend={{ value: 2.1, label: 'vs last month', isPositive: true }} />
        <MetricCard title="Avg Order Value" value="₹132" icon={<TrendingUp />} trend={{ value: 1.5, label: 'vs last week', isPositive: false }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white rounded-xl border p-5 shadow-sm lg:col-span-2 flex flex-col min-h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6 tracking-tight text-lg">Revenue Trend</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="bg-white rounded-xl border p-5 shadow-sm flex flex-col min-h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6 tracking-tight text-lg">Payment Methods</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PAYMENT_METHOD_DATA}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PAYMENT_METHOD_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => [`${value}%`, 'Share']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Items Bar Chart */}
        <div className="bg-white rounded-xl border p-5 shadow-sm flex flex-col min-h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6 tracking-tight text-lg">Top Selling Items</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_ITEMS_DATA} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} width={120} />
                <RechartsTooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Placeholder for future detailed analytics tables */}
        <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <TrendingUp className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Detailed Analytics Ready</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            This section is prepared for granular CSV exports, item-level drill-downs, and real-time operational data grids from the FastAPI backend.
          </p>
          <Button variant="outline" className="mt-4 bg-white">Connect Backend Data</Button>
        </div>
      </div>
    </PageContainer>
  );
}
