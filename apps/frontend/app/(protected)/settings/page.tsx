'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Lock,
  Bell,
  Link2,
  Check,
  Settings as SettingsIcon,
} from 'lucide-react';
import { FaGoogle, FaMeta, FaTiktok } from 'react-icons/fa6';
import { FaTwitter, FaLinkedin } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const integrations = [
  {
    id: 'google',
    name: 'Google',
    description:
      'Connect your Google account for YouTube and Google Drive integration',
    connected: false,
    icon: FaGoogle,
  },
  {
    id: 'meta',
    name: 'Meta',
    description: 'Connect Facebook and Instagram for content publishing',
    connected: true,
    icon: FaMeta,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Connect TikTok for video publishing and analytics',
    connected: false,
    icon: FaTiktok,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Connect X for posting and engagement tracking',
    connected: false,
    icon: FaTwitter,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Connect LinkedIn for professional content sharing',
    connected: true,
    icon: FaLinkedin,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations'>(
    'profile',
  );
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
  });

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    toast.success('Password changed successfully!');
  };

  const handleToggleIntegration = (
    integrationId: string,
    connected: boolean,
  ) => {
    toast.success(
      `${integrationId} has been ${connected ? 'disconnected' : 'connected'} successfully.`,
    );
  };

  const handleSaveNotifications = () => {
    toast.success('Notification settings saved!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account settings and integrations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === 'profile'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <User className="h-4 w-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === 'integrations'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Link2 className="h-4 w-4" />
            Integrations
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {profile.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveProfile}
                  className="gradient-primary text-primary-foreground"
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <label
                      htmlFor="current-password"
                      className="text-sm font-medium"
                    >
                      Current Password
                    </label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="new-password"
                      className="text-sm font-medium"
                    >
                      New Password
                    </label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-password"
                      className="text-sm font-medium"
                    >
                      Confirm New Password
                    </label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                <Button onClick={handleChangePassword} variant="outline">
                  Change Password
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Email Notifications
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your content
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email: checked,
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Push Notifications
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Get push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        push: checked,
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Weekly Reports
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly analytics summaries
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weekly}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        weekly: checked,
                      })
                    }
                  />
                </div>
                <Button onClick={handleSaveNotifications} variant="outline">
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Connected Apps
                </CardTitle>
                <CardDescription>
                  Connect third-party apps to enhance your content creation
                  workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrations.map((integration, index) => (
                  <div key={integration.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          <integration.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {integration.name}
                            {integration.connected && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                                <Check className="h-3 w-3" />
                                Connected
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={integration.connected ? 'outline' : 'default'}
                        size="sm"
                        onClick={() =>
                          handleToggleIntegration(
                            integration.name,
                            integration.connected,
                          )
                        }
                        className={
                          !integration.connected
                            ? 'gradient-primary text-primary-foreground'
                            : ''
                        }
                      >
                        {integration.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                    {index < integrations.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                  Manage API keys for programmatic access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    value="sk-••••••••••••••••••••••••"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="sm">
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is secret. Never share it publicly.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
