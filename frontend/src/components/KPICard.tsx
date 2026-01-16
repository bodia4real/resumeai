import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
}: KPICardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-6 shadow-card card-interactive group',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight transition-colors group-hover:text-primary">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full',
                trend.isPositive
                  ? 'text-success bg-success/10'
                  : 'text-destructive bg-destructive/10'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className={cn(
          'rounded-xl p-3 transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg',
          iconBgColor
        )}>
          <Icon className={cn('h-6 w-6 transition-colors', iconColor)} />
        </div>
      </div>
    </div>
  );
}
