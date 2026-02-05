'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MobileOptimizationsProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

export function MobileOptimizations({ children, onRefresh }: MobileOptimizationsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Pull-to-refresh
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onRefresh) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === 0) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      if (distance > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(distance, 100));
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 50) {
        setIsRefreshing(true);
        onRefresh();
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 1000);
      } else {
        setPullDistance(0);
      }
      startY.current = 0;
      currentY.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, onRefresh]);

  // Gestes de navigation (swipe gauche/droite)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleSwipeStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleSwipeEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchStartX - touchEndX;
      const minSwipeDistance = 50;

      if (Math.abs(swipeDistance) > minSwipeDistance) {
        // Swipe gauche = suivant, swipe droite = précédent
        // Peut être utilisé pour navigation entre sections
        // Pour l'instant, on ne fait rien mais la structure est là
      }
    };

    container.addEventListener('touchstart', handleSwipeStart);
    container.addEventListener('touchend', handleSwipeEnd);

    return () => {
      container.removeEventListener('touchstart', handleSwipeStart);
      container.removeEventListener('touchend', handleSwipeEnd);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Indicateur pull-to-refresh */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm"
          style={{ height: `${Math.min(pullDistance, 100)}px` }}
        >
          <div className="text-sm text-blue-400">
            {pullDistance > 50 ? 'Relâchez pour actualiser' : 'Tirez pour actualiser'}
          </div>
        </div>
      )}

      {/* Indicateur de rafraîchissement */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-16 bg-blue-500/20 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400" />
        </div>
      )}

      {children}
    </div>
  );
}

