'use client';

import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4 p-8 rounded-lg border border-destructive/50 bg-destructive/10 max-w-md">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <div className="text-center">
              <h1 className="text-xl font-semibold mb-2">
                Something went wrong
              </h1>
              <p className="text-sm text-muted-foreground mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-xs font-mono text-destructive hover:underline">
                    Error details (dev only)
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs bg-black text-green-400 p-2 rounded max-h-48">
                    {this.state.error?.toString()}
                    {'\n\n'}
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
