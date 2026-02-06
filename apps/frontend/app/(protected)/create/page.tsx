'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Send,
  Sparkles,
  Copy,
  RefreshCw,
  User,
  PanelLeftClose,
  PanelLeft,
  Edit2,
  X,
  Check,
  Share2,
  Image as ImageIcon,
  Zap,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Upload,
  MoreHorizontal,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ChatHistorySidebar } from '@/components/chat/ChatHistorySidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChats, useDeleteChat, useUpdateChat, useChatMessages, useRegenerateResponse } from '@/hooks/use-chat-api';

interface Message {
  id: string;
  ID?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  parentMessageId?: string | null;
  chatId?: string;
}


export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get('chat');
  
  const isMobile = useIsMobile();
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);

  // Fetch real chats from API
  const { data: chatsData, refetch: refetchChats } = useChats();
  const deleteChat = useDeleteChat();
  const updateChat = useUpdateChat();
  const regenerateMutation = useRegenerateResponse();

  // Load messages for the current chat
  const { data: chatMessagesData, refetch: refetchMessages } = useChatMessages(chatIdFromUrl || '');

  // Transform API data to ChatSession format
  const chatSessions = useMemo(() => {
    if (!chatsData) return [];
    return chatsData.map((chat: any) => ({
      id: chat.ID || chat.id,
      title: chat.title || 'Untitled Chat',
      preview: chat.preview || 'No messages yet...',
      timestamp: new Date(chat.CreatedAt || chat.createdAt || Date.now()),
    }));
  }, [chatsData]);

  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  // Track active version for each branch point (parentMessageId -> childMessageId)
  const [activeVersions, setActiveVersions] = useState<Record<string, string>>({});

  // Clear optimistic messages and versions when switching chats
  useEffect(() => {
    // If we just created this chat (transitioning from null -> new ID), 
    // don't clear the optimistic messages we just added.
    if (chatIdFromUrl && chatIdFromUrl === justCreatedChatIdRef.current) {
      justCreatedChatIdRef.current = null; // Reset for next time
      return;
    }
    setOptimisticMessages([]);
    setActiveVersions({});
  }, [chatIdFromUrl]);

  // Transform API messages to local format
  const allMessages: Message[] = useMemo(() => {
    const apiMessages: Message[] = (!chatIdFromUrl || !chatMessagesData || chatMessagesData.length === 0) 
      ? [] 
      : chatMessagesData.map((msg: any) => ({
          id: msg.ID || msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.CreatedAt || msg.createdAt || Date.now()),
          parentMessageId: msg.parentMessageId,
          chatId: (msg.chatId || msg.chatID || chatIdFromUrl) ?? undefined,
        }));

    // Create a mapping of optimistic IDs that have been replaced by API messages
    const mapping = new Map<string, string>();
    optimisticMessages.forEach(opt => {
      const match = apiMessages.find(api => 
        api.role === opt.role && api.content === opt.content
      );
      if (match) mapping.set(opt.id, match.id);
    });

    // Merge API messages with optimistic ones
    const filteredOptimistic = optimisticMessages.filter(
      optMsg => !apiMessages.some((apiMsg: Message) => 
        apiMsg.id === optMsg.id || (apiMsg.role === optMsg.role && apiMsg.content === optMsg.content)
      )
    );

    // Normalize parentMessageId for all messages to use the mapped API ID if available
    return [...apiMessages, ...filteredOptimistic].map(msg => {
      if (msg.parentMessageId && mapping.has(msg.parentMessageId)) {
        return { ...msg, parentMessageId: mapping.get(msg.parentMessageId)! };
      }
      return msg;
    });
  }, [chatIdFromUrl, chatMessagesData, optimisticMessages]);

  const messagesMap = useMemo(() => new Map(allMessages.map(m => [m.id, m])), [allMessages]);

  // Derived messages for the current active branch
  const messages = useMemo(() => {
    if (allMessages.length === 0) return [];

    const result: Message[] = [];
    const messagesByParent = new Map<string, Message[]>();
    
    allMessages.forEach(msg => {
      const parentId = msg.parentMessageId || 'root';
      if (!messagesByParent.has(parentId)) {
        messagesByParent.set(parentId, []);
      }
      messagesByParent.get(parentId)!.push(msg);
    });

    // Traverse from root following active versions
    let currentParentId = 'root';
    while (true) {
      const versions = messagesByParent.get(currentParentId);
      if (!versions || versions.length === 0) break;

      // Select active version: either from state or the last one (most recent)
      let activeId = activeVersions[currentParentId];
      let activeMsg = activeId ? versions.find(m => m.id === activeId) : null;
      
      if (!activeMsg) {
        // Default to latest version if not set or not found
        activeMsg = versions[versions.length - 1];
      }

      result.push(activeMsg);
      currentParentId = activeMsg.id;
    }

    return result;
  }, [allMessages, activeVersions]);

  // Helper to get versions for a parent
  const getVersions = (parentMessageId: string | null | undefined) => {
    const parentId = parentMessageId || 'root';
    return allMessages.filter(m => (m.parentMessageId || 'root') === parentId);
  };

  const setVersion = (parentMessageId: string | null | undefined, messageId: string) => {
    const parentId = parentMessageId || 'root';
    setActiveVersions(prev => ({ ...prev, [parentId]: messageId }));
  };

  // Editing state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (isMobile === false) {
      setChatSidebarOpen(true);
    }
  }, [isMobile]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const justCreatedChatIdRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent, editedContent?: string, overrideParentId?: string | null) => {
    e.preventDefault();
    const content = editedContent || input;
    if (!content.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    const lastMessageInBranch = messages[messages.length - 1];
    const optimisticMsgId = `temp-${Date.now()}`;
    const parentId = overrideParentId !== undefined ? overrideParentId : (lastMessageInBranch ? lastMessageInBranch.id : null);
    
    const optimisticMsg: Message = {
      id: optimisticMsgId,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      parentMessageId: parentId,
    };

    const assistantTempId = `temp-ast-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantTempId,
      role: 'assistant',
      content: '', // Empty while streaming
      timestamp: new Date(),
      parentMessageId: optimisticMsgId,
    };

    setOptimisticMessages(prev => [...prev, optimisticMsg, assistantMsg]);

    // Update active version for the parent to point to this new message
    setActiveVersions(prev => ({ 
      ...prev, 
      [parentId || 'root']: optimisticMsgId,
      [optimisticMsgId]: assistantTempId
    }));

    try {
      // Fallback: check window URL and local ref to avoid stale state/closures
      const urlParams = new URLSearchParams(window.location.search);
      let currentChatId = chatIdFromUrl || urlParams.get('chat') || justCreatedChatIdRef.current;
      
      // Secondary Fallback: If we have messages, we are in a chat. Use the chatId from the messages.
      if (!currentChatId && messages.length > 0) {
        currentChatId = messages[0].chatId;
      }
      
      // Create a new chat if we don't have one
      if (!currentChatId) {
        const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ title: content.trim().slice(0, 50) }),
        });
        if (createResponse.ok) {
          const chat = await createResponse.json();
          currentChatId = chat.ID;
          justCreatedChatIdRef.current = currentChatId; // Mark this ID as "just created" to prevent clearing state
          router.push(`/create?chat=${currentChatId}`);
          await refetchChats();
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ chatId: currentChatId, content: content.trim(), parentMessageId: parentId }),
      });
      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
        
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              // Update optimistic message content directly
              setOptimisticMessages(prev => prev.map(m => 
                m.id === assistantTempId ? { ...m, content: fullContent } : m
              ));
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
      
      // Refresh messages to get real IDs from server
      await refetchMessages();

      // Add assistant response to optimistic messages instead of refetching
      // The assistant message was already added, now its content is finalized.
      // No need to add a new message, just ensure the content is updated.
      // The previous streaming updates already handled this.
    } catch (error) {
      // Remove optimistic messages on error (e.g. 500)
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== optimisticMsgId && msg.id !== assistantTempId));
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (message: Message) => {
    if (!chatIdFromUrl || !message.parentMessageId || regenerateMutation.isPending) return;
    
    setIsLoading(true);

    const assistantTempId = `temp-ast-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantTempId,
      role: 'assistant',
      content: '', // Empty while streaming
      timestamp: new Date(),
      parentMessageId: message.parentMessageId,
    };

    setOptimisticMessages(prev => [...prev, assistantMsg]);
    setActiveVersions(prev => ({ ...prev, [message.parentMessageId || 'root']: assistantTempId }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/ai/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ chatId: chatIdFromUrl, parentMessageId: message.parentMessageId }),
      });

      if (!response.ok) throw new Error('Failed to regenerate');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
        
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              // Update optimistic message content directly
              setOptimisticMessages(prev => prev.map(m => 
                m.id === assistantTempId ? { ...m, content: fullContent } : m
              ));
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
      
      // Refresh messages to get real IDs from server
      await refetchMessages();

      toast.success('Response regenerated');
    } catch (error) {
      toast.error('Failed to regenerate response');
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== assistantTempId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (message: Message) => {
    if (!editContent.trim() || !chatIdFromUrl) return;
    
    setEditingMessageId(null);
    // For edit, we'll send a new message with the edited content
    // This creates a new branch in the conversation
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent, editContent, message.parentMessageId);
    setEditContent('');
  };

  const startEditing = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const handleNewChat = () => {
    router.push('/create');
    toast.success('Started new chat');
  };

  const handleSelectChat = (id: string) => {
    router.push(`/create?chat=${id}`);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex animate-fade-in overflow-hidden rounded-2xl md:border md:border-border bg-card/20">
        {/* Mobile: Chat History as Side Drawer */}
        {isMobile && (
          <>
            {/* Backdrop */}
            <div
              className={cn(
                'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
                chatSidebarOpen
                  ? 'opacity-100'
                  : 'opacity-0 pointer-events-none',
              )}
              onClick={() => setChatSidebarOpen(false)}
            />
            {/* Drawer */}
            <div
              className={cn(
                'fixed inset-y-0 left-0 z-50 w-80 bg-background border-r border-border transition-transform duration-300 ease-in-out',
                chatSidebarOpen ? 'translate-x-0' : '-translate-x-full',
              )}
            >
              <ChatHistorySidebar
                isOpen={chatSidebarOpen}
                onToggle={() => setChatSidebarOpen(false)}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onDeleteChat={async (id) => {
                  try {
                    await deleteChat.mutateAsync(id);
                    toast.success('Chat deleted');
                    if (chatIdFromUrl === id) router.push('/create');
                  } catch { toast.error('Failed to delete chat'); }
                }}
                onUpdateTitle={async (id, title) => {
                  try {
                    await updateChat.mutateAsync({ id, title });
                    toast.success('Title updated');
                  } catch { toast.error('Failed to update title'); }
                }}
                sessions={chatSessions}
                activeSessionId={chatIdFromUrl || undefined}
                isMobileOverlay={true}
              />
            </div>
          </>
        )}

        {/* Desktop: Chat History Sidebar */}
        {!isMobile && (
          <ChatHistorySidebar
            isOpen={chatSidebarOpen}
            onToggle={() => setChatSidebarOpen(!chatSidebarOpen)}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={async (id) => {
              try {
                await deleteChat.mutateAsync(id);
                toast.success('Chat deleted');
                if (chatIdFromUrl === id) router.push('/create');
              } catch { toast.error('Failed to delete chat'); }
            }}
            onUpdateTitle={async (id, title) => {
              try {
                await updateChat.mutateAsync({ id, title });
                toast.success('Title updated');
              } catch { toast.error('Failed to update title'); }
            }}
            sessions={chatSessions}
            activeSessionId={chatIdFromUrl || undefined}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col md:p-6 relative">
          {/* Header */}
          <div className="mb-3 md:mb-4 flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatSidebarOpen(!chatSidebarOpen)}
              className="h-8 w-8 shrink-0"
            >
              {chatSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />
                <span className="truncate">Content Creator</span>
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm mt-1">
                Generate engaging content with AI assistance
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto rounded-xl border border-border bg-card/50 p-3 md:p-4 space-y-3 md:space-y-4">
            {messages.length === 0 && !streamingContent && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">
                  How can I help you today?
                </h2>
                <p className="text-muted-foreground max-w-sm mb-6 text-sm">
                  I'm your AI creative partner for social media and content generation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl px-2">
                  <div className="p-3 rounded-lg border border-border bg-card/30 hover:bg-card/50 transition-colors text-left group">
                    <div className="flex items-center gap-2 mb-1">
                      <Share2 className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Social Content</h3>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-normal leading-relaxed">
                      Captions, posts, and threads for any platform.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card/30 hover:bg-card/50 transition-colors text-left group">
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Media Ideas</h3>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-normal leading-relaxed">
                      Image prompts and visual content strategies.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card/30 hover:bg-card/50 transition-colors text-left group">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Optimization</h3>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-normal leading-relaxed">
                      Refine your scripts to maximize engagement.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card/30 hover:bg-card/50 transition-colors text-left group">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Brand Voice</h3>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-normal leading-relaxed">
                      Maintain a consistent tone across all platforms.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex flex-col gap-2 md:gap-3 animate-slide-up',
                  message.role === 'user' ? 'items-end' : 'items-start',
                )}
              >
                <div
                  className={cn(
                    'flex gap-2 md:gap-3 w-full',
                    message.role === 'user' && 'flex-row-reverse',
                  )}
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                      message.role === 'assistant'
                        ? 'gradient-primary shadow-glow'
                        : 'bg-muted',
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <Sparkles className={cn("h-4 w-4 text-primary-foreground", (isLoading && !message.content) && "animate-pulse")} />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <div
                    className={cn(
                      'group relative max-w-[85%] sm:max-w-[75%] rounded-xl p-3 md:p-4',
                      message.role === 'assistant'
                        ? 'bg-muted/50'
                        : 'bg-primary text-primary-foreground',
                    )}
                  >
                    {/* Edit Mode */}
                    {editingMessageId === message.id && message.role === 'user' ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[60px] bg-background/50 text-foreground"
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={cancelEditing}>
                            <X className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                          <Button size="sm" onClick={() => handleEditSubmit(message)}>
                            <Check className="h-3 w-3 mr-1" /> Send
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content || (message.role === 'assistant' && isLoading && (
                            <div className="flex gap-1 py-2">
                              <div
                                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: '0ms' }}
                              />
                              <div
                                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: '150ms' }}
                              />
                              <div
                                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: '300ms' }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Actions Bar */}
                        <div className="flex items-center gap-1 mt-2 md:mt-3 opacity-0 group-hover:opacity-100 transition-opacity min-h-[32px]">
                          {/* Version Nav (Only for Assistant) */}
                          {message.role === 'assistant' && (() => {
                            const siblings = getVersions(message.parentMessageId);
                            const parentMsg = messagesMap.get(message.parentMessageId || '');
                            const parentSiblings = parentMsg ? getVersions(parentMsg.parentMessageId) : [];
                            
                            const navSiblings = siblings.length > 1 ? siblings : (parentSiblings.length > 1 ? parentSiblings : []);
                            const navParentId = siblings.length > 1 ? (message.parentMessageId || 'root') : (parentMsg?.parentMessageId || 'root');
                            const navActiveId = siblings.length > 1 ? message.id : (parentMsg?.id || '');
                            
                            if (navSiblings.length <= 1) return null;
                            
                            const currentIndex = navSiblings.findIndex(v => v.id === navActiveId);
                            
                            return (
                              <div className="flex items-center text-xs text-muted-foreground mr-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    if (currentIndex > 0) {
                                      setVersion(navParentId, navSiblings[currentIndex - 1].id);
                                    }
                                  }}
                                  disabled={currentIndex <= 0}
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <span className="font-bold whitespace-nowrap px-1 text-foreground">
                                  {currentIndex + 1}
                                  <span className="text-muted-foreground font-normal">/{navSiblings.length}</span>
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    if (currentIndex < navSiblings.length - 1) {
                                      setVersion(navParentId, navSiblings[currentIndex + 1].id);
                                    }
                                  }}
                                  disabled={currentIndex >= navSiblings.length - 1}
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            );
                          })()}

                          {/* Assistant Utilities */}
                          {message.role === 'assistant' && message.id !== 'welcome' && (
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => copyToClipboard(message.content)}
                                title="Copy"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                title="Good Response"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                title="Bad Response"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                title="Export"
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => handleRegenerate(message)}
                                disabled={isLoading || !message.parentMessageId}
                                title="Regenerate"
                              >
                                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                title="More"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {/* User Utilities */}
                          {message.role === 'user' && message.id !== 'welcome' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 md:h-7 px-3 md:px-2 text-sm md:text-xs text-primary-foreground hover:bg-primary-foreground/10"
                              onClick={() => startEditing(message)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}


            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="mt-3 md:mt-4">
            <div className="relative flex items-end gap-1 md:gap-2 bg-card border border-border rounded-xl p-2 shadow-card focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Describe the content you want to create..."
                className="min-h-[56px] md:min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base md:text-sm"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="shrink-0 h-11 w-11 md:h-10 md:w-10 rounded-lg gradient-primary shadow-glow hover:opacity-90 transition-opacity"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift + Enter for new line
            </p>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
