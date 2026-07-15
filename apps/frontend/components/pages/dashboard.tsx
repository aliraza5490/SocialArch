'use client';

import { Video, FileText, TrendingUp, Zap } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';

function Dashboard() {
  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your content creation progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Videos Generated"
            value="124"
            change="+12% from last month"
            changeType="positive"
            icon={<Video className="h-6 w-6 text-primary" />}
          />
          <StatCard
            title="Social Posts"
            value="856"
            change="+23% from last month"
            changeType="positive"
            icon={<FileText className="h-6 w-6 text-primary" />}
          />
          <StatCard
            title="Engagement Rate"
            value="4.8%"
            change="+0.5% from last month"
            changeType="positive"
            icon={<TrendingUp className="h-6 w-6 text-primary" />}
          />
          <StatCard
            title="AI Credits Used"
            value="2,340"
            change="560 remaining"
            changeType="neutral"
            icon={<Zap className="h-6 w-6 text-primary" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityChart title="Content Generation Trend" type="area" />
          <ActivityChart title="Weekly Comparison" type="bar" />
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card animate-slide-up">
          <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-4">
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
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.item}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}

export default Dashboard;
