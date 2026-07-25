'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const weeklyData = [
  { name: 'Mon', videos: 4, posts: 12 },
  { name: 'Tue', videos: 3, posts: 8 },
  { name: 'Wed', videos: 6, posts: 15 },
  { name: 'Thu', videos: 2, posts: 10 },
  { name: 'Fri', videos: 5, posts: 18 },
  { name: 'Sat', videos: 7, posts: 22 },
  { name: 'Sun', videos: 4, posts: 14 },
];

const monthlyData = [
  { name: 'Week 1', videos: 20, posts: 65 },
  { name: 'Week 2', videos: 28, posts: 82 },
  { name: 'Week 3', videos: 35, posts: 95 },
  { name: 'Week 4', videos: 42, posts: 110 },
];

const yearlyData = [
  { name: 'Jan', videos: 80, posts: 240 },
  { name: 'Feb', videos: 95, posts: 280 },
  { name: 'Mar', videos: 110, posts: 320 },
  { name: 'Apr', videos: 125, posts: 360 },
  { name: 'May', videos: 140, posts: 400 },
  { name: 'Jun', videos: 155, posts: 440 },
  { name: 'Jul', videos: 170, posts: 480 },
  { name: 'Aug', videos: 185, posts: 520 },
  { name: 'Sep', videos: 200, posts: 560 },
  { name: 'Oct', videos: 215, posts: 600 },
  { name: 'Nov', videos: 230, posts: 640 },
  { name: 'Dec', videos: 245, posts: 680 },
];

type TimeRange = 'weekly' | 'monthly' | 'yearly';

interface ActivityChartProps {
  title: string;
  type: 'area' | 'bar';
}

export function ActivityChart({ title, type }: ActivityChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const isMobile = useIsMobile();

  const data =
    timeRange === 'weekly'
      ? weeklyData
      : timeRange === 'monthly'
        ? monthlyData
        : yearlyData;

  const timeRanges: TimeRange[] = ['weekly', 'monthly', 'yearly'];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card animate-slide-up">
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant="ghost"
                size="sm"
                onClick={() => setTimeRange(range)}
                className={cn(
                  'text-xs capitalize px-3 h-7',
                  timeRange === range &&
                    'bg-background shadow-sm text-foreground',
                )}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-[160px] sm:h-[220px] md:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 24, left: isMobile ? 24 : 30, bottom: 4 }}
            >
              <defs>
                <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="name"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={!isMobile}
                hide={isMobile}
                width={isMobile ? 0 : 20}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-card)',
                }}
              />
              <Area
                type="monotone"
                dataKey="videos"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVideos)"
              />
              <Area
                type="monotone"
                dataKey="posts"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPosts)"
              />
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: 24, left: isMobile ? 24 : 30, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="name"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={!isMobile}
                hide={isMobile}
                width={isMobile ? 0 : 20}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
                cursor={{ fill: 'var(--color-accent)' }}
              />
              <Bar
                dataKey="videos"
                fill="var(--color-chart-1)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="posts"
                fill="var(--color-chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-center gap-6 mt-0">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full shadow-xs shrink-0"
            style={{ backgroundColor: 'var(--color-chart-1)' }}
          />
          <span className="text-sm font-medium text-foreground/80">Videos</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-xs shadow-xs shrink-0 rotate-45"
            style={{ backgroundColor: 'var(--color-chart-2)' }}
          />
          <span className="text-sm font-medium text-foreground/80">Posts</span>
        </div>
      </div>
    </div>
  );
}
