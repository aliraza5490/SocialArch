'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export interface MarkdownContentProps {
  content: string;
  className?: string;
}

function preprocessMarkdown(content: string): string {
  if (!content) return '';
  return content
    // LaTeX arrows
    .replace(/\$\\rightarrow\$/g, '→')
    .replace(/\\rightarrow\b/g, '→')
    .replace(/\$\\to\$/g, '→')
    .replace(/\\to\b/g, '→')
    .replace(/\$\\leftarrow\$/g, '←')
    .replace(/\\leftarrow\b/g, '←')
    .replace(/\$\\Rightarrow\$/g, '⇒')
    .replace(/\\Rightarrow\b/g, '⇒')
    .replace(/\$\\Leftarrow\$/g, '⇐')
    .replace(/\\Leftarrow\b/g, '⇐')
    .replace(/\$\\leftrightarrow\$/g, '↔')
    .replace(/\\leftrightarrow\b/g, '↔')
    .replace(/\$\\Leftrightarrow\$/g, '⇔')
    .replace(/\\Leftrightarrow\b/g, '⇔')
    // Common LaTeX math symbols
    .replace(/\$\\cdot\$/g, '•')
    .replace(/\\cdot\b/g, '•')
    .replace(/\$\\times\$/g, '×')
    .replace(/\\times\b/g, '×')
    .replace(/\$\\approx\$/g, '≈')
    .replace(/\\approx\b/g, '≈')
    .replace(/\$\\le\$/g, '≤')
    .replace(/\\le\b/g, '≤')
    .replace(/\$\\ge\$/g, '≥')
    .replace(/\\ge\b/g, '≥')
    .replace(/\$\\ne\$/g, '≠')
    .replace(/\\ne\b/g, '≠')
    // Clean up single dollar signs enclosing standalone symbols
    .replace(/\$([→←⇒⇐↔⇔•×≈≤≥≠])\$/g, '$1');
}

const markdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => (
    <h1 className="text-lg md:text-xl font-bold mt-6 mb-2 text-foreground leading-snug tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base md:text-lg font-semibold mt-6 mb-2 text-foreground leading-snug tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm md:text-base font-semibold mt-5 mb-1.5 text-foreground leading-snug">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold mt-4 mb-1.5 text-foreground leading-snug">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-3.5 last:mb-0 leading-relaxed">
      {children}
    </p>
  ),
  hr: () => (
    <hr className="my-6 border-t border-border/60" />
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 my-3 space-y-1.5">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 my-3 space-y-1.5">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed pl-1">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/70 pl-4 py-1 my-4 italic text-muted-foreground bg-muted/20 rounded-r">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">
      {children}
    </strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs text-left border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted/60 text-muted-foreground border-b border-border">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-border">{children}</tbody>
  ),
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th className="px-3 py-2 font-medium">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2">{children}</td>,
  code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
    const match = /language-(\w+)/.exec(className || '');
    return match ? (
      <pre className="bg-muted/80 dark:bg-muted/40 p-3 rounded-lg overflow-x-auto my-3 text-xs font-mono border border-border/50">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="bg-muted/80 dark:bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono font-medium text-foreground" {...props}>
        {children}
      </code>
    );
  },
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn('prose dark:prose-invert prose-sm max-w-none text-foreground leading-relaxed break-words font-sans', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {preprocessMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
