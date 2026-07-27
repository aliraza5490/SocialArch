import { Target, Heart, Sparkles, CheckCircle2, Zap, Layers } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Built by Creators, for Creators
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              At SocialArch, we understand the challenges of managing multiple
              social media accounts. That&apos;s why we built an autonomous platform that
              streamlines your workflow and helps you focus on what matters most:
              creating great content.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start space-x-2.5">
                <div className="p-2 bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 rounded-lg shrink-0">
                  <Target className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Mission Driven
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Empowering voices worldwide
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <div className="p-2 bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 rounded-lg shrink-0">
                  <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    User First
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Designed for maximum growth
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Automation Mockup Card (Replaces Generic Progress Bars) */}
          <div className="flex-1 relative w-full">
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl transform rotate-1 opacity-20 blur-lg"></div>
            
            <div className="relative bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-800 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white shadow-xs">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      Creator Automation Pipeline
                    </h4>
                    <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                      Active • 99.4% Workflow Efficiency
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Live Engine
                </span>
              </div>

              {/* Workflow Step Visualizer */}
              <div className="space-y-2.5">
                {/* Step 1 */}
                <div className="p-2.5 bg-gray-50 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold text-[11px]">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        AI Content Generation
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        Captions & hashtag variants auto-crafted
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                </div>

                {/* Step 2 */}
                <div className="p-2.5 bg-gray-50 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-[11px]">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        Multi-Platform Auto-Format
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        Adapted for X, IG, LinkedIn & YouTube
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                </div>

                {/* Step 3 */}
                <div className="p-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-cyan-500 text-white flex items-center justify-center font-bold text-[11px]">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        Smart Peak Time Dispatch
                      </div>
                      <div className="text-[11px] text-cyan-700 dark:text-cyan-300 font-medium">
                        Auto-publishing at maximum audience activity
                      </div>
                    </div>
                  </div>
                  <Sparkles className="h-4 w-4 text-cyan-500 animate-pulse shrink-0" />
                </div>
              </div>

              {/* Creator ROI Footer */}
              <div className="pt-1 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="text-base font-bold text-blue-600 dark:text-cyan-400">18.5 hrs</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Saved Per Week</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="text-base font-bold text-purple-600 dark:text-purple-400">142 Posts</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Auto-Scheduled</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

