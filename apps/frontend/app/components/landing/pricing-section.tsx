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
    <section id="pricing" className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Simple, Transparent Pricing
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-2 ${
                plan.popular
                  ? 'border-blue-600 shadow-md scale-[1.02]'
                  : 'border-transparent shadow-sm hover:shadow-md'
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-0.5 rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ul className="space-y-2.5 mb-5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-xs">
                      <Check className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="w-full"
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
