import type { Metadata } from 'next';
import { AssetsContainer } from './components/AssetsContainer';

export const metadata: Metadata = {
  title: 'Assets Library | SocialArch',
  description: 'Manage, organize, and download your media assets and branding files.',
};

export default function AssetsPage() {
  return <AssetsContainer />;
}
