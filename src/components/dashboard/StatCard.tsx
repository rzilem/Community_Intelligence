
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valueClassName?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  valueClassName,
  loading = false,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
            {description && <div className="h-3 bg-muted rounded w-3/4"></div>}
          </div>
        ) : (
          <>
            <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardContent>
      {trend && !loading && (
        <CardFooter className="p-2 pt-0">
          <div
            className={cn(
              "inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium",
              trend.isPositive
                ? "text-green-600 bg-green-50"
                : "text-red-600 bg-red-50"
            )}
          >
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default StatCard;
