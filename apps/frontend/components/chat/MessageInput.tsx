"use client";

import { useState, useRef } from "react";
import { Send, Sparkles, Paperclip, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MessageInputProps {
  onSend: (content: string) => void;
  isLoading: boolean;
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [input, setInput] = useState("");
  const [activeModel, setActiveModel] = useState("SocialArch AI");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const models = ["SocialArch AI", "Creative Writer Pro"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput("");
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Attached file: ${file.name}`);
    }
  };

  return (
    <div className="p-4 border-t border-border/50 bg-background/85 backdrop-blur-md">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className={cn(
            "relative flex flex-col w-full rounded-2xl border border-border/80 bg-muted/15 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-300",
            "focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background/40 focus-within:shadow-[0_0_20px_rgba(var(--primary),0.05)]"
          )}
        >
          {/* File input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Text Area */}
          <div className="px-4 pt-4 pb-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Message SocialArch AI..."
              rows={2}
              className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 placeholder:text-sm focus:outline-none min-h-[48px]"
            />
          </div>

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between px-3 pb-3 pt-2 border-t border-border/30">
            <div className="flex items-center gap-1.5">
              {/* Attach Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleAttachClick}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              {/* Model Selector Dropdown */}
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className="h-8 px-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>{activeModel}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>

                {modelDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setModelDropdownOpen(false)}
                    />
                    <div className="absolute bottom-full left-0 mb-1.5 w-48 rounded-xl border border-border bg-popover p-1 shadow-lg z-40 animate-in fade-in slide-in-from-bottom-2 duration-150">
                      {models.map((model) => (
                        <button
                          key={model}
                          type="button"
                          onClick={() => {
                            setActiveModel(model);
                            setModelDropdownOpen(false);
                            toast.success(`Switched to ${model}`);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center gap-2",
                            model === activeModel
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Sparkles
                            className={cn(
                              "h-3 w-3",
                              model === activeModel ? "text-primary" : "text-muted-foreground/60"
                            )}
                          />
                          {model}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-300",
                input.trim()
                  ? "gradient-primary shadow-glow scale-100 text-primary-foreground"
                  : "bg-muted text-muted-foreground/60 scale-90"
              )}
            >
              <Send className="h-3.5 w-3.5" />
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
