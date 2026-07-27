'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Plus,
  Mic,
  AudioLines,
  ArrowUp,
  Square,
  Copy,
  Check,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Share2,
  RotateCcw,
  MoreHorizontal,
  Sparkles,
  Megaphone,
  BarChart3,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TooltipIconButton } from '@/components/tooltip-icon-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatService, ChatMessage } from '@/lib/services/chat.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  {
    title: 'Create Campaign',
    desc: 'Plan a 7-day social media launch campaign for a new product.',
    icon: Megaphone,
  },
  {
    title: 'Draft Captions',
    desc: 'Write 5 engaging Instagram captions with hashtags.',
    icon: FileText,
  },
  {
    title: 'Audience Strategy',
    desc: 'Analyze target audience demographics & engagement tactics.',
    icon: BarChart3,
  },
  {
    title: 'Content Ideas',
    desc: 'Brainstorm viral short-form video concepts for TikTok & Reels.',
    icon: Sparkles,
  },
];

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeChatId = searchParams.get('id');

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [selectedVersions, setSelectedVersions] = React.useState<Record<number, number>>({});
  const [input, setInput] = React.useState('');
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);
  const [isRunning, setIsRunning] = React.useState(false);
  const [copiedMsgId, setCopiedMsgId] = React.useState<string | number | null>(null);
  const [feedback, setFeedback] = React.useState<Record<number, 'up' | 'down'>>({});
  
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Group messages by position to eliminate duplicate bubbles for regenerated messages
  const positionGroups = React.useMemo(() => {
    const groupsMap = new Map<number, { position: number; role: 'user' | 'assistant'; versions: ChatMessage[] }>();

    for (const msg of messages) {
      const pos = msg.position ?? 0;
      if (!groupsMap.has(pos)) {
        groupsMap.set(pos, {
          position: pos,
          role: msg.role,
          versions: [],
        });
      }
      groupsMap.get(pos)!.versions.push(msg);
    }

    const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => a.position - b.position);

    sortedGroups.forEach((g) => {
      g.versions.sort((a, b) => (a.version || 1) - (b.version || 1));
    });

    return sortedGroups;
  }, [messages]);

  // Auto-scroll to bottom
  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load chat messages when activeChatId changes
  React.useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      setSelectedVersions({});
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoadingHistory(true);
        const data = await chatService.getChatMessages(activeChatId);
        setMessages(data || []);
        setSelectedVersions({});
      } catch (err) {
        console.error('Failed to load messages:', err);
        toast.error('Failed to load chat history');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadMessages();
  }, [activeChatId]);

  // Auto resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Stop/Cancel running stream
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
  };

  // Send message
  const handleSend = async (overrideContent?: string) => {
    const text = (overrideContent ?? input).trim();
    if (!text || isRunning) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const currentPosition = positionGroups.length > 0 ? positionGroups[positionGroups.length - 1].position + 1 : 0;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      position: currentPosition,
      version: 1,
    };

    const assistantPosition = currentPosition + 1;
    const initialAssistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      position: assistantPosition,
      version: 1,
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setIsRunning(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let currentChatId = activeChatId;

    try {
      await chatService.sendMessageStream({
        chatId: activeChatId || undefined,
        content: text,
        newChat: !activeChatId,
        position: currentPosition,
        signal: controller.signal,
        onChatIdCreated: (newId) => {
          if (!currentChatId) {
            currentChatId = newId;
            router.push(`/chat?id=${newId}`);
            window.dispatchEvent(new Event('refresh-recent-chats'));
          }
        },
        onChunk: (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (
              lastIndex >= 0 &&
              updated[lastIndex].position === assistantPosition &&
              updated[lastIndex].role === 'assistant'
            ) {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: updated[lastIndex].content + chunk,
              };
            }
            return updated;
          });
        },
      });
      window.dispatchEvent(new Event('refresh-recent-chats'));
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Streaming error:', err);
        toast.error('Error sending message');
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  // Handle Regenerate
  const handleRegenerate = async (position: number) => {
    if (!activeChatId || isRunning) return;

    setIsRunning(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const existingVersions = messages.filter((m) => m.position === position);
    const maxVersion = existingVersions.reduce((max, m) => Math.max(max, m.version || 1), 0);
    const newVersionNumber = maxVersion + 1;

    const newAssistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      position,
      version: newVersionNumber,
    };

    setMessages((prev) => [...prev, newAssistantMessage]);
    setSelectedVersions((prev) => ({ ...prev, [position]: existingVersions.length }));

    try {
      await chatService.regenerateMessageStream({
        chatId: activeChatId,
        position,
        signal: controller.signal,
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.position === position && (msg.version || 1) === newVersionNumber
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Regenerate error:', err);
        toast.error('Error regenerating response');
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  // Copy helper
  const handleCopy = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Toggle feedback
  const handleFeedback = (pos: number, type: 'up' | 'down') => {
    setFeedback((prev) => ({
      ...prev,
      [pos]: prev[pos] === type ? undefined! : type,
    }));
    toast.success(type === 'up' ? 'Feedback submitted (Good response)' : 'Feedback submitted (Bad response)');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = positionGroups.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-background text-foreground relative overflow-hidden font-sans">
      {/* Messages / Viewport Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 max-w-4xl w-full mx-auto flex flex-col">
        {isLoadingHistory ? (
          <div className="flex h-full w-full items-center justify-center my-auto py-20 text-muted-foreground gap-2 text-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading conversation...</span>
          </div>
        ) : isEmpty ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center min-h-[65vh] text-center max-w-2xl w-full mx-auto px-2 space-y-7 animate-in fade-in duration-300">
            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Where should we begin?
            </h1>

            {/* Centered Composer Surface matching theme */}
            <div className="w-full rounded-full border border-border bg-card shadow-md px-4 py-2.5 transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
              <div className="flex items-center gap-3">
                {/* Plus Attachment Icon */}
                <TooltipIconButton
                  tooltip="Add photos & files"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5"
                  onClick={() => toast.info('Attachments option selected')}
                >
                  <Plus className="h-4 w-4" />
                </TooltipIconButton>

                {/* Input Field */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask anything"
                  className="flex-1 bg-transparent border-0 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-hidden"
                />

                {/* Action Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {isRunning ? (
                    <TooltipIconButton
                      tooltip="Stop responding"
                      className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                      onClick={handleCancel}
                    >
                      <Square className="h-3.5 w-3.5 fill-current" />
                    </TooltipIconButton>
                  ) : input.trim().length > 0 ? (
                    <TooltipIconButton
                      tooltip="Send prompt"
                      className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                      onClick={() => handleSend()}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </TooltipIconButton>
                  ) : (
                    <>
                      <TooltipIconButton
                        tooltip="Dictate"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5"
                        onClick={() => toast.info('Dictate option selected')}
                      >
                        <Mic className="h-4 w-4" />
                      </TooltipIconButton>

                      <TooltipIconButton
                        tooltip="Use voice mode"
                        className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 p-1.5 shadow-xs"
                        onClick={() => toast.info('Voice mode option selected')}
                      >
                        <AudioLines className="h-4 w-4" />
                      </TooltipIconButton>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Example Queries directly below composer */}
            <div className="w-full pt-2 max-w-2xl mx-auto">
              <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider mb-3 text-center">
                Example Queries
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => handleSend(item.desc)}
                    className="flex flex-col justify-between items-start text-left p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/80 hover:border-primary/40 transition-all cursor-pointer shadow-xs group h-full space-y-2.5"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform shrink-0">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate">{item.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Thread Messages Grouped by Position */
          <div className="space-y-6 pb-24">
            {positionGroups.map((group) => {
              const activeVersionIndex =
                selectedVersions[group.position] !== undefined
                  ? Math.min(selectedVersions[group.position], group.versions.length - 1)
                  : group.versions.length - 1;

              const msg = group.versions[activeVersionIndex] || group.versions[group.versions.length - 1];
              const msgId = msg?.ID || `${group.position}-${msg?.version || activeVersionIndex}`;
              const isUser = group.role === 'user';
              const hasMultipleVersions = group.versions.length > 1;

              return (
                <div
                  key={group.position}
                  className={cn(
                    'flex flex-col space-y-1.5 group',
                    isUser ? 'items-end' : 'items-start'
                  )}
                >
                  {isUser ? (
                    /* User Bubble & Hover Actions */
                    <div className="flex flex-col items-end gap-1.5 max-w-[85%] md:max-w-[75%]">
                      <div className="rounded-[22px] bg-primary text-primary-foreground font-medium px-4 py-2.5 text-sm leading-relaxed shadow-xs whitespace-pre-wrap">
                        {msg.content}
                      </div>

                      {/* User Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {hasMultipleVersions && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <TooltipIconButton
                              tooltip="Previous version"
                              disabled={activeVersionIndex === 0}
                              className="h-7 w-7 p-1 hover:bg-muted hover:text-foreground disabled:opacity-30"
                              onClick={() =>
                                setSelectedVersions((prev) => ({
                                  ...prev,
                                  [group.position]: Math.max(0, activeVersionIndex - 1),
                                }))
                              }
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </TooltipIconButton>

                            <span className="text-xs font-medium text-muted-foreground px-1 select-none">
                              {activeVersionIndex + 1} / {group.versions.length}
                            </span>

                            <TooltipIconButton
                              tooltip="Next version"
                              disabled={activeVersionIndex === group.versions.length - 1}
                              className="h-7 w-7 p-1 hover:bg-muted hover:text-foreground disabled:opacity-30"
                              onClick={() =>
                                setSelectedVersions((prev) => ({
                                  ...prev,
                                  [group.position]: Math.min(group.versions.length - 1, activeVersionIndex + 1),
                                }))
                              }
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </TooltipIconButton>
                          </div>
                        )}

                        <TooltipIconButton
                          tooltip="Copy"
                          className="h-7 w-7 p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          onClick={() => handleCopy(msg.content, msgId)}
                        >
                          {copiedMsgId === msgId ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </TooltipIconButton>
                        <TooltipIconButton
                          tooltip="Edit"
                          className="h-7 w-7 p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          onClick={() => setInput(msg.content)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </TooltipIconButton>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Message & Action Bar */
                    <div className="flex items-start gap-3 w-full max-w-full">
                      <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Image
                          src="/logo.png"
                          alt="SocialArch AI"
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                      </div>

                      <div className="flex-1 space-y-2 overflow-hidden min-w-0">
                        <div className="prose dark:prose-invert prose-sm max-w-none text-foreground leading-relaxed break-words font-sans">
                          {msg.content ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs animate-pulse py-1">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Thinking...</span>
                            </div>
                          )}
                        </div>

                        {/* Always-visible Assistant Action Bar with Version Selector */}
                        {msg.content && (
                          <div className="flex items-center gap-0.5 pt-1 text-muted-foreground flex-wrap">
                            {/* Version Controls (< 1 / 2 >) matching other action buttons */}
                            {hasMultipleVersions && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <TooltipIconButton
                                  tooltip="Previous version"
                                  disabled={activeVersionIndex === 0}
                                  className="h-7 w-7 p-1 hover:bg-muted hover:text-foreground disabled:opacity-30"
                                  onClick={() =>
                                    setSelectedVersions((prev) => ({
                                      ...prev,
                                      [group.position]: Math.max(0, activeVersionIndex - 1),
                                    }))
                                  }
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </TooltipIconButton>

                                <span className="text-xs font-medium text-muted-foreground px-1 select-none">
                                  {activeVersionIndex + 1} / {group.versions.length}
                                </span>

                                <TooltipIconButton
                                  tooltip="Next version"
                                  disabled={activeVersionIndex === group.versions.length - 1}
                                  className="h-7 w-7 p-1 hover:bg-muted hover:text-foreground disabled:opacity-30"
                                  onClick={() =>
                                    setSelectedVersions((prev) => ({
                                      ...prev,
                                      [group.position]: Math.min(group.versions.length - 1, activeVersionIndex + 1),
                                    }))
                                  }
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </TooltipIconButton>
                              </div>
                            )}

                            <TooltipIconButton
                              tooltip="Copy"
                              className="h-7 w-7 p-1 hover:bg-muted hover:text-foreground"
                              onClick={() => handleCopy(msg.content, msgId)}
                            >
                              {copiedMsgId === msgId ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </TooltipIconButton>

                            <TooltipIconButton
                              tooltip="Good response"
                              className={cn(
                                'h-7 w-7 p-1 hover:bg-muted hover:text-foreground',
                                feedback[group.position] === 'up' && 'text-green-500 font-bold'
                              )}
                              onClick={() => handleFeedback(group.position, 'up')}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </TooltipIconButton>

                            <TooltipIconButton
                              tooltip="Bad response"
                              className={cn(
                                'h-7 w-7 p-1 hover:bg-muted hover:text-foreground',
                                feedback[group.position] === 'down' && 'text-red-500 font-bold'
                              )}
                              onClick={() => handleFeedback(group.position, 'down')}
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </TooltipIconButton>

                            <TooltipIconButton
                              tooltip="Read aloud"
                              className="h-7 w-7 p-1 hover:bg-muted hover:text-foreground"
                              onClick={() => toast.info('Read aloud option selected')}
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </TooltipIconButton>

                            <TooltipIconButton
                              tooltip="Share"
                              className="h-7 w-7 p-1 hover:bg-muted hover:text-foreground"
                              onClick={() => handleCopy(msg.content, `share-${msgId}`)}
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </TooltipIconButton>

                            <TooltipIconButton
                              tooltip="Regenerate"
                              className="h-7 w-7 p-1 hover:bg-muted hover:text-foreground"
                              onClick={() => handleRegenerate(group.position)}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </TooltipIconButton>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <TooltipIconButton
                                  tooltip="More"
                                  className="h-7 w-7 p-1 hover:bg-muted hover:text-foreground"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </TooltipIconButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-40 text-xs">
                                <DropdownMenuItem onClick={() => handleCopy(msg.content, msgId)}>
                                  <Copy className="mr-2 h-3.5 w-3.5" />
                                  Copy Text
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRegenerate(group.position)}>
                                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
                                  Regenerate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Sticky Bottom Composer & Disclaimer Area for Active Thread */}
      {!isEmpty && (
        <div className="sticky bottom-0 w-full bg-linear-to-t from-background via-background/90 to-transparent pt-4 pb-3 px-4">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Rounded ChatGPT Shell matching theme */}
            <div className="rounded-[28px] border border-border bg-card shadow-lg px-3 py-2 transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
              <div className="flex items-end gap-1.5">
                {/* Attachment Control */}
                <TooltipIconButton
                  tooltip="Add photos & files"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => toast.info('Attachments option selected')}
                >
                  <Plus className="h-4 w-4" />
                </TooltipIconButton>

                {/* Textarea Input */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  rows={1}
                  className="flex-1 bg-transparent border-0 resize-none py-2 px-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden max-h-48"
                />

                {/* Four-State Primary Action Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  {isRunning ? (
                    <TooltipIconButton
                      tooltip="Stop responding"
                      className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                      onClick={handleCancel}
                    >
                      <Square className="h-3.5 w-3.5 fill-current" />
                    </TooltipIconButton>
                  ) : input.trim().length > 0 ? (
                    <TooltipIconButton
                      tooltip="Send prompt"
                      className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                      onClick={() => handleSend()}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </TooltipIconButton>
                  ) : (
                    <>
                      <TooltipIconButton
                        tooltip="Dictate"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => toast.info('Dictate option selected')}
                      >
                        <Mic className="h-4 w-4" />
                      </TooltipIconButton>

                      <TooltipIconButton
                        tooltip="Use voice mode"
                        className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                        onClick={() => toast.info('Voice mode option selected')}
                      >
                        <AudioLines className="h-4 w-4" />
                      </TooltipIconButton>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Disclaimer & Shortcut Text */}
            <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap mt-2">
              <span>SocialArch AI can make mistakes. Check important info.</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="inline-flex items-center gap-1">
                <span>Press</span>
                <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border/60 bg-muted/60 px-1 font-mono text-[9px] font-medium text-muted-foreground">
                  Ctrl+Shift+O
                </kbd>
                <span>to start new chat</span>
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
