'use client';

import * as React from 'react';
import { Plus, Mic, AudioLines, ArrowUp, Square, X, FileText, Image as ImageIcon, Loader2, Paperclip } from 'lucide-react';
import { TooltipIconButton } from '@/components/tooltip-icon-button';
import { toast } from 'sonner';
import { assetsService } from '@/lib/services/assets.service';
import { ChatAttachment } from '@/lib/services/chat.service';
import { cn } from '@/lib/utils';

interface ChatComposerProps {
  input: string;
  setInput: (val: string) => void;
  stagedAttachments: ChatAttachment[];
  setStagedAttachments: React.Dispatch<React.SetStateAction<ChatAttachment[]>>;
  handleSend: (overrideContent?: string) => void;
  handleCancel: () => void;
  isRunning: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isEmpty?: boolean;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatComposer({
  input,
  setInput,
  stagedAttachments,
  setStagedAttachments,
  handleSend,
  handleCancel,
  isRunning,
  textareaRef,
  handleKeyDown,
  isEmpty = false,
}: ChatComposerProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async (files: File[]) => {
    try {
      setIsUploading(true);
      const uploadedAssets = await assetsService.uploadAssets(files);
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
    }
  };

  const removeAttachment = (id: string) => {
    setStagedAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const canSend = input.trim().length > 0 || stagedAttachments.length > 0;

  return (
    <div
      className={cn(
        'w-full transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-3',
        isEmpty
          ? 'px-0'
          : 'sticky bottom-0 bg-linear-to-t from-background via-background/90 to-transparent pt-2.5 pb-2 px-4'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      <div className="max-w-2xl mx-auto space-y-1.5">
        {/* Rounded ChatGPT Shell matching theme */}
        <div
          className={`rounded-full border bg-card shadow-md px-3 py-1.5 transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 ${
            isDragging ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border'
          }`}
        >
          {/* Staged Attachment Chips */}
          {(stagedAttachments.length > 0 || isUploading) && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 px-1 pt-0.5 scrollbar-thin">
              {stagedAttachments.map((att) => {
                const isImage = att.mimeType?.startsWith('image/') || att.type === 'image';
                return (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 bg-muted/80 hover:bg-muted border border-border/60 rounded-lg px-2 py-1 text-[11px] text-foreground shrink-0 shadow-2xs group transition-colors"
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
                      <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-3 w-3" />
                      </div>
                    )}

                    <div className="flex flex-col max-w-[130px] truncate">
                      <span className="font-medium truncate leading-tight">{att.name}</span>
                      {att.size && (
                        <span className="text-[9px] text-muted-foreground">{formatFileSize(att.size)}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="text-muted-foreground hover:text-foreground rounded-full p-0.5 hover:bg-background/80 transition-colors ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}

              {isUploading && (
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1 text-[11px] text-primary shrink-0 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Uploading to Assets...</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {/* Attachment Control */}
            <TooltipIconButton
              tooltip="Add photos & files"
              className="h-7.5 w-7.5 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isRunning}
            >
              <Plus className="h-3.5 w-3.5" />
            </TooltipIconButton>

            {/* Textarea Input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isUploading ? 'Uploading attachments...' : 'Ask anything or upload files...'}
              rows={1}
              className="flex-1 bg-transparent border-0 resize-none py-1 px-1 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden max-h-36"
            />

            {/* Four-State Primary Action Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {isRunning ? (
                <TooltipIconButton
                  tooltip="Stop responding"
                  className="h-7 w-7 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                  onClick={handleCancel}
                >
                  <Square className="h-3 w-3 fill-current" />
                </TooltipIconButton>
              ) : canSend ? (
                <TooltipIconButton
                  tooltip="Send prompt"
                  className="h-7 w-7 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                  onClick={() => handleSend()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUp className="h-3.5 w-3.5" />}
                </TooltipIconButton>
              ) : (
                <>
                  <TooltipIconButton
                    tooltip="Dictate"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => toast.info('Dictate option selected')}
                  >
                    <Mic className="h-3.5 w-3.5" />
                  </TooltipIconButton>

                  <TooltipIconButton
                    tooltip="Use voice mode"
                    className="h-7 w-7 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                    onClick={() => toast.info('Voice mode option selected')}
                  >
                    <AudioLines className="h-3.5 w-3.5" />
                  </TooltipIconButton>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer & Shortcut Text */}
        <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap mt-1">
          <span>SocialArch AI can make mistakes. Check important info.</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-1">
            <span>Press</span>
            <kbd className="pointer-events-none inline-flex h-3.5 select-none items-center gap-0.5 rounded border border-border/60 bg-muted/60 px-1 font-mono text-[9px] font-medium text-muted-foreground">
              Ctrl+Shift+O
            </kbd>
            <span>to start new chat</span>
          </span>
        </p>
      </div>
    </div>
  );
}
