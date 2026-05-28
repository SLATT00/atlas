'use client';

import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-atlas-bg">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
