'use client';

import * as React from 'react';
import { Home, FolderOpen, Plus, Bell } from 'lucide-react';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NavUser } from '@/components/NavUser';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const data = {
  user: {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
  },
};

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Assets', url: '/assets', icon: FolderOpen },
];

export function AppSidebar({
  logout,
  ...props
}: React.ComponentProps<typeof Sidebar> & { logout: () => void }) {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0"
      style={{ '--sidebar-width-icon': '5rem' } as React.CSSProperties}
      {...props}
    >
      {/* Logo Header */}
      <SidebarHeader
        className={cn(
          'p-4 pb-2',
          collapsed && !isMobile && 'flex justify-center',
        )}
      >
        <Link
          href="/dashboard"
          onClick={() => isMobile && setOpenMobile(false)}
          className={cn(
            'flex items-center',
            collapsed && !isMobile ? 'justify-center' : 'gap-2',
          )}
        >
          <div className={cn(
            'relative shrink-0',
            isMobile ? 'h-10 w-10' : 'h-8 w-8',
            'group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7',
          )}>
            <Image
              src="/logo.png"
              alt="SocialArch"
              fill
              className="object-cover"
            />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                SocialArch
              </span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">
                AI-Powered Studio
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* Create Content Button */}
      <div
        className={cn(
          'px-3 mt-4 pb-2',
          collapsed && !isMobile && 'px-2 flex justify-center',
        )}
      >
        <Button
          asChild
          size={collapsed && !isMobile ? 'icon' : 'sm'}
          className={cn(
            'gradient-primary shadow-glow hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
            collapsed && !isMobile ? 'h-8 w-8' : 'px-3 py-2 h-9 w-full text-sm',
          )}
        >
          <Link
            href="/create"
            onClick={() => isMobile && setOpenMobile(false)}
            className="flex items-center justify-center gap-2"
          >
            <Plus
              className={cn('h-3.5 w-3.5', (!collapsed || isMobile) && '-ml-1')}
            />
            {(!collapsed || isMobile) && (
              <span className="font-medium text-sm">Create Content</span>
            )}
          </Link>
        </Button>
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn(
              'text-xs uppercase tracking-wider text-muted-foreground/70 mb-1',
              collapsed && !isMobile ? 'sr-only' : 'px-3',
            )}
          >
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu
              className={cn(
                'space-y-1',
                (!collapsed || isMobile) && 'items-start',
              )}
            >
              {menuItems.map((item) => {
                const isActive = pathname === item.url;

                const sidebarMenuItemClass = cn(
                  'w-full',
                  (!collapsed || isMobile) && 'flex justify-start',
                );
                const navLinkClass = cn(
                  'flex items-center gap-3 w-full',
                  collapsed && !isMobile ? 'px-3' : 'pr-3',
                  collapsed && !isMobile ? 'justify-center' : 'justify-start',
                );
                const menuButtonClass = cn(
                  'h-10 transition-all duration-200 rounded-lg group/item',
                  collapsed ? 'w-full' : 'w-full',
                  // Remove max-w-xs to prevent centering on mobile
                  !collapsed && 'max-w-full',
                  // Override shadcn default size-8 constraint for collapsed state
                  'group-data-[collapsible=icon]:!size-auto group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!p-0',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground',
                );

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={sidebarMenuItemClass}
                  >
                    <SidebarMenuButton
                      asChild
                      tooltip={collapsed ? item.title : undefined}
                      className={menuButtonClass}
                    >
                      <Link
                        href={item.url}
                        onClick={() => isMobile && setOpenMobile(false)}
                        className={navLinkClass}
                      >
                        <div
                          className={cn(
                            'flex items-center justify-center transition-transform duration-200 group-hover/item:scale-110',
                            isActive && 'text-primary',
                          )}
                        >
                          <item.icon className="h-[18px] w-[18px]" />
                        </div>
                        {(!collapsed || isMobile) && (
                          <span
                            className={cn(
                              'font-medium text-sm',
                              isActive && 'text-primary',
                            )}
                          >
                            {item.title}
                          </span>
                        )}
                        {isActive && (!collapsed || isMobile) && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        className={cn(
          'p-3 border-t border-border/50',
          collapsed && !isMobile ? 'p-2' : 'flex justify-center',
        )}
      >
        {isMobile && (
          <div className="flex items-center gap-2 mb-3 px-2">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
              <Link
                href="/notifications"
                onClick={() => setOpenMobile(false)}
              >
                <Bell className="h-4 w-4" />
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        )}
        <NavUser user={data.user} logout={logout} />
      </SidebarFooter>
      <SidebarRail className="hover:bg-primary/5 transition-colors" />
    </Sidebar>
  );
}
