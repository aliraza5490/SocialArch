import type { Metadata } from 'next';
import { NotificationsContainer } from './components/NotificationsContainer';

export const metadata: Metadata = {
  title: 'Notifications | SocialArch',
  description: 'Stay updated with your content creation progress and platform updates.',
};

export default function NotificationsPage() {
  return <NotificationsContainer />;
}
