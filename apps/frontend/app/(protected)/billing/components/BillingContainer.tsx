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

export function BillingContainer() {
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
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Billing & Plans
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your subscription and view transaction history
        </p>
      </div>

      {/* Current Plan Summary */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-primary/30 bg-primary/5 p-3.5 sm:p-4 gap-0">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow shrink-0">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold">Pro Plan</p>
                <p className="text-[11px] text-muted-foreground">Current plan</p>
              </div>
            </div>
            <div className="text-2xl font-bold">
              $29
              <span className="text-xs font-normal text-muted-foreground ml-1">
                /month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3.5 sm:p-4 gap-0">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold">Credits Usage</p>
                <p className="text-[11px] text-muted-foreground">
                  AI credits remaining
                </p>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-2xl font-bold">{creditsUsed}</span>
              <span className="text-xs text-muted-foreground">/ {creditsTotal}</span>
            </div>
            <Progress
              value={(creditsUsed / creditsTotal) * 100}
              className="h-1.5"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Resets in 12 days
            </p>
          </CardContent>
        </Card>

        <Card className="p-3.5 sm:p-4 gap-0">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow shrink-0">
                <Calendar className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold">Next Billing</p>
                <p className="text-[11px] text-muted-foreground">
                  Subscription renewal
                </p>
              </div>
            </div>
            <div className="text-xl font-bold mb-2.5">Feb 15, 2025</div>
            <Button variant="outline" size="sm" className="w-full h-7 text-xs">
              Manage Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Available Plans</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {plans.map((plan) => {
            const IconComponent = iconMap[plan.icon];
            const isCurrentPlan = plan.id === currentPlan;

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative transition-all hover:shadow-card-hover p-4 sm:p-4.5 gap-0 flex flex-col justify-between',
                  plan.popular && 'border-primary shadow-glow',
                  isCurrentPlan && 'bg-primary/5',
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-primary text-primary-foreground text-[10px] px-2 py-0.5 shadow-glow">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center p-0 pb-3">
                  <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-2 shadow-glow">
                    <IconComponent className="h-4.5 w-4.5 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{plan.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-2xl font-bold">${plan.price}</span>
                    <span className="text-xs text-muted-foreground ml-0.5">
                      /{plan.period}
                    </span>
                  </div>
                  <p className="text-xs text-primary font-medium mt-0.5">
                    {plan.credits} credits/month
                  </p>
                </CardHeader>
                <CardContent className="p-0 space-y-3 flex-1 flex flex-col justify-between">
                  <ul className="space-y-1.5 pt-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={cn(
                      'w-full h-8 text-xs mt-3',
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
                        <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
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
      <Card className="p-4 sm:p-4.5 gap-3">
        <CardHeader className="p-0">
          <CardTitle className="text-sm font-semibold">Transaction History</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">Your recent payments and invoices</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs py-2 px-3">Date</TableHead>
                <TableHead className="text-xs py-2 px-3">Description</TableHead>
                <TableHead className="text-xs py-2 px-3">Amount</TableHead>
                <TableHead className="text-xs py-2 px-3">Status</TableHead>
                <TableHead className="text-xs py-2 px-3 text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-xs py-2 px-3 font-medium">
                    {transaction.date.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs py-2 px-3">{transaction.description}</TableCell>
                  <TableCell className="text-xs py-2 px-3">${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-xs py-2 px-3">
                    <Badge
                      variant={
                        transaction.status === 'completed'
                          ? 'default'
                          : transaction.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className={cn(
                        'text-[10px] px-2 py-0.5',
                        transaction.status === 'completed' &&
                          'bg-green-500/10 text-green-500 hover:bg-green-500/20',
                      )}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs py-2 px-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDownloadInvoice()}
                    >
                      <Download className="h-3.5 w-3.5" />
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
