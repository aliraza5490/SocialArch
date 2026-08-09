import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ForgotPasswordForm } from './components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot Password | SocialArch',
  description: 'Reset your SocialArch account password.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-6 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-glow-lg bg-cyan-500/15 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-0 right-0 bg-glow-md bg-blue-600/15 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="card-auth space-y-5 relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center space-x-2.5">
          <div className="w-10 h-10 relative flex items-center justify-center">
            <Image 
              src="/logo.png" 
              alt="SocialArch Logo" 
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            SocialArch
          </span>
        </Link>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
