import { Target, Heart, Sparkles, CheckCircle2, Zap, Layers } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Built by Creators, for Creators
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              At SocialArch, we understand the challenges of managing multiple
              social media accounts. That&apos;s why we built an autonomous platform that
              streamlines your workflow and helps you focus on what matters most:
              creating great content.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <Target className="h-6 w-6 text-blue-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Mission Driven
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Empowering voices worldwide
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 rounded-xl">
                  <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    User First
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Designed for maximum growth
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Automation Mockup Card (Replaces Generic Progress Bars) */}
          <div className="flex-1 relative w-full">
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-3xl transform rotate-2 opacity-20 blur-xl"></div>
            
            <div className="relative bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-200/80 dark:border-gray-800 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white shadow-md">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">
                      Creator Automation Pipeline
                    </h4>
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                      Active • 99.4% Workflow Efficiency
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Live Engine
                </span>
              </div>

              {/* Workflow Step Visualizer */}
              <div className="space-y-3.5">
                {/* Step 1 */}
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        AI Content Generation
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Captions & hashtag variants auto-crafted
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                </div>

                {/* Step 2 */}
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        Multi-Platform Auto-Format
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Adapted for X, IG, LinkedIn & YouTube
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                </div>

                {/* Step 3 */}
                <div className="p-3.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500 text-white flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        Smart Peak Time Dispatch
                      </div>
                      <div className="text-xs text-cyan-700 dark:text-cyan-300 font-medium">
                        Auto-publishing at maximum audience activity
                      </div>
                    </div>
                  </div>
                  <Sparkles className="h-5 w-5 text-cyan-500 animate-pulse shrink-0" />
                </div>
              </div>

              {/* Creator ROI Footer */}
              <div className="pt-2 grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="text-lg font-bold text-blue-600 dark:text-cyan-400">18.5 hrs</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Saved Per Week</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">142 Posts</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Auto-Scheduled</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

