// ============================================
// Hook pour le tracking analytics
// ============================================

import { useCallback } from 'react';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: string;
  page?: string;
}

/**
 * Hook pour tracker les événements analytics
 */
export function useAnalytics() {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return;

    const event: AnalyticsEvent = {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
    };

    // Google Analytics (si disponible)
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, {
        ...properties,
        page_path: window.location.pathname,
      });
    }

    // Votre propre service d'analytics
    try {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {
        // Ignorer les erreurs de tracking
      });
    } catch {
      // Ignorer les erreurs
    }

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, properties);
    }
  }, []);

  const trackPageView = useCallback(
    (pageName: string, properties?: Record<string, any>) => {
      trackEvent('page_view', {
        page_name: pageName,
        ...properties,
      });
    },
    [trackEvent]
  );

  return { trackEvent, trackPageView };
}

