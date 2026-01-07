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
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-2 ${
                plan.popular
                  ? 'border-blue-600 shadow-xl scale-105'
                  : 'border-transparent shadow-lg hover:shadow-xl'
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <Button
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
