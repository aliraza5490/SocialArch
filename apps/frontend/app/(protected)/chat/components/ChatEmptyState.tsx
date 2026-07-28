'use client';

import * as React from 'react';
import {
  Plus,
  Mic,
  AudioLines,
  ArrowUp,
  Square,
  Sparkles,
  Megaphone,
  BarChart3,
  FileText,
  Loader2,
  X,
} from 'lucide-react';
import { TooltipIconButton } from '@/components/tooltip-icon-button';
import { toast } from 'sonner';
import { assetsService } from '@/lib/services/assets.service';
import { ChatAttachment } from '@/lib/services/chat.service';

export const SUGGESTIONS = [
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

interface ChatEmptyStateProps {
  input: string;
  setInput: (val: string) => void;
  stagedAttachments: ChatAttachment[];
  setStagedAttachments: React.Dispatch<React.SetStateAction<ChatAttachment[]>>;
  handleSend: (overrideContent?: string) => void;
  handleCancel: () => void;
  isRunning: boolean;
}

export function ChatEmptyState({
  input,
  setInput,
  stagedAttachments,
  setStagedAttachments,
  handleSend,
  handleCancel,
  isRunning,
}: ChatEmptyStateProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      const uploadedAssets = await assetsService.uploadAssets(Array.from(files));
      const newAttachments: ChatAttachment[] = uploadedAssets.map((asset) => ({
        id: asset.ID,
        name: asset.name,
        type: asset.type,
        mimeType: asset.mimeType || undefined,
        size: asset.size || undefined,
      }));

      setStagedAttachments((prev) => [...prev, ...newAttachments]);
      toast.success(`Uploaded ${uploadedAssets.length} file${uploadedAssets.length > 1 ? 's' : ''} to Assets`);
    } catch (err: any) {
      console.error('File upload failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (id: string) => {
    setStagedAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const canSend = input.trim().length > 0 || stagedAttachments.length > 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[65vh] text-center max-w-2xl w-full mx-auto px-2 space-y-7 animate-in fade-in duration-300">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
        Where should we begin?
      </h1>

      {/* Centered Composer Surface matching theme */}
      <div className="w-full rounded-3xl border border-border bg-card shadow-md px-4 py-3 transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 space-y-2">
        {/* Staged Attachments */}
        {(stagedAttachments.length > 0 || isUploading) && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 scrollbar-thin">
            {stagedAttachments.map((att) => {
              const isImage = att.mimeType?.startsWith('image/') || att.type === 'image';
              return (
                <div
                  key={att.id}
                  className="flex items-center gap-2 bg-muted/80 border border-border/60 rounded-xl px-2.5 py-1.5 text-xs text-foreground shrink-0 shadow-2xs"
                >
                  {isImage ? (
                    <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 bg-background border border-border/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={assetsService.getFileUrl(att.id)}
                        alt={att.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                  <span className="font-medium truncate max-w-[120px]">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="text-muted-foreground hover:text-foreground rounded-full p-0.5 hover:bg-background/80 transition-colors ml-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            {isUploading && (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5 text-xs text-primary shrink-0 animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Plus Attachment Icon */}
          <TooltipIconButton
            tooltip="Add photos & files"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRunning}
          >
            <Plus className="h-4 w-4" />
          </TooltipIconButton>

          {/* Input Field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSend && !isUploading) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isUploading ? 'Uploading attachments...' : 'Ask anything or upload files'}
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
            ) : canSend ? (
              <TooltipIconButton
                tooltip="Send prompt"
                className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                onClick={() => handleSend()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
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
  );
}
