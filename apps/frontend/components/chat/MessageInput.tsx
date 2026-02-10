"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void;
  isLoading: boolean;
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1 group">
            <div className="absolute inset-x-0 -top-full p-2 flex justify-center opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1 shadow-lg flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-medium">AI Agent mode active</span>
              </div>
            </div>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message SocialArch AI..."
              className="pr-12 py-6 bg-muted/30 border-border/50 focus:bg-background focus:ring-primary/20 transition-all rounded-2xl shadow-inner-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl transition-all duration-300",
                input.trim() ? "gradient-primary shadow-glow scale-100" : "bg-muted text-muted-foreground scale-90"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
        <div className="mt-2 text-center">
          <p className="text-[10px] text-muted-foreground">
            SocialArch AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
