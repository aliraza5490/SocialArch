'use client';

import * as React from 'react';
import { Home, FolderOpen, Bell, Plus, MessageSquare, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { chatService, ChatItem } from '@/lib/services/chat.service';
import { toast } from 'sonner';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Assets', url: '/assets', icon: FolderOpen },
];

export function AppSidebar({
  logout: _logout,
  ...props
}: React.ComponentProps<typeof Sidebar> & { logout: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';

  const currentChatId = searchParams?.get('id');

  const [recentChats, setRecentChats] = React.useState<ChatItem[]>([]);
  const [isLoadingChats, setIsLoadingChats] = React.useState(false);
  const [editingChatId, setEditingChatId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState('');

  const loadRecentChats = React.useCallback(async () => {
    try {
      setIsLoadingChats(true);
      const data = await chatService.getChats();
      setRecentChats(data || []);
    } catch (err) {
      console.error('Failed to load recent chats:', err);
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  React.useEffect(() => {
    loadRecentChats();

    const handleRefresh = () => {
      loadRecentChats();
    };

    window.addEventListener('refresh-recent-chats', handleRefresh);
    return () => {
      window.removeEventListener('refresh-recent-chats', handleRefresh);
    };
  }, [loadRecentChats]);

  const handleStartRename = (chat: ChatItem, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingChatId(chat.ID);
    setEditingTitle(chat.title || 'New Chat');
  };

  const handleSaveRename = async (chatId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingTitle.trim()) return;

    try {
      await chatService.renameChat(chatId, editingTitle.trim());
      setEditingChatId(null);
      toast.success('Chat renamed');
      loadRecentChats();
    } catch (err) {
      console.error('Failed to rename chat:', err);
      toast.error('Failed to rename chat');
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await chatService.deleteChat(chatId);
      toast.success('Chat deleted');
      if (currentChatId === chatId) {
        router.push('/chat');
      }
      loadRecentChats();
    } catch (err) {
      console.error('Failed to delete chat:', err);
      toast.error('Failed to delete chat');
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0"
      style={{ '--sidebar-width-icon': '5rem' } as React.CSSProperties}
      {...props}
    >
      <SidebarHeader
        className={cn(
          'h-12 p-0 flex flex-row items-center shrink-0 w-full border-b border-border/50',
          collapsed && !isMobile
            ? 'justify-center px-0'
            : 'justify-start px-4',
        )}
      >
        <Link
          href="/dashboard"
          onClick={() => isMobile && setOpenMobile(false)}
          className={cn(
            'flex items-center gap-2 h-full my-auto',
            collapsed && !isMobile ? 'justify-center' : 'justify-start',
          )}
        >
          <div className={cn(
            'relative shrink-0',
            isMobile ? 'h-5.5 w-5.5' : 'h-5 w-5',
            'group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5',
          )}>
            <Image
              src="/logo.png"
              alt="SocialArch"
              fill
              className="object-cover"
            />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col justify-center">
              <span className="font-bold text-sm leading-tight tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                SocialArch
              </span>
              <span className="text-[8px] leading-tight text-muted-foreground">
                AI-Powered Studio
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <div className={cn('mt-2.5 pt-1 pb-1.5', collapsed && !isMobile ? 'flex justify-center' : 'px-1')}>
          <Button
            asChild
            size={collapsed && !isMobile ? 'icon' : 'sm'}
            className={cn(
              'w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-xs transition-all duration-200 rounded-md',
              collapsed && !isMobile ? 'h-8 w-8 justify-center' : 'h-8 justify-start gap-2 px-2.5 text-xs',
            )}
            title={collapsed && !isMobile ? 'New Chat' : undefined}
          >
            <Link
              href="/chat"
              onClick={() => isMobile && setOpenMobile(false)}
              className="flex items-center"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              {(!collapsed || isMobile) && <span>New Chat</span>}
            </Link>
          </Button>
        </div>

        <SidebarGroup className="py-0.5">
          <SidebarGroupLabel
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-0.5 h-5',
              collapsed && !isMobile ? 'sr-only' : 'px-2',
            )}
          >
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu
              className={cn(
                'space-y-0.5',
                (!collapsed || isMobile) && 'items-start',
              )}
            >
              {menuItems.map((item) => {
                const isActive = pathname === item.url && !currentChatId;

                const sidebarMenuItemClass = cn(
                  'w-full',
                  (!collapsed || isMobile) && 'flex justify-start',
                );
                const navLinkClass = cn(
                  'flex items-center gap-2 w-full',
                  collapsed && !isMobile ? 'px-2' : 'pr-2 pl-2',
                  collapsed && !isMobile ? 'justify-center' : 'justify-start',
                );
                const menuButtonClass = cn(
                  'h-7.5 transition-all duration-200 rounded-md group/item border border-transparent',
                  collapsed ? 'w-full' : 'w-full',
                  !collapsed && 'max-w-full',
                  'group-data-[collapsible=icon]:!size-auto group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!h-7.5 group-data-[collapsible=icon]:!p-0',
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
                          <item.icon className="h-3.5 w-3.5" />
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

        {/* Recent Conversations Section */}
        {(!collapsed || isMobile) && (
          <SidebarGroup className="py-2 mt-1">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 h-5 flex items-center justify-between">
              <span>Recent Chats</span>
              {isLoadingChats && <span className="text-[9px] animate-pulse text-muted-foreground">Syncing...</span>}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-0.5 mt-1">
                {recentChats.length === 0 && !isLoadingChats ? (
                  <p className="px-2 py-1 text-[11px] text-muted-foreground/60 italic">No recent chats</p>
                ) : (
                  recentChats.slice(0, 15).map((chat) => {
                    const isSelected = currentChatId === chat.ID;
                    const isEditing = editingChatId === chat.ID;

                    return (
                      <div
                        key={chat.ID}
                        className={cn(
                          'group/chat flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer border border-transparent',
                          isSelected
                            ? 'bg-accent text-accent-foreground font-medium border-border/40 shadow-2xs'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                        )}
                      >
                        {isEditing ? (
                          <form
                            onSubmit={(e) => handleSaveRename(chat.ID, e)}
                            className="flex items-center gap-1 w-full"
                          >
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              autoFocus
                              className="w-full bg-background border border-primary/50 rounded px-1.5 py-0.5 text-xs focus:outline-hidden"
                            />
                            <button
                              type="submit"
                              className="text-primary hover:text-primary/80 p-0.5"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingChatId(null)}
                              className="text-muted-foreground hover:text-foreground p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </form>
                        ) : (
                          <>
                            <Link
                              href={`/chat?id=${chat.ID}`}
                              onClick={() => isMobile && setOpenMobile(false)}
                              className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1"
                            >
                              <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                              <span className="truncate">{chat.title || 'Untitled Chat'}</span>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="opacity-0 group-hover/chat:opacity-100 p-1 hover:bg-background/80 rounded-md transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem onClick={(e) => handleStartRename(chat, e)}>
                                  <Pencil className="mr-2 h-3.5 w-3.5" />
                                  <span>Rename</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={(e) => handleDeleteChat(chat.ID, e)}
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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

