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

import { Message } from "@/types/chat";
import { useMessageTree } from "@/hooks/use-message-tree";
import { useAppDispatch } from "@/store/hooks";
import { setSelectedVersion, clearSelectedVersion } from "@/store/features/chat/chatSlice";


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
    const activeChatLatestMessage = chatMessagesData && chatMessagesData.length > 0
      ? chatMessagesData[chatMessagesData.length - 1]?.content
      : '';
    const toPreviewExcerpt = (text: string, maxLength = 55) => {
      const normalized = text.replace(/\s+/g, ' ').trim();
      if (!normalized) return '';
      if (normalized.length <= maxLength) return normalized;
      return `${normalized.slice(0, maxLength - 3)}...`;
    };

    const resolvePreview = (chat: any, isActiveChat: boolean) => {
      if (isActiveChat && activeChatLatestMessage) {
        return toPreviewExcerpt(activeChatLatestMessage);
      }

      if (chat.preview || chat.Preview) {
        return toPreviewExcerpt(chat.preview || chat.Preview);
      }

      if (chat.lastMessage?.content || chat.lastMessageContent) {
        return toPreviewExcerpt(chat.lastMessage?.content || chat.lastMessageContent);
      }

      if (Array.isArray(chat.messages) && chat.messages.length > 0) {
        const latestMessage = chat.messages[chat.messages.length - 1];
        return toPreviewExcerpt(latestMessage?.content || latestMessage?.Content || '');
      }

      return '';
    };

    return chatsData.map((chat: any) => ({
      id: chat.ID || chat.id,
      title: chat.title || 'Untitled Chat',
      preview: resolvePreview(chat, (chat.ID || chat.id) === chatIdFromUrl) || 'No messages yet...',
      timestamp: new Date(chat.CreatedAt || chat.createdAt || Date.now()),
    }));
  }, [chatsData, chatIdFromUrl, chatMessagesData]);

  const selectedChatTitle = useMemo(() => {
    if (!chatIdFromUrl) return null;
    const activeChat = chatSessions.find((chat: { id: string }) => chat.id === chatIdFromUrl);
    return activeChat?.title || 'Untitled Chat';
  }, [chatIdFromUrl, chatSessions]);

  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const dispatch = useAppDispatch();

  // Clear optimistic messages when switching chats
  useEffect(() => {
    if (chatIdFromUrl && chatIdFromUrl === justCreatedChatIdRef.current) {
      justCreatedChatIdRef.current = null;
      return;
    }
    setOptimisticMessages([]);
  }, [chatIdFromUrl]);

  // Transform API messages to local format
  const apiMessages: Message[] = useMemo(() => {
    if (!chatIdFromUrl || !chatMessagesData) return [];
    return chatMessagesData.map((msg: any) => ({
      id: msg.ID || msg.id,
      role: msg.role,
      content: msg.content,
      position: msg.position,
      version: msg.version,
      createdAt: msg.CreatedAt || msg.createdAt,
    }));
  }, [chatIdFromUrl, chatMessagesData]);

  // Merge API and optimistic messages, removing duplicates
  const allMessages = useMemo(() => {
    const historyIds = new Set(apiMessages.map((m: Message) => m.id));
    const filteredOptimistic = optimisticMessages.filter(opt => {
      if (historyIds.has(opt.id)) return false;
      return !apiMessages.some(api =>
        api.position === opt.position &&
        api.role === opt.role &&
        api.version === opt.version
      );
    });
    return [...apiMessages, ...filteredOptimistic];
  }, [apiMessages, optimisticMessages]);

  const { thread: messages, getVersionInfo, selectVersion } = useMessageTree(
    allMessages,
    chatIdFromUrl || 'new'
  );

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const justCreatedChatIdRef = useRef<string | null>(null);
  const promptExamples = [
    {
      title: 'Social Content',
      description: 'Captions, posts, and threads for any platform.',
      icon: Share2,
    },
    {
      title: 'Media Ideas',
      description: 'Image prompts and visual content strategies.',
      icon: ImageIcon,
    },
    {
      title: 'Optimization',
      description: 'Refine your scripts to maximize engagement.',
      icon: Zap,
    },
    {
      title: 'Brand Voice',
      description: 'Maintain a consistent tone across all platforms.',
      icon: User,
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePromptExampleClick = (prompt: string) => {
    setInput(prompt);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const length = prompt.length;
      inputRef.current?.setSelectionRange(length, length);
    });
  };

  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (messages.length > prevMessagesLength.current) {
      scrollToBottom();
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent, editedContent?: string, overridePosition?: number) => {
    e.preventDefault();
    const content = editedContent || input;
    if (!content.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    const nextPosition = overridePosition !== undefined ? overridePosition : messages.length;

    // Calculate next optimistic version for this position
    const getNextVersion = (pos: number) => {
      const versions = allMessages.filter(m => m.position === pos).map(m => m.version);
      return versions.length > 0 ? Math.max(...versions) + 1 : 1;
    };

    const userVersion = getNextVersion(nextPosition);
    const assistantVersion = getNextVersion(nextPosition + 1);

    const optimisticMsgId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticMsgId,
      role: 'user',
      content: content.trim(),
      position: nextPosition,
      version: userVersion,
      createdAt: new Date().toISOString()
    };

    const assistantTempId = `temp-ast-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantTempId,
      role: 'assistant',
      content: '', // Empty while streaming
      position: nextPosition + 1,
      version: assistantVersion,
      createdAt: new Date().toISOString()
    };

    setOptimisticMessages(prev => [...prev, optimisticMsg, assistantMsg]);

    try {
      // Fallback: check window URL and local ref to avoid stale state/closures
      const urlParams = new URLSearchParams(window.location.search);
      let currentChatId = chatIdFromUrl || urlParams.get('chat') || justCreatedChatIdRef.current;

      // Secondary Fallback: If we have messages, we are in a chat. Use the chatId from the messages.
      if (!currentChatId && messages.length > 0) {
        currentChatId = messages[0].chatId || null;
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
        body: JSON.stringify({
          chatId: currentChatId,
          content: content.trim(),
          position: overridePosition
        }),
      });

      if (overridePosition !== undefined && currentChatId) {
        dispatch(clearSelectedVersion({ chatId: currentChatId, position: overridePosition }));
        dispatch(clearSelectedVersion({ chatId: currentChatId, position: overridePosition + 1 }));
      }
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
      await refetchChats();

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
    if (!chatIdFromUrl || regenerateMutation.isPending) return;

    setIsLoading(true);

    const assistantTempId = `temp-ast-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantTempId,
      role: 'assistant',
      content: '', // Empty while streaming
      position: message.position,
      version: message.version + 1, // Will be corrected by backend
    };

    setOptimisticMessages(prev => [...prev, assistantMsg]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/ai/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ chatId: chatIdFromUrl, position: message.position }),
      });

      dispatch(clearSelectedVersion({ chatId: chatIdFromUrl, position: message.position }));

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
      await refetchChats();

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
    const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
    await handleSubmit(fakeEvent, editContent, message.position);
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
                'fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transition-transform duration-300 ease-in-out',
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
              className="h-9 w-9 md:h-10 md:w-10 shrink-0 rounded-lg"
              title={chatSidebarOpen ? 'Collapse chat history' : 'Expand chat history'}
              aria-label={chatSidebarOpen ? 'Collapse chat history sidebar' : 'Expand chat history sidebar'}
            >
              {chatSidebarOpen ? (
                <PanelLeftClose className="h-4.5 w-4.5 md:h-5 md:w-5" />
              ) : (
                <PanelLeft className="h-4.5 w-4.5 md:h-5 md:w-5" />
              )}
            </Button>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4 md:h-4.5 md:w-4.5 text-primary shrink-0" />
                <span className="whitespace-normal break-words">
                  {selectedChatTitle || 'Content Creator'}
                </span>
              </h1>
              <p className="text-muted-foreground text-[10px] md:text-xs mt-0.5">
                Generate engaging content with AI assistance
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto rounded-xl border border-border bg-card/50 p-3 md:p-4 space-y-3 md:space-y-4">
            {messages.length === 0 && !streamingContent && !isLoading && (
              <div className="min-h-full flex flex-col items-center justify-start pt-12 md:pt-20 pb-8 md:pb-12 px-4 text-center">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">
                  How can I help you today?
                </h2>
                <p className="text-muted-foreground max-w-sm mb-8 text-sm">
                  I&apos;m your AI creative partner for social media and content generation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-2">
                  {promptExamples.map((example) => {
                    const Icon = example.icon;
                    return (
                      <button
                        key={example.title}
                        type="button"
                        onClick={() => handlePromptExampleClick(example.description)}
                        className="p-5 rounded-xl border border-border/80 bg-card/30 hover:bg-primary/[0.04] hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-sm">{example.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground/90 whitespace-normal leading-relaxed">
                          {example.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex flex-col gap-1 md:gap-1.5 animate-slide-up group/msg',
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
                      'group relative max-w-[85%] sm:max-w-[75%] rounded-2xl py-2 px-3.5 md:py-2.5 md:px-4.5',
                      message.role === 'assistant'
                        ? 'bg-muted/40'
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
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content || (message.role === 'assistant' && isLoading && (
                          <div className="flex gap-1 py-2">
                            <div
                              className="h-2 w-2 rounded-full bg-white animate-bounce"
                              style={{ animationDelay: '0ms' }}
                            />
                            <div
                              className="h-2 w-2 rounded-full bg-white animate-bounce"
                              style={{ animationDelay: '150ms' }}
                            />
                            <div
                              className="h-2 w-2 rounded-full bg-white animate-bounce"
                              style={{ animationDelay: '300ms' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bar (outside of bubble) */}
                {editingMessageId !== message.id && (
                  <div className={cn(
                    "flex items-center gap-1 mt-1 opacity-0 group-hover/msg:opacity-100 transition-opacity min-h-[24px]",
                    message.role === 'user' ? "mr-[40px] md:mr-[44px]" : "ml-[40px] md:ml-[44px]"
                  )}>
                    {/* Version Nav (Only for Assistant) */}
                    {message.role === 'assistant' && (() => {
                      const info = getVersionInfo(message);
                      if (info.total <= 1) return null;

                      return (
                        <div className="flex items-center text-[10px] text-muted-foreground mr-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => selectVersion(message, 'prev')}
                            disabled={!info.hasPrev}
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          <span className="font-bold whitespace-nowrap px-1 text-foreground">
                            {info.current}
                            <span className="text-muted-foreground font-normal">/{info.total}</span>
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => selectVersion(message, 'next')}
                            disabled={!info.hasNext}
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
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(message.content)}
                          title="Copy"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="Good Response"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="Bad Response"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="Export"
                        >
                          <Upload className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRegenerate(message)}
                          disabled={isLoading}
                          title="Regenerate"
                        >
                          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="More"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    {/* User Utilities */}
                    {message.role === 'user' && message.id !== 'welcome' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 md:h-6 md:w-6 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        onClick={() => startEditing(message)}
                        title="Edit message"
                      >
                        <Edit2 className="h-3.5 w-3.5 md:h-3 md:w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}


            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="mt-3 md:mt-4">
            <div className="relative flex items-end gap-1 md:gap-2 bg-card border border-border rounded-xl p-2 shadow-card focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Textarea
                ref={inputRef}
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
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
