import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-label font-medium',
        {
          'bg-atlas-success/15 text-atlas-success': variant === 'success',
          'bg-atlas-warning/15 text-atlas-warning': variant === 'warning',
          'bg-atlas-error/15 text-atlas-error': variant === 'error',
          'bg-atlas-accent/15 text-atlas-accent': variant === 'info',
          'bg-white/10 text-atlas-text-secondary': variant === 'neutral',
        }
      )}
    >
      {children}
    </span>
  );
}
