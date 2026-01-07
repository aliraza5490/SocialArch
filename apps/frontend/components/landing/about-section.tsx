import { Target, Heart, Users } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Built by Creators, for Creators
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              At SocialArch, we understand the challenges of managing multiple
              social media accounts. That&apos;s why we built a platform that
              streamlines your workflow and helps you focus on what matters most:
              creating great content.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Mission Driven
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Empowering voices worldwide
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    User First
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Designed for your success
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl transform rotate-3 opacity-20 blur-xl"></div>
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    Trusted by 10,000+
                  </h4>
                  <p className="text-sm text-gray-500">Active users worldwide</p>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full w-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-linear-to-r from-cyan-500 to-blue-600 rounded-full p-2"
                      style={{ width: `${85 - i * 10}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
