'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatMessageItem, PositionGroup } from './ChatMessageItem';

import { ChatAttachment } from '@/lib/services/chat.service';

interface ChatMessagesProps {
  isLoadingHistory: boolean;
  positionGroups: PositionGroup[];
  input: string;
  setInput: (val: string) => void;
  stagedAttachments: ChatAttachment[];
  setStagedAttachments: React.Dispatch<React.SetStateAction<ChatAttachment[]>>;
  handleSend: (overrideContent?: string) => void;
  handleCancel: () => void;
  isRunning: boolean;
  selectedVersions: Record<number, number>;
  setSelectedVersions: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  copiedMsgId: string | number | null;
  handleCopy: (text: string, id: string | number) => void;
  feedback: Record<number, 'up' | 'down'>;
  handleFeedback: (pos: number, type: 'up' | 'down') => void;
  handleRegenerate: (position: number) => void;
  onPreviewAsset?: (assetId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  isLoadingHistory,
  positionGroups,
  input,
  setInput,
  stagedAttachments,
  setStagedAttachments,
  handleSend,
  handleCancel,
  isRunning,
  selectedVersions,
  setSelectedVersions,
  copiedMsgId,
  handleCopy,
  feedback,
  handleFeedback,
  handleRegenerate,
  onPreviewAsset,
  messagesEndRef,
}: ChatMessagesProps) {
  const isEmpty = positionGroups.length === 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 max-w-4xl w-full mx-auto flex flex-col">
      {isLoadingHistory ? (
        <div className="flex h-full w-full items-center justify-center my-auto py-20 text-muted-foreground gap-2 text-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading conversation...</span>
        </div>
      ) : isEmpty ? (
        <ChatEmptyState
          input={input}
          setInput={setInput}
          stagedAttachments={stagedAttachments}
          setStagedAttachments={setStagedAttachments}
          handleSend={handleSend}
          handleCancel={handleCancel}
          isRunning={isRunning}
        />
      ) : (
        <div className="space-y-6 pb-24">
          {positionGroups.map((group) => (
            <ChatMessageItem
              key={group.position}
              group={group}
              selectedVersions={selectedVersions}
              setSelectedVersions={setSelectedVersions}
              copiedMsgId={copiedMsgId}
              handleCopy={handleCopy}
              setInput={setInput}
              feedback={feedback}
              handleFeedback={handleFeedback}
              handleRegenerate={handleRegenerate}
              onPreviewAsset={onPreviewAsset}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
