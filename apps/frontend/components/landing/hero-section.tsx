import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrendingUp, Sparkles, Zap, BarChart3, Calendar } from 'lucide-react';

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

      <div className="container max-w-6xl relative z-10 mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-sm font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
            New Feature: AI Content Generation & Auto-Scheduling
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
            all platforms effortlessly.
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
        <div className="mb-14">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-semibold uppercase tracking-widest">
            Trusted by 10,000+ teams including
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-14 items-center opacity-90 dark:opacity-85">
            {[
              { name: 'Acme Corp', symbol: '▲' },
              { name: 'Global Media', symbol: '●' },
              { name: 'Nebula AI', symbol: '◆' },
              { name: 'FoxRun', symbol: '★' },
              { name: 'Circle', symbol: '❖' },
            ].map((company) => (
              <div
                key={company.name}
                className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
              >
                <span className="text-blue-600 dark:text-cyan-400 text-sm">{company.symbol}</span>
                <span>{company.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mx-auto max-w-6xl perspective-1000 -mb-86 mt-8">
          {/* Floating Glassmorphism Callout Badges */}
          <div className="absolute -top-6 -left-2 sm:-left-6 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-md">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                AI Automation Active
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                14 Posts Auto-Scheduled
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-2 sm:-right-6 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl text-white shadow-md">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Weekly Growth
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                +34.2% Reach <span className="text-emerald-500 text-xs">▲</span>
              </div>
            </div>
          </div>

          {/* Main Dashboard Mockup Window */}
          <div
            className="relative border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              transform: 'perspective(1000px) rotateX(6deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Mock Dashboard Header */}
            <div className="h-13 border-b border-gray-200/80 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 px-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hidden sm:inline-block">
                  SocialArch Studio v2.4
                </span>
              </div>

              {/* Connected Platforms */}
              <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Platforms:
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">X / Twitter</span>
                <span className="px-1.5 py-0.5 rounded bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-semibold">Instagram</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold">LinkedIn</span>
                <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-semibold">YouTube</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  SA
                </div>
              </div>
            </div>

            {/* Mock Dashboard Body */}
            <div className="p-6 grid grid-cols-12 gap-6 bg-gray-50/40 dark:bg-gray-950/60 min-h-[460px] text-left">
              {/* Sidebar */}
              <div className="col-span-3 hidden md:flex flex-col gap-2 border-r border-gray-200/60 dark:border-gray-800/80 pr-4">
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-1">
                  Navigation
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm shadow-sm">
                  <BarChart3 className="h-4 w-4" />
                  Analytics Overview
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm transition-colors">
                  <Calendar className="h-4 w-4" />
                  Smart Scheduler
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm transition-colors">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  AI Studio
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm transition-colors">
                  <Zap className="h-4 w-4 text-cyan-500" />
                  Automations
                </div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 rounded-xl shadow-xs">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Audience Reach</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">148,520</div>
                    <div className="text-xs font-semibold text-emerald-500 mt-1 flex items-center gap-0.5">
                      <span>▲ +18.4%</span> <span className="text-gray-400 font-normal">this week</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 rounded-xl shadow-xs">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Avg Engagement Rate</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">5.82%</div>
                    <div className="text-xs font-semibold text-emerald-500 mt-1 flex items-center gap-0.5">
                      <span>▲ +2.4%</span> <span className="text-gray-400 font-normal">top tier</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 rounded-xl shadow-xs">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Auto-Published Posts</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">428</div>
                    <div className="text-xs font-semibold text-blue-500 mt-1 flex items-center gap-0.5">
                      <span>⚡ 100% On-Time</span>
                    </div>
                  </div>
                </div>

                {/* Performance Graph & Upcoming Queue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Graph Card */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Engagement Trend</span>
                      <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded">Live Sync</span>
                    </div>
                    <div className="h-28 w-full pt-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,80 Q50,25 100,55 T200,35 T300,10 L300,100 L0,100 Z" fill="url(#heroChartGrad)" />
                        <path d="M0,80 Q50,25 100,55 T200,35 T300,10" fill="none" stroke="#06b6d4" strokeWidth="3" />
                        <circle cx="200" cy="35" r="4" fill="#2563eb" />
                      </svg>
                    </div>
                  </div>

                  {/* Automation Queue Card */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 rounded-xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        Automation Queue
                      </span>
                      <span className="text-xs text-gray-400 font-medium">Next in 12m</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">AI-Generated Thread</span>
                        </div>
                        <span className="text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">Ready</span>
                      </div>
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">Reels Auto-Publish</span>
                        </div>
                        <span className="text-blue-500 font-semibold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">Queued</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 blur-3xl -z-10 rounded-[3rem]"></div>
        </div>
      </div>
    </section>
  );
}

