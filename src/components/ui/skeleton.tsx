// ============================================
// Composant Skeleton pour les loaders
// ============================================

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Composant Skeleton pour afficher des placeholders de chargement
 */
export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-slate-700/50 rounded';
  
  const variantClasses = {
    default: 'rounded',
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_infinite]',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      aria-label="Chargement..."
      role="status"
    />
  );
}

/**
 * Skeleton pour une carte d'alerte
 */
export function AlertCardSkeleton() {
  return (
    <Card className="bg-slate-800/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </div>
          <Skeleton variant="circular" width={24} height={24} />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" height={14} />
          <Skeleton variant="text" width="80%" height={14} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" width={60} height={20} />
          <Skeleton variant="rectangular" width={80} height={20} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour la table RACI
 */
export function RACITableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-[2fr_repeat(7,1fr)_1fr] gap-2 p-2">
        <Skeleton variant="text" height={20} />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="text" height={20} />
        ))}
        <Skeleton variant="text" height={20} />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-[2fr_repeat(7,1fr)_1fr] gap-2 p-2">
          <Skeleton variant="text" height={18} />
          {Array.from({ length: 7 }).map((_, j) => (
            <Skeleton key={j} variant="circular" width={32} height={32} />
          ))}
          <Skeleton variant="text" height={18} />
        </div>
      ))}
    </div>
  );
}

