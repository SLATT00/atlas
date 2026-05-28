import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-atlas-accent/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-atlas-accent text-atlas-bg hover:bg-atlas-accent-alt active:scale-[0.98]': variant === 'primary',
            'bg-atlas-card border border-white/10 text-atlas-text hover:bg-atlas-elevated': variant === 'secondary',
            'bg-transparent text-atlas-text-secondary hover:text-atlas-text hover:bg-white/5': variant === 'ghost',
            'bg-atlas-error/10 text-atlas-error hover:bg-atlas-error/20': variant === 'danger',
            'px-3 py-1.5 text-secondary': size === 'sm',
            'px-5 py-2.5 text-body': size === 'md',
            'px-6 py-3.5 text-body': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
