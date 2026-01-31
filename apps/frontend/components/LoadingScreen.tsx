'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  variant?: 'full' | 'inline';
}

export function LoadingScreen({ variant = 'full' }: LoadingScreenProps) {
  const isFull = variant === 'full';

  return (
    <div 
      className={`relative overflow-hidden w-full flex flex-col items-center justify-center transition-all duration-300
        ${isFull ? 'min-h-screen bg-white dark:bg-gray-900' : 'min-h-[calc(100vh-12rem)] bg-transparent'}`}
    >
      {isFull && (
        <>
          {/* Background Elements - Only for full screen */}
          <div className="absolute inset-0 z-0 text-foreground">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] opacity-70"></div>
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] opacity-70"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>
        </>
      )}

      <div className="flex flex-col items-center space-y-6 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 relative flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="SocialArch Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            SocialArch
          </span>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}
