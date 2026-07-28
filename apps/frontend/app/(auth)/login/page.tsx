import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { LoginForm } from './components/login-form';

export const metadata: Metadata = {
  title: 'Sign In | SocialArch',
  description: 'Sign in to your SocialArch account to manage your social media studio.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-6 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-blue-600/15 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-sm w-full space-y-4 relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center space-x-2">
          <div className="w-7 h-7 relative flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="SocialArch Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg font-bold text-foreground">
            SocialArch
          </span>
        </Link>

        <LoginForm />
      </div>
    </div>
  );
}
