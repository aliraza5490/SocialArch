import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  TrendingUp,
  BarChart3,
  Users,
  Calendar,
  Zap,
  Shield,
  Star,
} from 'lucide-react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SocialArch
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Manage Your Social Media
            <span className="block bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Like a Pro
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            SocialArch is the all-in-one platform for scheduling posts,
            analyzing performance, and growing your social media presence across
            all platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to help you grow your social media
              presence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>
                  Schedule posts for optimal engagement times across all
                  platforms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Track performance, engagement rates, and audience growth
                  insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Audience Management</CardTitle>
                <CardDescription>
                  Understand your audience and create content that resonates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Automated Workflows</CardTitle>
                <CardDescription>
                  Set up automated posting schedules and content recycling
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Enterprise-grade security with end-to-end encryption
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Multi-Platform Support</CardTitle>
                <CardDescription>
                  Connect and manage all your social media accounts in one place
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Social Media Strategy?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of creators and businesses already using SocialArch
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <span className="text-xl font-bold">SocialArch</span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/auth/login"
                className="hover:text-blue-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="hover:text-blue-400 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 SocialArch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;