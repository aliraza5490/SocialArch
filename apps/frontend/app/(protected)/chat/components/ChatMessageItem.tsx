'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Copy,
  Check,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Share2,
  RotateCcw,
  MoreHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Download,
  FileText,
} from 'lucide-react';
import { MarkdownContent } from '@/components/markdown-content';
import { TooltipIconButton } from '@/components/tooltip-icon-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatMessage, ChatAttachment } from '@/lib/services/chat.service';
import { assetsService } from '@/lib/services/assets.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface PositionGroup {
  position: number;
  role: 'user' | 'assistant';
  versions: ChatMessage[];
}

interface ChatMessageItemProps {
  group: PositionGroup;
  selectedVersions: Record<number, number>;
  setSelectedVersions: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  copiedMsgId: string | number | null;
  handleCopy: (text: string, id: string | number) => void;
  setInput: (val: string) => void;
  feedback: Record<number, 'up' | 'down'>;
  handleFeedback: (pos: number, type: 'up' | 'down') => void;
  handleRegenerate: (position: number) => void;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function RenderAttachments({ attachments }: { attachments?: ChatAttachment[] }) {
  if (!attachments || attachments.length === 0) return null;

  const handleDownload = async (att: ChatAttachment) => {
    try {
      await assetsService.downloadAssetFile(att.id, att.name);
      toast.success(`Downloaded ${att.name}`);
    } catch (err) {
      console.error('Failed to download attachment:', err);
      toast.error(`Failed to download ${att.name}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 my-1.5">
      {attachments.map((att) => {
        const isImage = att.mimeType?.startsWith('image/') || att.type === 'image';
        const fileUrl = assetsService.getFileUrl(att.id);

        if (isImage) {
          return (
            <div
              key={att.id}
              className="relative group/img rounded-xl overflow-hidden border border-border bg-card shadow-xs max-w-[240px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl}
                alt={att.name}
                className="w-full h-auto max-h-48 object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(att)}
                  className="bg-background/90 text-foreground hover:bg-background rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 shadow-md transition-transform hover:scale-105"
                  title="Download Image"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={att.id}
            className="flex items-center gap-3 bg-muted/70 hover:bg-muted border border-border/70 rounded-xl p-2.5 text-xs text-foreground shrink-0 shadow-2xs max-w-[280px] transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium truncate text-foreground leading-tight" title={att.name}>
                {att.name}
              </span>
              {att.size && (
                <span className="text-[10px] text-muted-foreground mt-0.5">{formatFileSize(att.size)}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleDownload(att)}
              className="h-8 w-8 rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 flex items-center justify-center shrink-0 transition-colors shadow-2xs"
              title="Download File"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ChatMessageItem({
  group,
  selectedVersions,
  setSelectedVersions,
  copiedMsgId,
  handleCopy,
  setInput,
  feedback,
  handleFeedback,
  handleRegenerate,
}: ChatMessageItemProps) {
  const activeVersionIndex =
    selectedVersions[group.position] !== undefined
      ? Math.min(selectedVersions[group.position], group.versions.length - 1)
      : group.versions.length - 1;

  const msg = group.versions[activeVersionIndex] || group.versions[group.versions.length - 1];
  const msgId = msg?.ID || `${group.position}-${msg?.version || activeVersionIndex}`;
  const isUser = group.role === 'user';
  const hasMultipleVersions = group.versions.length > 1;

  const [isSavingAsset, setIsSavingAsset] = React.useState(false);

  const handleSaveToAssets = async (content: string) => {
    if (!content) return;
    try {
      setIsSavingAsset(true);
      const firstLine = content.split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, '').trim();
      const defaultTitle = firstLine ? firstLine.slice(0, 30).trim().replace(/\s+/g, '_') : `Response_${Date.now()}`;
      const name = `${defaultTitle}.md`;

      await assetsService.saveMarkdownAsset({
        name,
        content,
        tags: ['chat-response', 'markdown'],
      });

      toast.success(`Saved to Assets as ${name}`);
    } catch (error) {
      toast.error('Failed to save response to Assets');
    } finally {
      setIsSavingAsset(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 group',
        isUser ? 'items-end' : 'items-start'
      )}
    >
      {isUser ? (
        /* User Bubble & Hover Actions */
        <div className="flex flex-col items-end gap-1.5 max-w-[85%] md:max-w-[75%]">
          <RenderAttachments attachments={msg.attachments} />
          {msg.content && (
            <div className="rounded-[22px] bg-primary text-primary-foreground font-medium px-4 py-2.5 text-sm leading-relaxed shadow-xs whitespace-pre-wrap">
              {msg.content}
            </div>
          )}

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
            <RenderAttachments attachments={msg.attachments} />
            {msg.content ? (
              <MarkdownContent content={msg.content} />
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-xs animate-pulse py-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}

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
                  tooltip="Save to Assets"
                  disabled={isSavingAsset}
                  className="h-7 w-7 p-1 hover:bg-muted hover:text-foreground disabled:opacity-50"
                  onClick={() => handleSaveToAssets(msg.content)}
                >
                  {isSavingAsset ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5" />
                  )}
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
                  <DropdownMenuContent align="start" className="w-48 text-xs">
                    <DropdownMenuItem onClick={() => handleCopy(msg.content, msgId)}>
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      Copy Text
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSaveToAssets(msg.content)}
                      disabled={isSavingAsset}
                    >
                      <Bookmark className="mr-2 h-3.5 w-3.5" />
                      Save as Markdown Asset
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
}

