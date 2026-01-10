/**
 * Loading States Components
 * ==========================
 * 
 * Composants réutilisables pour les états de chargement
 */

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// SPINNER
// ============================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <Loader2 className={cn('animate-spin text-blue-500', sizes[size], className)} />
  );
}

// ============================================
// LOADING OVERLAY
// ============================================

interface LoadingOverlayProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingOverlay({ message = 'Chargement...', fullscreen = false }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm',
        fullscreen ? 'fixed inset-0 z-50' : 'absolute inset-0'
      )}
    >
      <Spinner size="xl" />
      {message && (
        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
}

// ============================================
// SKELETON
// ============================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const variants = {
    text: 'h-4',
    rect: 'h-32',
    circle: 'rounded-full aspect-square',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-800 rounded',
        variants[variant],
        className
      )}
    />
  );
}

// ============================================
// SKELETON CARD
// ============================================

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="flex items-start gap-4">
        <Skeleton variant="circle" className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="w-3/4" />
          <Skeleton className="w-full" />
          <Skeleton className="w-5/6" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// SKELETON TABLE
// ============================================

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
// SKELETON LIST
// ============================================

interface SkeletonListProps {
  items?: number;
}

export function SkeletonList({ items = 5 }: SkeletonListProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ============================================
// LOADING BUTTON
// ============================================

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function LoadingButton({ loading, children, disabled, className, ...props }: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// ============================================
// INLINE LOADER
// ============================================

interface InlineLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InlineLoader({ message, size = 'md' }: InlineLoaderProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <Spinner size={size} />
      {message && (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {message}
        </span>
      )}
    </div>
  );
}

// ============================================
// PROGRESS BAR
// ============================================

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({ value, label, showPercentage = true, className }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-slate-700 dark:text-slate-300">{label}</span>}
          {showPercentage && (
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// LOADING DOTS
// ============================================

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// ============================================
// PULSE LOADING
// ============================================

interface PulseLoadingProps {
  message?: string;
}

export function PulseLoading({ message = 'Chargement...' }: PulseLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-blue-900" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
}
