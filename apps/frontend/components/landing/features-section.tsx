import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart3,
  Users,
  Calendar,
  Zap,
  Shield,
  Layers,
} from 'lucide-react';

const features = [
  {
    title: 'Smart Scheduling',
    description: 'Schedule posts for optimal engagement times automatically across all your social channels.',
    Icon: Calendar,
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track real-time performance, engagement metrics, and audience growth with deep insights.',
    Icon: BarChart3,
  },
  {
    title: 'Audience Management',
    description: 'Understand your audience demography and deliver targeted content that resonates deeply.',
    Icon: Users,
  },
  {
    title: 'Automated Workflows',
    description: 'Set up autonomous posting pipelines, smart AI captions, and evergreen content recycling.',
    Icon: Zap,
  },
  {
    title: 'Secure & Private',
    description: 'Enterprise-grade encryption and security protocols protecting all your brand accounts.',
    Icon: Shield,
  },
  {
    title: 'Multi-Platform Support',
    description: 'Seamlessly connect X (Twitter), Instagram, LinkedIn, and YouTube in a unified hub.',
    Icon: Layers,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="pt-8 pb-20 bg-white/50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful tools engineered to accelerate your social media growth and streamline operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.Icon;
            return (
              <Card
                key={index}
                className="group border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="p-6">
                  {/* Unified Dual-Tone Icon Palette Container */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-purple-600/15 border border-cyan-500/30 flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                    <IconComponent className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base font-normal dark:font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

