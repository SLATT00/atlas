import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-secondary text-atlas-text-secondary">{label}</label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full px-4 py-3 bg-atlas-card border rounded-xl text-body text-atlas-text',
            'placeholder:text-atlas-muted transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-atlas-accent/50 focus:border-atlas-accent',
            error ? 'border-atlas-error' : 'border-white/10',
            className
          )}
          {...props}
        />
        {error && <p className="text-label text-atlas-error">{error}</p>}
        {hint && !error && <p className="text-label text-atlas-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
