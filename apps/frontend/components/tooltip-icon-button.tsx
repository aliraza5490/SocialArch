"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TooltipIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip: string;
  side?: "top" | "right" | "bottom" | "left";
  icon?: React.ReactNode;
}

export const TooltipIconButton = React.forwardRef<HTMLButtonElement, TooltipIconButtonProps>(
  ({ tooltip, side = "top", className, children, icon, ...props }, ref) => {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={ref}
              type="button"
              className={cn(
                "inline-flex items-center justify-center rounded-full p-2 text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 transition-colors cursor-pointer shrink-0",
                className
              )}
              {...props}
            >
              {children || icon}
            </button>
          </TooltipTrigger>
          <TooltipContent side={side} className="text-xs px-2.5 py-1 font-medium z-50">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

TooltipIconButton.displayName = "TooltipIconButton";
