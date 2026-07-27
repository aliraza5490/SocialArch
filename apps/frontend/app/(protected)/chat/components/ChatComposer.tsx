'use client';

import * as React from 'react';
import { Plus, Mic, AudioLines, ArrowUp, Square } from 'lucide-react';
import { TooltipIconButton } from '@/components/tooltip-icon-button';
import { toast } from 'sonner';

interface ChatComposerProps {
  input: string;
  setInput: (val: string) => void;
  handleSend: (overrideContent?: string) => void;
  handleCancel: () => void;
  isRunning: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function ChatComposer({
  input,
  setInput,
  handleSend,
  handleCancel,
  isRunning,
  textareaRef,
  handleKeyDown,
}: ChatComposerProps) {
  return (
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
  );
}
