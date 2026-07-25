'use client';

import * as React from 'react';
import { Home, FolderOpen, Plus, Bell, Sparkles } from 'lucide-react';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'AI Agent', url: '/create', icon: Sparkles },
  { title: 'Assets', url: '/assets', icon: FolderOpen },
];

export function AppSidebar({
  logout: _logout,
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
      <SidebarHeader
        className={cn(
          'h-14 px-4 flex flex-row items-center justify-center shrink-0 w-full',
        )}
      >
        <Link
          href="/dashboard"
          onClick={() => isMobile && setOpenMobile(false)}
          className={cn(
            'flex items-center justify-center gap-2 w-full',
          )}
        >
          <div className={cn(
            'relative shrink-0',
            isMobile ? 'h-8 w-8' : 'h-7 w-7',
            'group-data-[collapsible=icon]:h-6.5 group-data-[collapsible=icon]:w-6.5',
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
          'px-3 mt-3 pb-1',
          collapsed && !isMobile && 'px-2 pb-3.5 flex justify-center',
        )}
      >
        <Button
          asChild
          size={collapsed && !isMobile ? 'icon' : 'sm'}
          className={cn(
            'gradient-primary shadow-glow hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
            collapsed && !isMobile ? 'h-7 w-7' : 'px-3 py-1.5 h-8 w-full text-xs font-medium',
          )}
        >
          <Link
            href="/create"
            onClick={() => isMobile && setOpenMobile(false)}
            className="flex items-center justify-center gap-1.5"
          >
            <Plus
              className={cn('h-3.5 w-3.5', (!collapsed || isMobile) && '-ml-0.5')}
            />
            {(!collapsed || isMobile) && (
              <span className="font-medium text-xs">Create Content</span>
            )}
          </Link>
        </Button>
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup className="py-1">
          <SidebarGroupLabel
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1 h-6',
              collapsed && !isMobile ? 'sr-only' : 'px-2.5',
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
                  'flex items-center gap-2.5 w-full',
                  collapsed && !isMobile ? 'px-2.5' : 'pr-2.5 pl-2',
                  collapsed && !isMobile ? 'justify-center' : 'justify-start',
                );
                const menuButtonClass = cn(
                  'h-8.5 transition-all duration-200 rounded-md group/item border border-transparent',
                  collapsed ? 'w-full' : 'w-full',
                  !collapsed && 'max-w-full',
                  'group-data-[collapsible=icon]:!size-auto group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!h-8.5 group-data-[collapsible=icon]:!p-0',
                  isActive
                    ? 'bg-primary/15 dark:bg-primary/25 text-primary border-primary/30 shadow-xs font-semibold'
                    : 'text-muted-foreground/75 hover:text-foreground hover:bg-muted/60',
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
                            isActive ? 'text-primary font-bold' : 'text-muted-foreground/80 group-hover/item:text-foreground',
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </div>
                        {(!collapsed || isMobile) && (
                          <span
                            className={cn(
                              'text-xs transition-colors',
                              isActive ? 'font-semibold text-primary' : 'font-medium text-muted-foreground/80 group-hover/item:text-foreground',
                            )}
                          >
                            {item.title}
                          </span>
                        )}
                        {isActive && (!collapsed || isMobile) && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(var(--primary),0.8)] animate-pulse" />
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

      {isMobile && (
        <SidebarFooter className="p-3 border-t border-border/50">
          <div className="flex items-center justify-between px-2">
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
        </SidebarFooter>
      )}
      <SidebarRail className="hover:bg-primary/5 transition-colors" />
    </Sidebar>
  );
}
