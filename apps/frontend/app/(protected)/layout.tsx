'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
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
import { Separator } from '@/components/ui/separator';
import { Loader2, Bell } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Note: We'll access sidebar state via useSidebar hook inside the provider,
  // but to do that we need to split this component or assume SidebarProvider is already wrapping it.
  // Actually SidebarProvider is part of this layout.
  // The 'auto-collapse' logic needs to be inside a component *inside* SidebarProvider.

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
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
  user: any;
  logout: () => void;
  pathname: string;
}) {
  const { setOpen } = useSidebar();
  const hasCollapsedForCreatePage = useRef(false);

  // Auto-collapse sidebar on content creator page (only once per visit)
  useEffect(() => {
    if (pathname === '/create/new' || pathname === '/create') {
      // Handling potential sub-routes if needed, checking equality for now
      if (!hasCollapsedForCreatePage.current) {
        setOpen(false);
        hasCollapsedForCreatePage.current = true;
      }
    } else {
      hasCollapsedForCreatePage.current = false;
    }
  }, [pathname, setOpen]);

  // Generate initials
  const userInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      : user?.email
        ? user.email.charAt(0).toUpperCase()
        : 'JD';

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar logout={logout} />
      <SidebarInset>
        <header className="h-14 border-b border-border flex items-center px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
              <Link href="/notifications">
                <Bell className="h-4 w-4" />
              </Link>
            </Button>
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
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </SidebarInset>
    </div>
  );
}
