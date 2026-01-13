'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// ============================================
// TYPES
// ============================================

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ============================================
// CONTEXT
// ============================================

const TicketsClientToastContext = createContext<ToastContextValue | null>(null);

export function useTicketsClientToast(): ToastContextValue {
  const ctx = useContext(TicketsClientToastContext);
  if (!ctx) {
    throw new Error('useTicketsClientToast must be used within TicketsClientToastProvider');
  }
  return ctx;
}

// ============================================
// PROVIDER
// ============================================

export function TicketsClientToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newToast: Toast = { id, type, title, message, duration };
    
    setToasts((prev) => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextValue = {
    success: (title, message) => addToast('success', title, message),
    error: (title, message) => addToast('error', title, message, 6000),
    warning: (title, message) => addToast('warning', title, message, 5000),
    info: (title, message) => addToast('info', title, message),
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const colors: Record<ToastType, string> = {
    success: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40',
    error: 'border-rose-500/30 bg-rose-50 dark:bg-rose-950/40',
    warning: 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/40',
    info: 'border-blue-500/30 bg-blue-50 dark:bg-blue-950/40',
  };

  return (
    <TicketsClientToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
              'animate-in slide-in-from-right-5 fade-in duration-300',
              colors[toast.type]
            )}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {toast.title}
              </div>
              {toast.message && (
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        ))}
      </div>
    </TicketsClientToastContext.Provider>
  );
}

