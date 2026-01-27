'use client';

import { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Sparkles,
  Video,
  FileText,
  AlertCircle,
  Info,
  MoreHorizontal,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'content';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: 'sparkles' | 'video' | 'file' | 'alert' | 'info';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'content',
    title: 'Content Generated',
    message: "Your Instagram post about 'Summer Collection' is ready!",
    timestamp: new Date(),
    read: false,
    icon: 'sparkles',
  },
  {
    id: '2',
    type: 'success',
    title: 'Video Exported',
    message: 'Your promotional video has been successfully exported.',
    timestamp: new Date(Date.now() - 3600000),
    read: false,
    icon: 'video',
  },
  {
    id: '3',
    type: 'info',
    title: 'New Feature Available',
    message: 'Try our new AI-powered hashtag generator for better reach!',
    timestamp: new Date(Date.now() - 7200000),
    read: true,
    icon: 'info',
  },
  {
    id: '4',
    type: 'warning',
    title: 'Credit Running Low',
    message: 'You have 50 credits remaining. Consider upgrading your plan.',
    timestamp: new Date(Date.now() - 86400000),
    read: true,
    icon: 'alert',
  },
  {
    id: '5',
    type: 'content',
    title: 'Batch Content Ready',
    message: '15 social media posts have been generated for your campaign.',
    timestamp: new Date(Date.now() - 172800000),
    read: true,
    icon: 'file',
  },
];

const iconMap = {
  sparkles: Sparkles,
  video: Video,
  file: FileText,
  alert: AlertCircle,
  info: Info,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Notifications
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Stay updated with your content and account activity
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}

            {/* Desktop buttons */}
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="sm" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
              <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Notification Preferences
                    </DialogTitle>
                    <DialogDescription>
                      Configure your notification settings and preferences.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Content Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified when your content is ready
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Account Activity</p>
                        <p className="text-sm text-muted-foreground">
                          Updates about your account and billing
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Updates</p>
                        <p className="text-sm text-muted-foreground">
                          New features and platform announcements
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing</p>
                        <p className="text-sm text-muted-foreground">
                          Promotional content and tips
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Mobile dropdown menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={clearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear all
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPreferencesOpen(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors relative',
              activeTab === 'unread'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 h-5 px-1.5 text-xs gradient-primary text-primary-foreground rounded-full flex items-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = iconMap[notification.icon];
              return (
                <Card
                  key={notification.id}
                  className={cn(
                    'transition-all hover:shadow-card-hover cursor-pointer group',
                    !notification.read && 'border-primary/30 bg-primary/5',
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                          notification.type === 'success' &&
                            'bg-green-500/10 text-green-500',
                          notification.type === 'info' &&
                            'bg-blue-500/10 text-blue-500',
                          notification.type === 'warning' &&
                            'bg-yellow-500/10 text-yellow-500',
                          notification.type === 'content' &&
                            'gradient-primary text-primary-foreground shadow-glow',
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{notification.title}</p>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
