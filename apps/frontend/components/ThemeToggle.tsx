'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Use useSyncExternalStore to check if we're on the client
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getAriaLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system mode';
      case 'system':
        return 'Switch to light mode';
      default:
        return 'Switch theme';
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? 'default' : 'icon'}
      className={cn("h-9 relative", showLabel ? "justify-start px-2 w-full" : "w-9", className)}
      onClick={cycleTheme}
      aria-label={getAriaLabel()}
    >
      <div className="flex items-center gap-2">
        <div className={cn("relative flex items-center justify-center", showLabel ? "w-5 h-5" : "w-4 h-4")}>
          <Sun
            className={`absolute transition-all duration-300 ${
              theme === 'light'
                ? 'rotate-0 scale-100 opacity-100'
                : 'rotate-90 scale-0 opacity-0'
            } ${showLabel ? 'h-5 w-5' : 'h-4 w-4'}`}
          />
          <Moon
            className={`absolute transition-all duration-300 ${
              theme === 'dark'
                ? 'rotate-0 scale-100 opacity-100'
                : 'rotate-90 scale-0 opacity-0'
            } ${showLabel ? 'h-5 w-5' : 'h-4 w-4'}`}
          />
          <Monitor
            className={`absolute transition-all duration-300 ${
              theme === 'system'
                ? 'rotate-0 scale-100 opacity-100'
                : 'rotate-90 scale-0 opacity-0'
            } ${showLabel ? 'h-5 w-5' : 'h-4 w-4'}`}
          />
        </div>
        {showLabel && (
          <span className="text-sm font-medium">
            {theme ? theme.charAt(0).toUpperCase() + theme.slice(1) : 'System'}
          </span>
        )}
      </div>
    </Button>
  );
}
