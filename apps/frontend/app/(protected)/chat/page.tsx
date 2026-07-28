import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ChatContainer } from './components/ChatContainer';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Chat Studio | SocialArch',
  description: 'Generate, manage, and optimize your social media content with AI.',
};

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <ChatContainer />
    </Suspense>
  );
}
