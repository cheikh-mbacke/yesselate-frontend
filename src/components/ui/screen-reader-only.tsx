// ============================================
// Composant pour masquer visuellement mais garder accessible
// ============================================

import { cn } from '@/lib/utils';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Composant pour masquer visuellement du contenu mais le garder accessible aux lecteurs d'écran
 */
export function ScreenReaderOnly({ children, className }: ScreenReaderOnlyProps) {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  );
}
