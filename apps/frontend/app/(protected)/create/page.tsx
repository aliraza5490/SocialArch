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

  // Clear optimistic messages when switching chats
  useEffect(() => {
    setOptimisticMessages([]);
  }, [chatIdFromUrl]);

  // Transform API messages to local format
  const messages: Message[] = useMemo(() => {
    const apiMessages: Message[] = (!chatIdFromUrl || !chatMessagesData || chatMessagesData.length === 0) 
      ? [] 
      : chatMessagesData.map((msg: any) => ({
          id: msg.ID || msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.CreatedAt || msg.createdAt || Date.now()),
          parentMessageId: msg.parentMessageId,
        }));

    // Merge API messages with optimistic ones
    // We filter out any optimistic messages that have been received from the API (deduplication)
    const filteredOptimistic = optimisticMessages.filter(
      optMsg => !apiMessages.some((apiMsg: Message) => 
        apiMsg.role === optMsg.role && 
        apiMsg.content === optMsg.content
      )
    );
    return [...apiMessages, ...filteredOptimistic];
  }, [chatIdFromUrl, chatMessagesData, optimisticMessages]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent, editedContent?: string) => {
    e.preventDefault();
    const content = editedContent || input;
    if (!content.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    // Add optimistic message
    const optimisticMsgId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticMsgId,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setOptimisticMessages(prev => [...prev, optimisticMsg]);

    try {
      let currentChatId = chatIdFromUrl;
      
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
        body: JSON.stringify({ chatId: currentChatId, content: content.trim() }),
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
              setStreamingContent(fullContent);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Add assistant response to optimistic messages instead of refetching
      const assistantMsg: Message = {
        id: `temp-ast-${Date.now()}`,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date(),
      };
      setOptimisticMessages(prev => [...prev, assistantMsg]);
      setStreamingContent('');
    } catch (error) {
      // Remove optimistic message on error (e.g. 500)
      setOptimisticMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (message: Message) => {
    if (!chatIdFromUrl || !message.parentMessageId || regenerateMutation.isPending) return;
    
    setIsLoading(true);
    setStreamingContent('');

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
              setStreamingContent(fullContent);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Add assistant response to optimistic messages instead of refetching
      const assistantMsg: Message = {
        id: `temp-ast-${Date.now()}`,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date(),
      };
      setOptimisticMessages(prev => [...prev, assistantMsg]);
      setStreamingContent('');
      toast.success('Response regenerated');
    } catch (error) {
      toast.error('Failed to regenerate response');
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
    await handleSubmit(fakeEvent, editContent);
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
                  'flex gap-2 md:gap-3 animate-slide-up',
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
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
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
                        {message.content}
                      </div>

                      {/* User Actions - Edit */}
                      {message.role === 'user' && message.id !== 'welcome' && (
                        <div className="flex gap-1 mt-2 md:mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 md:h-7 px-3 md:px-2 text-sm md:text-xs"
                            onClick={() => startEditing(message)}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      )}

                      {/* Assistant Actions - Copy & Regenerate */}
                      {message.role === 'assistant' && message.id !== 'welcome' && (
                        <div className="flex gap-1 mt-2 md:mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 md:h-7 px-3 md:px-2 text-sm md:text-xs"
                            onClick={() => copyToClipboard(message.content)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 md:h-7 px-3 md:px-2 text-sm md:text-xs"
                            onClick={() => handleRegenerate(message)}
                            disabled={isLoading || !message.parentMessageId}
                          >
                            <RefreshCw className={cn("h-3 w-3 mr-1", isLoading && "animate-spin")} />
                            Regenerate
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Streaming Response */}
            {streamingContent && (
              <div className="flex gap-2 md:gap-3 animate-slide-up">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted/50 rounded-xl p-3 md:p-4 max-w-[85%] sm:max-w-[75%]">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {streamingContent}
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && !streamingContent && (
              <div className="flex gap-2 md:gap-3 animate-slide-up">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex gap-1">
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
                </div>
              </div>
            )}

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
