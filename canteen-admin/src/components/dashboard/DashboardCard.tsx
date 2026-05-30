import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  icon?: React.ReactNode;
  value?: string | number;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardCard({
  title,
  icon,
  value,
  description,
  children,
  className,
  contentClassName,
}: DashboardCardProps) {
  return (
    <Card className={cn("shadow-sm transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className={contentClassName}>
        {value !== undefined && <div className="text-2xl font-bold">{value}</div>}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {children}
      </CardContent>
    </Card>
  );
}
