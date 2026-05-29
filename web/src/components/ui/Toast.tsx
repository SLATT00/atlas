'use client';

import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };
  const Icon = icons[toast.type];

  return (
    <div
      className={clsx(
        'pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm animate-slide-in',
        {
          'bg-atlas-success/10 border-atlas-success/20': toast.type === 'success',
          'bg-atlas-error/10 border-atlas-error/20': toast.type === 'error',
          'bg-atlas-warning/10 border-atlas-warning/20': toast.type === 'warning',
          'bg-atlas-accent/10 border-atlas-accent/20': toast.type === 'info',
        }
      )}
    >
      <Icon
        size={18}
        className={clsx({
          'text-atlas-success': toast.type === 'success',
          'text-atlas-error': toast.type === 'error',
          'text-atlas-warning': toast.type === 'warning',
          'text-atlas-accent': toast.type === 'info',
        })}
      />
      <p className="flex-1 text-secondary text-atlas-text">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="p-1 rounded hover:bg-white/5">
        <X size={14} className="text-atlas-muted" />
      </button>
    </div>
  );
}
