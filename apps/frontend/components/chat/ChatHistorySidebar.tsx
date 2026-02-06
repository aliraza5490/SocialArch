import { useState } from "react";
import { MessageSquare, Plus, Trash2, MoreHorizontal, Search, Clock, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  isActive?: boolean;
}

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  activeSessionId?: string;
  isMobileOverlay?: boolean;
}

const mockSessions: ChatSession[] = [
  {
    id: "1",
    title: "Instagram Post Ideas",
    preview: "Generate 5 engaging captions for...",
    timestamp: new Date(),
  },
  {
    id: "2",
    title: "Video Script - Product Launch",
    preview: "Create a 30-second video script...",
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: "3",
    title: "Twitter Thread",
    preview: "Write a viral thread about...",
    timestamp: new Date(Date.now() - 172800000),
  },
  {
    id: "4",
    title: "Blog Post Outline",
    preview: "Help me outline a blog post...",
    timestamp: new Date(Date.now() - 259200000),
  },
  {
    id: "5",
    title: "Facebook Ad Copy",
    preview: "Create compelling ad copy for...",
    timestamp: new Date(Date.now() - 345600000),
  },
];

export function ChatHistorySidebar({
  isOpen,
  onToggle,
  onNewChat,
  onSelectChat,
  activeSessionId = "1",
  isMobileOverlay = false,
  sessions = [],
  onDeleteChat,
  onUpdateTitle,
}: ChatHistorySidebarProps & { sessions: ChatSession[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Group sessions by date
  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const dateKey = formatDate(session.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  return (
    <div
      className={cn(
        "h-full flex flex-col transition-all duration-300 ease-in-out",
        isMobileOverlay
          ? "w-full bg-card/30 backdrop-blur-sm"
          : "bg-card/30 backdrop-blur-sm border-r border-border/50",
        !isMobileOverlay && (isOpen ? "w-64 sm:w-72 lg:w-80" : "w-0 overflow-hidden border-r-0")
      )}
    >
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          {isMobileOverlay && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Chat History</h3>
            <p className="text-[10px] text-muted-foreground">{sessions.length} conversations</p>
          </div>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full gradient-primary shadow-glow hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 h-9"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm bg-muted/30 border-border/50 focus:bg-muted/50 transition-colors"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-0">
        <div className="space-y-4 px-2 py-2">
          {Object.entries(groupedSessions).map(([dateKey, dateSessions]) => (
            <div key={dateKey} className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Clock className="h-3 w-3 text-muted-foreground/70" />
                <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                  {dateKey}
                </span>
              </div>
              {dateSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group flex items-start gap-3 p-3 mx-1 rounded-xl cursor-pointer transition-all duration-200",
                    session.id === activeSessionId
                      ? "bg-primary/10 shadow-sm ring-1 ring-primary/10"
                      : "hover:bg-muted/40"
                  )}
                  onClick={() => onSelectChat(session.id)}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    session.id === activeSessionId
                      ? "bg-primary/20 text-primary"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                  )}>
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className={cn(
                      "text-sm font-medium truncate transition-colors",
                      session.id === activeSessionId ? "text-primary" : "text-foreground"
                    )}>
                      {session.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {session.preview}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0 hover:bg-background/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem 
                        className="text-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(session.id);
                            setEditTitle(session.title);
                        }}
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive text-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(session.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>AI Ready</span>
        </div>
      </div>
    </div>
  );
}