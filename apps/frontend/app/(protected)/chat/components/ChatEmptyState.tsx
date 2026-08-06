'use client';

import * as React from 'react';

export function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-3xl w-full mx-auto animate-in fade-in zoom-in-95 duration-500 ease-out">
      <h1 className="text-center text-2xl sm:text-3xl font-normal text-foreground tracking-tight">
        Where should we begin?
      </h1>
    </div>
  );
}
