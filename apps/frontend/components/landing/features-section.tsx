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
  Star,
} from 'lucide-react';

const features = [
  {
    title: 'Smart Scheduling',
    description: 'Schedule posts for optimal engagement times across all platforms',
    icon: <Calendar className="h-12 w-12 text-blue-600 mb-4" />,
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track performance, engagement rates, and audience growth insights',
    icon: <BarChart3 className="h-12 w-12 text-green-600 mb-4" />,
  },
  {
    title: 'Audience Management',
    description: 'Understand your audience and create content that resonates',
    icon: <Users className="h-12 w-12 text-purple-600 mb-4" />,
  },
  {
    title: 'Automated Workflows',
    description: 'Set up automated posting schedules and content recycling',
    icon: <Zap className="h-12 w-12 text-yellow-600 mb-4" />,
  },
  {
    title: 'Secure & Private',
    description: 'Enterprise-grade security with end-to-end encryption',
    icon: <Shield className="h-12 w-12 text-red-600 mb-4" />,
  },
  {
    title: 'Multi-Platform Support',
    description: 'Connect and manage all your social media accounts in one place',
    icon: <Star className="h-12 w-12 text-indigo-600 mb-4" />,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="pt-8 pb-20 bg-white/50 dark:bg-gray-800/50">
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
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
