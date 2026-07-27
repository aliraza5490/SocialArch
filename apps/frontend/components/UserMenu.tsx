'use client';

import Link from 'next/link';
import {
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface User {
  name: string;
  email: string;
  avatar: string;
  firstName?: string;
  lastName?: string;
}

interface UserMenuProps {
  user: User;
  logout: () => void;
  variant?: 'sidebar' | 'header';
}

export function UserMenu({ user, logout, variant = 'sidebar' }: UserMenuProps) {
  const { isMobile, state, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';

  // Generate initials for fallback
  const userInitials =
    user.firstName && user.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      : user.name
        ? user.name.charAt(0).toUpperCase()
        : user.email
          ? user.email.charAt(0).toUpperCase()
          : 'U';

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.name;

  const dropdownContent = (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-xs">
          <Avatar className="h-7 w-7 rounded-md">
            <AvatarImage src={user.avatar} alt={fullName} />
            <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-medium text-xs">{fullName}</span>
            <span className="truncate text-[10px] text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link
            href="/billing"
            className="flex items-center text-xs cursor-pointer"
            onClick={() => isMobile && setOpenMobile(false)}
          >
            <CreditCard className="mr-2 h-3.5 w-3.5" />
            Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className="flex items-center text-xs cursor-pointer"
            onClick={() => isMobile && setOpenMobile(false)}
          >
            <Bell className="mr-2 h-3.5 w-3.5" />
            Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center text-xs cursor-pointer"
            onClick={() => isMobile && setOpenMobile(false)}
          >
            <Settings className="mr-2 h-3.5 w-3.5" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:text-destructive text-xs cursor-pointer"
        onClick={logout}
      >
        <LogOut className="mr-2 h-3.5 w-3.5" />
        Log out
      </DropdownMenuItem>
    </>
  );

  if (variant === 'sidebar') {
    if (isMobile) {
      return (
        <SidebarMenu className="mt-4 space-y-1">
          <div className="flex items-center gap-2.5 px-2 py-1.5 mb-2">
            <Avatar className="h-7 w-7 rounded-md border border-border">
              <AvatarImage src={user.avatar} alt={fullName} />
              <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-medium text-xs">{fullName}</span>
              <span className="truncate text-[10px] text-muted-foreground">{user.email}</span>
            </div>
          </div>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-xs">
              <Link href="/billing" onClick={() => setOpenMobile(false)}>
                <CreditCard className="h-3.5 w-3.5" />
                <span className="text-xs">Billing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-xs">
              <Link href="/notifications" onClick={() => setOpenMobile(false)}>
                <Bell className="h-3.5 w-3.5" />
                <span className="text-xs">Notifications</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-xs">
              <Link href="/settings" onClick={() => setOpenMobile(false)}>
                <Settings className="h-3.5 w-3.5" />
                <span className="text-xs">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                if (isMobile) setOpenMobile(false);
                logout();
              }}
              className="text-destructive hover:text-destructive text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-xs">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      );
    }

    return (
      <SidebarMenu
        className={collapsed ? 'flex items-center justify-center' : ''}
      >
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-7 w-7 rounded-md">
                  <AvatarImage src={user.avatar} alt={fullName} />
                  <AvatarFallback className="rounded-md text-xs font-medium">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium text-xs">{fullName}</span>
                  <span className="truncate text-[10px] text-muted-foreground">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              {dropdownContent}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Header variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-0.5 rounded-full hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.avatar} alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {dropdownContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
