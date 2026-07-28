import type { Metadata } from 'next';
import { SettingsContainer } from './components/SettingsContainer';

export const metadata: Metadata = {
  title: 'Settings & Integrations | SocialArch',
  description: 'Manage your account profile, security, notifications, and app integrations.',
};

export default function SettingsPage() {
  return <SettingsContainer />;
}
