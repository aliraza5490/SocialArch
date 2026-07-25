'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  progress?: number; // 0-100 percentage
  creditStatus?: 'healthy' | 'warning' | 'critical';
  icon: ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  progress,
  creditStatus = 'healthy',
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in flex flex-col justify-between',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 pr-2">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {change && (
            <div className="pt-0.5">
              {changeType === 'neutral' ? (
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border',
                    creditStatus === 'healthy' &&
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                    creditStatus === 'warning' &&
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                    creditStatus === 'critical' &&
                      'bg-destructive/10 text-destructive border-destructive/20',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full mr-1.5 animate-pulse',
                      creditStatus === 'healthy' && 'bg-emerald-500',
                      creditStatus === 'warning' && 'bg-amber-500',
                      creditStatus === 'critical' && 'bg-destructive',
                    )}
                  />
                  {change}
                </span>
              ) : (
                <p
                  className={cn(
                    'text-xs font-medium',
                    changeType === 'positive' && 'text-emerald-500',
                    changeType === 'negative' && 'text-destructive',
                  )}
                >
                  {change}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      {typeof progress === 'number' && (
        <div className="mt-2.5 space-y-1">
          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium">
            <span>Usage</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted/80 rounded-full overflow-hidden p-0.5 border border-border/40">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 shadow-xs',
                creditStatus === 'healthy' && 'bg-primary',
                creditStatus === 'warning' && 'bg-amber-500',
                creditStatus === 'critical' && 'bg-destructive',
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
