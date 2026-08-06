'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatMessageItem, PositionGroup } from './ChatMessageItem';
import { cn } from '@/lib/utils';

interface ChatMessagesProps {
  isLoadingHistory: boolean;
  positionGroups: PositionGroup[];
  selectedVersions: Record<number, number>;
  setSelectedVersions: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  copiedMsgId: string | number | null;
  handleCopy: (text: string, id: string | number) => void;
  setInput: (val: string) => void;
  feedback: Record<number, 'up' | 'down'>;
  handleFeedback: (pos: number, type: 'up' | 'down') => void;
  handleRegenerate: (position: number) => void;
  onPreviewAsset?: (assetId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  isLoadingHistory,
  positionGroups,
  selectedVersions,
  setSelectedVersions,
  copiedMsgId,
  handleCopy,
  setInput,
  feedback,
  handleFeedback,
  handleRegenerate,
  onPreviewAsset,
  messagesEndRef,
}: ChatMessagesProps) {
  const isEmpty = positionGroups.length === 0;

  return (
    <div
      className={cn(
        'w-full transition-all duration-500 ease-out',
        isEmpty ? 'w-full' : 'flex-1 overflow-y-auto overflow-x-hidden flex flex-col'
      )}
    >
      <div
        className={cn(
          'w-full mx-auto flex flex-col transition-all duration-500 ease-out',
          isEmpty ? 'items-center justify-center' : 'max-w-4xl px-4 pt-6 pb-2 md:px-8 space-y-6 flex-1'
        )}
      >
        {isLoadingHistory ? (
          <div className="flex h-full w-full items-center justify-center my-auto py-20 text-muted-foreground gap-2 text-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading conversation...</span>
          </div>
        ) : isEmpty ? (
          <ChatEmptyState />
        ) : (
          <div className="space-y-6 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out w-full">
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
    </div>
  );
}
