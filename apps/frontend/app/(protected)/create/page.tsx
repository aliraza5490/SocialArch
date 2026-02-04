'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  RefreshCw,
  User,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ChatHistorySidebar } from '@/components/chat/ChatHistorySidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CreatePage() {
  const isMobile = useIsMobile();
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);

  useEffect(() => {
    // Only open by default on desktop once we are SURE it's desktop
    if (isMobile === false) {
      setChatSidebarOpen(true);
    }
  }, [isMobile]);
  const [activeSessionId, setActiveSessionId] = useState('1');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your AI content assistant. I can help you generate engaging content for social media, videos, blogs, and more. What would you like to create today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        'Here\'s a compelling social media post for your brand:\n\n"🚀 Ready to transform your workflow? Our latest update brings game-changing features that will boost your productivity by 200%!\n\n✨ Smart automation\n📊 Real-time analytics\n🎯 Personalized insights\n\nTry it free today! Link in bio. #Productivity #Innovation #Tech"',
        'I\'ve crafted this engaging video script for you:\n\n**HOOK (0-3s):** "What if I told you there\'s a better way?"\n\n**PROBLEM (3-10s):** Show the frustration of manual content creation\n\n**SOLUTION (10-25s):** Introduce your AI-powered platform with smooth transitions\n\n**CTA (25-30s):** "Start creating in seconds. Try it free!"',
        "Here's a catchy caption for your Instagram post:\n\n\"Behind every great brand is a great story ✨\n\nOurs started in a tiny apartment with one laptop and a dream to make content creation accessible to everyone.\n\nToday, we're helping 10,000+ creators bring their visions to life.\n\nWhat's your story? Share below 👇\"",
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const regenerate = () => {
    toast.info('Regenerating response...');
    // In a real app, this would trigger a new AI response
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content:
          "Hello! I'm your AI content assistant. What would you like to create today?",
        timestamp: new Date(),
      },
    ]);
    toast.success('Started new chat');
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
                onSelectChat={(id) => setActiveSessionId(id)}
                activeSessionId={activeSessionId}
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
            onSelectChat={(id) => setActiveSessionId(id)}
            activeSessionId={activeSessionId}
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
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>

                  {message.role === 'assistant' && (
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
                        onClick={() => regenerate()}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
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
