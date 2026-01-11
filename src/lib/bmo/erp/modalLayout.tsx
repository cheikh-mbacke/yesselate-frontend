'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function ErpModalLayout({
  className,
  header,
  footer,
  children,
}: {
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        // IMPORTANT: pas de scroll ici => scroll uniquement dans le body
        'flex max-h-[85vh] w-full flex-col overflow-hidden',
        className
      )}
    >
      {header ? (
        <div className="sticky top-0 z-10 border-b border-slate-200/40 dark:border-slate-700/50 bg-white/90 dark:bg-[#1f1f1f]/90 backdrop-blur">
          {header}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto">{children}</div>

      {footer ? (
        <div className="sticky bottom-0 z-10 border-t border-slate-200/40 dark:border-slate-700/50 bg-white/90 dark:bg-[#1f1f1f]/90 backdrop-blur">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

