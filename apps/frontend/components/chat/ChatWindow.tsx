"use client";

import { useState, useEffect, useRef } from "react";
import { Send, RotateCcw, Edit2, ChevronLeft, ChevronRight, User, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatMessages, useRegenerateResponse } from "@/hooks/use-chat-api";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  version?: number;
  parentMessageId?: string | null;
}

interface ChatWindowProps {
  chatId: string;
  onSendMessage?: (content: string) => void;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { data: history, isLoading: isHistoryLoading, refetch } = useChatMessages(chatId);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const regenerateMutation = useRegenerateResponse();

  useEffect(() => {
    if (history) {
      setLocalMessages(history);
    }
  }, [history]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageContent = input;
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      // Add user message optimistically
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: messageContent,
      };
      setLocalMessages(prev => [...prev, tempUserMessage]);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ chatId, content: messageContent }),
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

      // Refetch to get the saved messages
      await refetch();
      setStreamingContent("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const onRegenerate = async (parentMessageId: string) => {
    try {
      await regenerateMutation.mutateAsync({ chatId, parentMessageId });
      toast.success("Response regenerated");
    } catch (error) {
      toast.error("Failed to regenerate response");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {localMessages.map((message, index) => (
            <div
              key={message.id || index}
              className={cn(
                "flex gap-4 group",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className={cn(
                "relative max-w-[85%] px-4 py-3 rounded-2xl text-sm transition-all duration-200",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                  : "bg-muted/50 border border-border/50 rounded-tl-none"
              )}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <Input 
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            // TODO: Handle edit submit
                            setEditingMessageId(null);
                          }
                        }}
                        autoFocus
                        className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground focus:ring-0"
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditingMessageId(null)}>Cancel</Button>
                        <Button size="sm" variant="secondary" className="h-6 text-[10px]" onClick={() => {
                          // TODO: Handle edit submit
                          setEditingMessageId(null);
                        }}>Send</Button>
                      </div>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                
                {/* Assistant Versioning & Actions */}
                {message.role === "assistant" && (
                  <div className="absolute -bottom-6 left-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 bg-muted/80 backdrop-blur-sm border border-border/50 rounded-md px-1 py-0.5">
                      <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm">
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <span className="text-[10px] font-medium px-1 underline cursor-pointer">1/1</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm">
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-md hover:bg-muted"
                      onClick={() => message.parentMessageId && onRegenerate(message.parentMessageId)}
                      disabled={regenerateMutation.isPending}
                    >
                      <RotateCcw className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                )}

                {/* User Actions */}
                {message.role === "user" && !editingMessageId && (
                  <div className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-md hover:bg-muted"
                      onClick={() => {
                        setEditingMessageId(message.id);
                        setEditInput(message.content);
                      }}
                    >
                      <Edit2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1 ring-1 ring-border/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {/* Streaming Content */}
          {streamingContent && (
            <div className="flex gap-4 justify-start">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-none px-4 py-3 text-sm max-w-[85%]">
                {streamingContent}
              </div>
            </div>
          )}

          {isLoading && !streamingContent && (
            <div className="flex gap-4 justify-start">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-4 w-4 text-primary-foreground animate-pulse" />
              </div>
              <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-none px-4 py-3 text-sm">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center gap-2"
          >
            <div className="relative flex-1 group">
              <div className="absolute inset-x-0 -top-full p-2 flex justify-center opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1 shadow-lg flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  <span className="text-[10px] text-muted-foreground font-medium">AI Agent mode active</span>
                </div>
              </div>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message SocialArch AI..."
                className="pr-12 py-6 bg-muted/30 border-border/50 focus:bg-background focus:ring-primary/20 transition-all rounded-2xl shadow-inner-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl transition-all duration-300",
                  input.trim() ? "gradient-primary shadow-glow scale-100" : "bg-muted text-muted-foreground scale-90"
                )}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-muted-foreground">
              SocialArch AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
