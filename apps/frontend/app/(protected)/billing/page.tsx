'use client';

import { useState } from 'react';
import {
  CreditCard,
  Check,
  Sparkles,
  Zap,
  Crown,
  Download,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  credits: number;
  popular?: boolean;
  icon: 'sparkles' | 'zap' | 'crown';
}

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  type: 'subscription' | 'credit' | 'refund';
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    period: 'month',
    description: 'Perfect for individuals getting started',
    credits: 100,
    icon: 'sparkles',
    features: [
      '100 AI credits/month',
      'Basic content templates',
      'Email support',
      '1 workspace',
      'Standard generation speed',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'Best for growing creators and teams',
    credits: 500,
    icon: 'zap',
    popular: true,
    features: [
      '500 AI credits/month',
      'Advanced templates',
      'Priority support',
      '5 workspaces',
      'Fast generation speed',
      'Custom brand voice',
      'Analytics dashboard',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For large teams with advanced needs',
    credits: 2000,
    icon: 'crown',
    features: [
      '2000 AI credits/month',
      'All templates + custom',
      'Dedicated support',
      'Unlimited workspaces',
      'Fastest generation',
      'API access',
      'Advanced analytics',
      'Custom integrations',
      'SSO & team management',
    ],
  },
];

const transactions: Transaction[] = [
  {
    id: '1',
    date: new Date(),
    description: 'Pro Plan - Monthly Subscription',
    amount: 29,
    status: 'completed',
    type: 'subscription',
  },
  {
    id: '2',
    date: new Date(Date.now() - 2592000000),
    description: 'Pro Plan - Monthly Subscription',
    amount: 29,
    status: 'completed',
    type: 'subscription',
  },
  {
    id: '3',
    date: new Date(Date.now() - 5184000000),
    description: 'Credit Top-up - 200 credits',
    amount: 15,
    status: 'completed',
    type: 'credit',
  },
  {
    id: '4',
    date: new Date(Date.now() - 7776000000),
    description: 'Pro Plan - Monthly Subscription',
    amount: 29,
    status: 'completed',
    type: 'subscription',
  },
];

const iconMap = {
  sparkles: Sparkles,
  zap: Zap,
  crown: Crown,
};

export default function BillingPage() {
  const [currentPlan] = useState('pro');
  const [creditsUsed] = useState(320);
  const [creditsTotal] = useState(500);

  const handleUpgrade = (planId: string) => {
    toast.success(`Upgrading to ${planId} plan...`);
  };

  const handleDownloadInvoice = () => {
    toast.success('Downloading invoice...');
  };

  return (
    <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Billing & Plans
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your subscription and view transaction history
          </p>
        </div>

        {/* Current Plan Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Pro Plan</p>
                  <p className="text-sm text-muted-foreground">Current plan</p>
                </div>
              </div>
              <div className="text-3xl font-bold">
                $29
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Credits Usage</p>
                  <p className="text-sm text-muted-foreground">
                    AI credits remaining
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold">{creditsUsed}</span>
                <span className="text-muted-foreground">/ {creditsTotal}</span>
              </div>
              <Progress
                value={(creditsUsed / creditsTotal) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Resets in 12 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <Calendar className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Next Billing</p>
                  <p className="text-sm text-muted-foreground">
                    Subscription renewal
                  </p>
                </div>
              </div>
              <div className="text-3xl font-bold mb-3">Feb 15, 2025</div>
              <Button variant="outline" size="sm" className="w-full">
                Manage Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const IconComponent = iconMap[plan.icon];
              const isCurrentPlan = plan.id === currentPlan;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative transition-all hover:shadow-card-hover',
                    plan.popular && 'border-primary shadow-glow',
                    isCurrentPlan && 'bg-primary/5',
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gradient-primary text-primary-foreground shadow-glow">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 shadow-glow">
                      <IconComponent className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">
                        /{plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-primary font-medium">
                      {plan.credits} credits/month
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={cn(
                        'w-full',
                        plan.popular &&
                          'gradient-primary shadow-glow hover:opacity-90',
                      )}
                      variant={plan.popular ? 'default' : 'outline'}
                      disabled={isCurrentPlan}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        <>
                          {plan.price > 29 ? 'Upgrade' : 'Switch'} to{' '}
                          {plan.name}
                          <ArrowUpRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
            <CardDescription>Your recent payments and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.date.toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === 'completed'
                            ? 'default'
                            : transaction.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className={cn(
                          transaction.status === 'completed' &&
                            'bg-green-500/10 text-green-500 hover:bg-green-500/20',
                        )}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice()}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
