'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { chatService, ChatMessage, ChatAttachment } from '@/lib/services/chat.service';
import { assetsService, Asset } from '@/lib/services/assets.service';
import { toast } from 'sonner';

import { ChatMessages } from './ChatMessages';
import { ChatComposer } from './ChatComposer';
import { PositionGroup } from './ChatMessageItem';
import { AssetPreviewModal } from '@/app/(protected)/assets/components/AssetPreviewModal';

export function ChatContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeChatId = searchParams.get('id');

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [selectedVersions, setSelectedVersions] = React.useState<Record<number, number>>({});
  const [input, setInput] = React.useState('');
  const [stagedAttachments, setStagedAttachments] = React.useState<ChatAttachment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);
  const [isRunning, setIsRunning] = React.useState(false);
  const [copiedMsgId, setCopiedMsgId] = React.useState<string | number | null>(null);
  const [feedback, setFeedback] = React.useState<Record<number, 'up' | 'down'>>({});
  const [previewAsset, setPreviewAsset] = React.useState<Asset | null>(null);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const streamingChatIdRef = React.useRef<string | null>(null);

  // Group messages by position to eliminate duplicate bubbles for regenerated messages
  const positionGroups: PositionGroup[] = React.useMemo(() => {
    const groupsMap = new Map<number, PositionGroup>();

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

    if (streamingChatIdRef.current === activeChatId) {
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
    const attachmentsToSend = [...stagedAttachments];
    if ((!text && attachmentsToSend.length === 0) || isRunning) return;

    setInput('');
    setStagedAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const currentPosition = positionGroups.length > 0 ? positionGroups[positionGroups.length - 1].position + 1 : 0;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      position: currentPosition,
      version: 1,
      attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
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
        attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
        signal: controller.signal,
        onChatIdCreated: (newId) => {
          if (!currentChatId) {
            currentChatId = newId;
            streamingChatIdRef.current = newId;
            router.push(`/chat?id=${newId}`);
            window.dispatchEvent(new Event('refresh-recent-chats'));
          }
        },
        onAttachment: (att) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (
              lastIndex >= 0 &&
              updated[lastIndex].position === assistantPosition &&
              updated[lastIndex].role === 'assistant'
            ) {
              const existing = updated[lastIndex].attachments || [];
              if (!existing.some((a) => a.id === att.id)) {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  attachments: [...existing, att],
                };
              }
            }
            return updated;
          });
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
      streamingChatIdRef.current = null;
    }
  };

  // Preview asset modal trigger
  const handlePreviewAsset = async (assetId: string) => {
    try {
      const asset = await assetsService.getAsset(assetId);
      setPreviewAsset(asset);
    } catch (err) {
      console.error('Failed to load asset details:', err);
      toast.error('Failed to load asset details');
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
        onAttachment: (att) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.position === position && (msg.version || 1) === newVersionNumber
                ? {
                    ...msg,
                    attachments: [...(msg.attachments || []), att],
                  }
                : msg
            )
          );
        },
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
    <div className="flex flex-col h-full w-full bg-background text-foreground relative overflow-hidden font-sans">
      <ChatMessages
        isLoadingHistory={isLoadingHistory}
        positionGroups={positionGroups}
        input={input}
        setInput={setInput}
        stagedAttachments={stagedAttachments}
        setStagedAttachments={setStagedAttachments}
        handleSend={handleSend}
        handleCancel={handleCancel}
        isRunning={isRunning}
        selectedVersions={selectedVersions}
        setSelectedVersions={setSelectedVersions}
        copiedMsgId={copiedMsgId}
        handleCopy={handleCopy}
        feedback={feedback}
        handleFeedback={handleFeedback}
        handleRegenerate={handleRegenerate}
        onPreviewAsset={handlePreviewAsset}
        messagesEndRef={messagesEndRef}
      />

      {!isEmpty && (
        <ChatComposer
          input={input}
          setInput={setInput}
          stagedAttachments={stagedAttachments}
          setStagedAttachments={setStagedAttachments}
          handleSend={handleSend}
          handleCancel={handleCancel}
          isRunning={isRunning}
          textareaRef={textareaRef}
          handleKeyDown={handleKeyDown}
        />
      )}

      {previewAsset && (
        <AssetPreviewModal
          asset={previewAsset}
          isOpen={!!previewAsset}
          onClose={() => setPreviewAsset(null)}
          onUpdate={async () => {
            if (previewAsset) {
              const updated = await assetsService.getAsset(previewAsset.ID);
              setPreviewAsset(updated);
            }
          }}
          onDelete={async (id) => {
            try {
              await assetsService.deleteAsset(id);
              toast.success('Asset deleted');
              setPreviewAsset(null);
            } catch (err) {
              toast.error('Failed to delete asset');
            }
          }}
        />
      )}
    </div>
  );
}
