'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const ToastContext = createContext<ToastContextValue | null>(null);

export function useProjectToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useProjectToast must be used within ProjectToastProvider');
  }
  return context;
}

export function ProjectToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const contextValue: ToastContextValue = {
    success: (title, message) => addToast('success', title, message),
    error: (title, message) => addToast('error', title, message, 7000),
    warning: (title, message) => addToast('warning', title, message, 6000),
    info: (title, message) => addToast('info', title, message),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-300',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      bg: 'bg-rose-500/10 border-rose-500/30',
      iconColor: 'text-rose-400',
      titleColor: 'text-rose-300',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bg: 'bg-amber-500/10 border-amber-500/30',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-300',
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bg: 'bg-blue-500/10 border-blue-500/30',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-300',
    },
  };

  const style = config[toast.type];

  return (
    <div
      className={cn(
        'p-4 rounded-xl border backdrop-blur-sm animate-in slide-in-from-right',
        style.bg
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-none', style.iconColor)}>
          {style.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={cn('font-semibold text-sm', style.titleColor)}>
            {toast.title}
          </div>
          {toast.message && (
            <div className="text-sm text-slate-400 mt-1">
              {toast.message}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-none p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

