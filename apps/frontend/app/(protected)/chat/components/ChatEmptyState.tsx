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
} from 'lucide-react';
import { TooltipIconButton } from '@/components/tooltip-icon-button';
import { toast } from 'sonner';

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
  handleSend: (overrideContent?: string) => void;
  handleCancel: () => void;
  isRunning: boolean;
}

export function ChatEmptyState({
  input,
  setInput,
  handleSend,
  handleCancel,
  isRunning,
}: ChatEmptyStateProps) {
  return (
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
  );
}
