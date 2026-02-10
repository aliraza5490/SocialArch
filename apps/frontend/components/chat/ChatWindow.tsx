"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Send, RotateCcw, Edit2, ChevronLeft, ChevronRight, User, Bot, Sparkles } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearSelectedVersion } from "@/store/features/chat/chatSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatMessages, useRegenerateResponse } from "@/hooks/use-chat-api";
import { useMessageTree } from "@/hooks/use-message-tree";
import { Message } from "@/types/chat"; // Import shared type
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

import { MessageInput } from "./MessageInput";
import { MessageItem } from "./MessageItem";

interface ChatWindowProps {
  chatId: string;
  onSendMessage?: (content: string) => void;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const { data: history, isLoading: isHistoryLoading, refetch } = useChatMessages(chatId);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  
  const allSelectedVersions = (useAppSelector((state: any) => state.chat.selectedVersions));
  const selectedVersionsContext = allSelectedVersions[chatId] || {};

  // Merge API and optimistic messages, removing duplicates
  const allMessages = useMemo(() => {
    const apiMessages = history || [];
    const historyIds = new Set((apiMessages as Message[]).map((m: Message) => m.id));
    
    const filteredOptimistic = optimisticMessages.filter((opt: Message) => {
      if (historyIds.has(opt.id)) return false;
      return !apiMessages.some((api: Message) => 
        api.position === opt.position && 
        api.role === opt.role && 
        api.version === opt.version
      );
    });

    return [...apiMessages, ...filteredOptimistic];
  }, [history, optimisticMessages]);
  
  const { thread, getVersionInfo, selectVersion } = useMessageTree(allMessages, chatId);

  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const regenerateMutation = useRegenerateResponse();

  const prevThreadLength = useRef(thread.length);

  useEffect(() => {
    const isNewMessage = thread.length > prevThreadLength.current;
    if (scrollRef.current && (isNewMessage || streamingContent)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevThreadLength.current = thread.length;
  }, [thread.length, streamingContent]);

  const handleSubmit = async (content: string, overridePosition?: number) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setStreamingContent("");

    const position = overridePosition !== undefined ? overridePosition : thread.length;
    
    // Calculate next optimistic version for this position
    const getNextVersion = (pos: number) => {
      const versions = allMessages.filter(m => m.position === pos).map(m => m.version);
      return versions.length > 0 ? Math.max(...versions) + 1 : 1;
    };

    const userVersion = getNextVersion(position);
    const assistantVersion = getNextVersion(position + 1);

    const optimisticUserMsg: Message = {
      id: `temp-${Date.now()}-user`,
      role: "user",
      content,
      position,
      version: userVersion,
      createdAt: new Date().toISOString()
    };

    const optimisticAssistantMsg: Message = {
      id: `temp-${Date.now()}-assistant`,
      role: "assistant",
      content: "",
      position: position + 1,
      version: assistantVersion,
      createdAt: new Date().toISOString()
    };

    setOptimisticMessages(prev => [...prev, optimisticUserMsg, optimisticAssistantMsg]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ 
          chatId, 
          content,
          position: overridePosition,
          selectedVersions: selectedVersionsContext
        }),
      });
      
      // If this was an edit (overridePosition provided), clear the selected version 
      // for this position and the next (assistant response) so it shows latest
      if (overridePosition !== undefined) {
        dispatch(clearSelectedVersion({ chatId, position: overridePosition }));
        dispatch(clearSelectedVersion({ chatId, position: overridePosition + 1 }));
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
              setStreamingContent(fullContent);
              setOptimisticMessages(prev => prev.map(msg => 
                msg.id === optimisticAssistantMsg.id ? { ...msg, content: fullContent } : msg
              ));
            }
          } catch { /* ignore */ }
        }
      }

      await refetch();
      setStreamingContent("");
      setOptimisticMessages([]);
    } catch (error) {
      toast.error("Failed to send message");
      setOptimisticMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (originalMessage: Message, newContent: string) => {
    await handleSubmit(newContent, originalMessage.position);
  };

  const onRegenerate = async (position: number) => {
    try {
      dispatch(clearSelectedVersion({ chatId, position }));
      await regenerateMutation.mutateAsync({ chatId, position, selectedVersions: selectedVersionsContext });
      toast.success("Response regenerated");
    } catch (error) {
      toast.error("Failed to regenerate response");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {thread.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isLoading={isLoading}
              getVersionInfo={getVersionInfo}
              selectVersion={selectVersion}
              onRegenerate={onRegenerate}
              onEditSubmit={handleEditSubmit}
              isRegenerating={regenerateMutation.isPending}
            />
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

        </div>
      </ScrollArea>

      <MessageInput 
        onSend={(content) => handleSubmit(content)} 
        isLoading={isLoading} 
      />
    </div>
  );
}
