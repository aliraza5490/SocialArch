"use client";

import React, { useState } from "react";
import { Bot, User, Edit2, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { VersionInfo } from "@/hooks/use-message-tree";

interface MessageItemProps {
  message: Message;
  isLoading: boolean;
  getVersionInfo: (message: Message) => VersionInfo;
  selectVersion: (message: Message, direction: "next" | "prev") => void;
  onRegenerate: (position: number) => void;
  onEditSubmit: (originalMessage: Message, newContent: string) => void;
  isRegenerating?: boolean;
}

export const MessageItem = React.memo(function MessageItem({
  message,
  isLoading,
  getVersionInfo,
  selectVersion,
  onRegenerate,
  onEditSubmit,
  isRegenerating
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState(message.content);

  const handleEditSubmit = () => {
    if (!editInput.trim()) return;
    onEditSubmit(message, editInput);
    setIsEditing(false);
  };

  return (
    <div
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
      <div className="flex flex-col max-w-[85%]">
        <div className={cn(
          "relative px-4 py-3 rounded-2xl text-sm transition-all duration-200",
          message.role === "user"
            ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
            : "bg-muted/50 border border-border/50 rounded-tl-none"
        )}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isEditing ? (
              <div className="space-y-2">
                <Input 
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditSubmit();
                    }
                  }}
                  autoFocus
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground focus:ring-0"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button size="sm" variant="secondary" className="h-6 text-[10px]" onClick={handleEditSubmit}>Send</Button>
                </div>
              </div>
            ) : (
              message.content || (message.role === "assistant" && isLoading && (
                <div className="flex gap-1 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ))
            )}
          </div>
          
          {/* Assistant Versioning & Actions */}
          {message.role === "assistant" && (
            <div className="absolute -bottom-6 left-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {(() => {
                  const info = getVersionInfo(message);
                  if (info.total > 1) {
                      return (
                          <div className="flex items-center gap-1 bg-muted/80 backdrop-blur-sm border border-border/50 rounded-md px-1 py-0.5">
                          <Button 
                              variant="ghost" size="icon" className="h-5 w-5 rounded-sm"
                              onClick={() => selectVersion(message, 'prev')}
                              disabled={!info.hasPrev}
                          >
                              <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <span className="text-[10px] font-medium px-1 select-none">{info.current}/{info.total}</span>
                          <Button 
                              variant="ghost" size="icon" className="h-5 w-5 rounded-sm"
                              onClick={() => selectVersion(message, 'next')}
                              disabled={!info.hasNext}
                          >
                              <ChevronRight className="h-3 w-3" />
                          </Button>
                          </div>
                      );
                  }
                  return null;
              })()}

              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-md hover:bg-muted"
                onClick={() => onRegenerate(message.position)}
                disabled={isRegenerating}
              >
                <RotateCcw className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          )}

          {/* User Actions */}
          {message.role === "user" && !isEditing && (
            <div className="absolute -bottom-6 right-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {(() => {
                  const info = getVersionInfo(message);
                  if (info.total > 1) {
                      return (
                          <div className="flex items-center gap-1 bg-muted/80 backdrop-blur-sm border border-border/50 rounded-md px-1 py-0.5">
                          <Button 
                              variant="ghost" size="icon" className="h-5 w-5 rounded-sm"
                              onClick={() => selectVersion(message, 'prev')}
                              disabled={!info.hasPrev}
                          >
                              <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <span className="text-[10px] font-medium px-1 select-none">{info.current}/{info.total}</span>
                          <Button 
                              variant="ghost" size="icon" className="h-5 w-5 rounded-sm"
                              onClick={() => selectVersion(message, 'next')}
                              disabled={!info.hasNext}
                          >
                              <ChevronRight className="h-3 w-3" />
                          </Button>
                          </div>
                      );
                  }
                  return null;
              })()}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-md hover:bg-muted"
                onClick={() => {
                  setIsEditing(true);
                  setEditInput(message.content);
                }}
              >
                <Edit2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>
      </div>
      {message.role === "user" && (
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1 ring-1 ring-border/50">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
});
