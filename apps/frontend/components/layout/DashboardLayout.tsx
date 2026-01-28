'use client';

import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * @deprecated The dashboard layout logic has been moved to apps/frontend/app/(protected)/layout.tsx
 * This component now serves as a simple passthrough.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return <>{children}</>;
}
