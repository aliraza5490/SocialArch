import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-8 overflow-hidden">
      {/* Hero Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] opacity-70"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Gradient Fade to Content */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white dark:from-gray-900 to-transparent"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
            New Feature: AI Content Generation
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
            Manage Your Social Media
            <span className="block mt-2 bg-linear-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Like a Pro
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            SocialArch is the all-in-one platform for scheduling posts,
            analyzing performance, and growing your social media presence across
            all platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="text-lg px-8 py-4 h-auto rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Start Free Trial
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 h-auto rounded-xl bg-white/50 backdrop-blur-xs hover:bg-white/80 dark:bg-gray-900/50 dark:hover:bg-gray-900/80"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mb-10">
          <p className="text-sm text-gray-500 mb-6 font-medium uppercase tracking-wider">
            Trusted by 10,000+ teams including
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['Acme Corp', 'GlobalTech', 'Nebula', 'FoxRun', 'Circle'].map(
              (company) => (
                <span
                  key={company}
                  className="text-xl font-bold text-gray-400 font-serif"
                >
                  {company}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mx-auto max-w-6xl perspective-1000 -mb-86">
          <div
            className="relative border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden transform rotate-x-12 translate-y-12 opacity-0 animate-fade-in-up"
            style={{
              animation: 'fade-in-up 1s ease-out forwards',
              animationDelay: '0.2s',
              transformStyle: 'preserve-3d',
              transform: 'perspective(1000px) rotateX(10deg)',
            }}
          >
            {/* Mock Dashboard Header */}
            <div className="h-12 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 h-6 mx-4 rounded-md"></div>
            </div>

            {/* Mock Dashboard Content */}
            <div className="p-6 grid grid-cols-4 gap-6 h-[500px] bg-gray-50/50 dark:bg-gray-900/50">
              {/* Sidebar */}
              <div className="col-span-1 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg w-full"
                  ></div>
                ))}
              </div>

              {/* Main Content */}
              <div className="col-span-3 grid grid-cols-2 gap-6">
                <div className="col-span-2 h-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-xs">
                  <div className="flex items-end justify-between h-32 gap-2">
                    {[40, 70, 45, 90, 60, 80, 55, 85, 95, 75, 60, 90].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="w-full bg-blue-500/20 dark:bg-blue-500/20 rounded-t-sm relative group overflow-hidden"
                        >
                          <div
                            className="absolute bottom-0 w-full bg-blue-600 rounded-t-sm transition-all duration-1000 ease-out"
                            style={{ height: `${h}%` }}
                          ></div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="h-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-xs"></div>
                <div className="h-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-xs"></div>
              </div>
            </div>
          </div>

          {/* Glow effect behind dashboard */}
          <div className="absolute -inset-4 bg-blue-500/20 blur-3xl -z-10 rounded-[3rem]"></div>
        </div>
      </div>
    </section>
  );
}
