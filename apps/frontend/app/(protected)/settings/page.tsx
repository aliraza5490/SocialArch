'use client';

import { useState } from 'react';
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
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your account settings and integrations
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            activeTab === 'profile'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <User className="h-3.5 w-3.5" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            activeTab === 'integrations'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Link2 className="h-3.5 w-3.5" />
          Integrations
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* Profile Information */}
          <Card className="p-4 sm:p-5 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-base bg-primary/10 text-primary font-semibold">
                    {profile.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <Button variant="outline" size="sm" className="h-7 text-xs px-3">
                    Change Avatar
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-3 max-w-md">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    className="h-8 text-xs"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    className="h-8 text-xs"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveProfile}
                size="sm"
                className="h-8 text-xs px-4 gradient-primary text-primary-foreground"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="p-4 sm:p-5 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Security
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="grid gap-3 max-w-md">
                <div className="space-y-1.5">
                  <label
                    htmlFor="current-password"
                    className="text-xs font-medium"
                  >
                    Current Password
                  </label>
                  <Input id="current-password" type="password" className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="new-password"
                    className="text-xs font-medium"
                  >
                    New Password
                  </label>
                  <Input id="new-password" type="password" className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirm-password"
                    className="text-xs font-medium"
                  >
                    Confirm New Password
                  </label>
                  <Input id="confirm-password" type="password" className="h-8 text-xs" />
                </div>
              </div>
              <Button onClick={handleChangePassword} variant="outline" size="sm" className="h-8 text-xs px-4">
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="p-4 sm:p-5 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-xs font-medium">
                    Email Notifications
                  </label>
                  <p className="text-[11px] text-muted-foreground">
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
                  <label className="text-xs font-medium">
                    Push Notifications
                  </label>
                  <p className="text-[11px] text-muted-foreground">
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
                  <label className="text-xs font-medium">
                    Weekly Reports
                  </label>
                  <p className="text-[11px] text-muted-foreground">
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
              <Button onClick={handleSaveNotifications} variant="outline" size="sm" className="h-8 text-xs px-4 mt-1">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <Card className="p-4 sm:p-5 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                Connected Apps
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Connect third-party apps to enhance your content creation
                workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {integrations.map((integration, index) => (
                <div key={integration.id}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                        <integration.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold flex items-center gap-2">
                          {integration.name}
                          {integration.connected && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium">
                              <Check className="h-2.5 w-2.5" />
                              Connected
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
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
                      className={cn(
                        'h-7 text-xs px-3',
                        !integration.connected
                          ? 'gradient-primary text-primary-foreground'
                          : '',
                      )}
                    >
                      {integration.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                  {index < integrations.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="p-4 sm:p-5 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-semibold">API Access</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Manage API keys for programmatic access
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center gap-2 max-w-md">
                <Input
                  value="sk-••••••••••••••••••••••••"
                  readOnly
                  className="font-mono text-xs h-8"
                />
                <Button variant="outline" size="sm" className="h-8 text-xs px-3">
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs px-3">
                  Regenerate
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Your API key is secret. Never share it publicly.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
