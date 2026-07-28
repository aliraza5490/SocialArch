import type { Metadata } from 'next';
import { BillingContainer } from './components/BillingContainer';

export const metadata: Metadata = {
  title: 'Billing & Plans | SocialArch',
  description: 'Manage your subscription plans, credits usage, and billing history.',
};

export default function BillingPage() {
  return <BillingContainer />;
}
