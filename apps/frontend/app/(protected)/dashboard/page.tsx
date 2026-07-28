import type { Metadata } from 'next';
import { Video, FileText, TrendingUp, Zap } from 'lucide-react';
import { StatCard } from './components/StatCard';
import { ActivityChart } from './components/ActivityChart';

export const metadata: Metadata = {
  title: 'Dashboard | SocialArch',
  description: 'Track your content creation progress and social analytics',
};

export default function DashboardPage() {
  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Track your content creation progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Videos Generated"
          value="124"
          change="+12% from last month"
          changeType="positive"
          icon={<Video className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Social Posts"
          value="856"
          change="+23% from last month"
          changeType="positive"
          icon={<FileText className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Engagement Rate"
          value="4.8%"
          change="+0.5% from last month"
          changeType="positive"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="AI Credits Used"
          value="2,340"
          change="560 remaining"
          changeType="neutral"
          progress={80.7}
          creditStatus="healthy"
          icon={<Zap className="h-4 w-4 text-primary" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <ActivityChart title="Content Generation Trend" type="area" />
        <ActivityChart title="Weekly Comparison" type="bar" />
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-card animate-slide-up">
        <h3 className="font-semibold text-base mb-2.5">Recent Activity</h3>
        <div className="space-y-1">
          {[
            {
              action: 'Generated video',
              item: 'Product Demo v2',
              time: '2 hours ago',
            },
            {
              action: 'Created post',
              item: 'Instagram carousel',
              time: '4 hours ago',
            },
            {
              action: 'Uploaded asset',
              item: 'brand-logo.png',
              time: 'Yesterday',
            },
            {
              action: 'Generated video',
              item: 'Tutorial Series #5',
              time: '2 days ago',
            },
          ].map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <div>
                  <p className="text-xs font-medium">{activity.action}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {activity.item}
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

