import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '0',
    features: [
      '3 Social Accounts',
      'Basic Analytics',
      '10 Scheduled Posts',
      '1 User',
    ],
  },
  {
    name: 'Pro',
    price: '29',
    popular: true,
    features: [
      '10 Social Accounts',
      'Advanced Analytics',
      'Unlimited Scheduled Posts',
      '5 Users',
      'Priority Support',
    ],
  },
  {
    name: 'Enterprise',
    price: '99',
    features: [
      'Unlimited Accounts',
      'Custom Reports',
      'API Access',
      'Unlimited Users',
      'Dedicated Account Manager',
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-14 bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-2 rounded-2xl ${
                plan.popular
                  ? 'border-blue-600 shadow-xl scale-[1.02]'
                  : 'border-border/80 shadow-sm hover:shadow-lg'
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
                  Most Popular
                </div>
              )}
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-3 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm font-medium">
                      <Check className="h-4.5 w-4.5 text-emerald-500 mr-2.5 shrink-0" />
                      <span className="text-gray-700 dark:text-gray-200">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    size="default"
                    className="w-full h-10 text-sm font-semibold rounded-xl"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
