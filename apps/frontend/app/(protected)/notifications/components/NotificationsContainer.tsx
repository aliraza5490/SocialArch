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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export function NotificationsContainer() {
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
    <div className="space-y-3.5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Stay updated with your content and account activity
          </p>
        </div>
        <div className="flex gap-1.5">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="h-8 text-xs px-2.5" onClick={markAllAsRead}>
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}

          {/* Desktop buttons */}
          <div className="hidden md:flex gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-xs px-2.5" onClick={clearAll}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear all
            </Button>
            <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs px-2.5">
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Preferences
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md p-4 sm:p-5">
                <DialogHeader className="p-0 mb-3">
                  <DialogTitle className="text-base font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    Notification Preferences
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Configure your notification settings and preferences.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">Content Updates</p>
                      <p className="text-[11px] text-muted-foreground">
                        Get notified when your content is ready
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">Account Activity</p>
                      <p className="text-[11px] text-muted-foreground">
                        Updates about your account and billing
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">System Updates</p>
                      <p className="text-[11px] text-muted-foreground">
                        New features and platform announcements
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">Marketing</p>
                      <p className="text-[11px] text-muted-foreground">
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
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={clearAll} className="text-xs">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Clear all
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPreferencesOpen(true)} className="text-xs">
                  <Settings className="h-3.5 w-3.5 mr-2" />
                  Preferences
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            activeTab === 'all'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors relative',
            activeTab === 'unread'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Unread
          {unreadCount > 0 && (
            <span className="ml-1.5 h-4 px-1.5 text-[10px] font-semibold gradient-primary text-primary-foreground rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No notifications</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const IconComponent = iconMap[notification.icon];
            return (
              <Card
                key={notification.id}
                className={cn(
                  'transition-all hover:shadow-card-hover cursor-pointer group p-3 py-2.5',
                  !notification.read && 'border-primary/30 bg-primary/5',
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'h-7 w-7 rounded-md flex items-center justify-center shrink-0 mt-0.5',
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
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">{notification.title}</p>
                        {!notification.read && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
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
                        className="h-6 w-6 text-destructive hover:text-destructive"
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
  );
}
