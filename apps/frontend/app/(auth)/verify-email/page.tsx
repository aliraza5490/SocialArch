import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EmailVerificationCard } from './components/email-verification-page';

function EmailVerificationPageWrapper() {
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

        <EmailVerificationCard />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-blue-600/15 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <EmailVerificationPageWrapper />
    </Suspense>
  );
}