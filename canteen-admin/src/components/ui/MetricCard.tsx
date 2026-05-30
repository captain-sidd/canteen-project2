import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  className?: string;
}

export function MetricCard({ title, value, icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
            {icon}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h2>
          {trend && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className={cn(
                "flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md",
                trend.isNeutral ? "text-slate-600 bg-slate-100" :
                trend.isPositive ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
              )}>
                {trend.isNeutral ? <Minus className="w-3 h-3 mr-1" /> :
                 trend.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
