'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/auth-context';
import { User } from '@/lib/types/auth';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Loader2, Bell } from 'lucide-react';

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider>
      <DashboardShell user={user} logout={logout} pathname={pathname}>
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}

function DashboardShell({
  children,
  user,
  logout,
  pathname,
}: {
  children: React.ReactNode;
  user: User | null;
  logout: () => void;
  pathname: string;
}) {
  const { open: isSidebarOpen } = useSidebar();
  const isChat = pathname.startsWith('/chat');

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar logout={logout} />
      <SidebarInset className="h-full overflow-hidden flex flex-col">
        <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm shrink-0 z-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Link href="/dashboard" className="flex lg:hidden items-center gap-2">
              <div className="relative h-6 w-6 shrink-0">
                <Image
                  src="/logo.png"
                  alt="SocialArch"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  SocialArch
                </span>
                <span className="text-[8px] text-muted-foreground -mt-0.5">
                  AI-Powered Studio
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center bg-muted/15 dark:bg-card/25 border border-border/40 px-2 rounded-full gap-2 shadow-xs h-8">
            <Button variant="ghost" size="icon" asChild className={`h-7 w-7 ${isSidebarOpen ? 'hidden lg:flex' : 'hidden md:flex'}`}>
              <Link href="/notifications">
                <Bell className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <div className={isSidebarOpen ? 'hidden lg:block' : 'hidden md:block'}>
              <ThemeToggle />
            </div>
            <UserMenu
              user={{
                name:
                  user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : '',
                email: user?.email || '',
                avatar: user?.avatar || '',
                firstName: user?.firstName,
                lastName: user?.lastName,
              }}
              logout={logout}
              variant="header"
            />
          </div>
        </header>
        <div className={`flex-1 min-h-0 flex flex-col ${isChat ? 'overflow-hidden p-0' : 'overflow-auto p-3.5 sm:p-4'}`}>
          {children}
        </div>
      </SidebarInset>
    </div>
  );
}
