import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LogOut,
  User,
  Mail,
} from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your social media management dashboard
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {user?.firstName}{' '}
                    {user?.lastName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{' '}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user?.isEmailVerified
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </p>
                  {!user?.isEmailVerified && (
                    <p className="text-sm text-muted-foreground">
                      Please verify your email to access all features.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user?.isEmailVerified && (
                  <Link href="/auth/verify-email">
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Verify Email
                    </Button>
                  </Link>
                )}
                <Button variant="outline" className="w-full" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Start managing your social media presence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  SocialArch helps you manage multiple social media accounts
                  from one place. Connect your accounts and start scheduling
                  posts, analyzing engagement, and growing your audience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;