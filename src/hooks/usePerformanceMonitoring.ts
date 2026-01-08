// ============================================
// Hook pour monitorer les performances avec Web Vitals
// ============================================

import { useEffect } from 'react';

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  delta?: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Hook pour monitorer les performances d'une page
 * @param pageName - Nom de la page pour l'analytics
 */
export function usePerformanceMonitoring(pageName: string) {
  useEffect(() => {
    // Fonction pour envoyer les métriques
    const sendToAnalytics = (metric: WebVitalMetric) => {
      // Log en développement
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${pageName} - ${metric.name}:`, metric.value, metric.rating || '');
      }

      // Envoyer à un service d'analytics (exemple avec Google Analytics)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: pageName,
          value: Math.round(metric.value),
          non_interaction: true,
        });
      }

      // Ou votre propre service
      try {
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: pageName,
            metric: metric.name,
            value: metric.value,
            rating: metric.rating,
            id: metric.id,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Ignorer les erreurs de tracking
        });
      } catch {
        // Ignorer les erreurs
      }
    };

    // Mesurer le temps de rendu initial
    const measureRenderTime = () => {
      if (typeof window === 'undefined' || !window.performance) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const renderTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        sendToAnalytics({
          name: 'CUSTOM_RENDER_TIME',
          value: renderTime,
          id: `${pageName}-render`,
        });
      }
    };

    // Mesurer le temps de rendu React (si disponible)
    const measureReactRender = () => {
      if (typeof window === 'undefined' || !window.performance) return;

      requestAnimationFrame(() => {
        const start = performance.now();
        requestAnimationFrame(() => {
          const end = performance.now();
          sendToAnalytics({
            name: 'CUSTOM_REACT_RENDER',
            value: end - start,
            id: `${pageName}-react-render`,
          });
        });
      });
    };

    // Charger web-vitals dynamiquement si disponible
    let webVitalsLoaded = false;
    const loadWebVitals = async () => {
      try {
        // Essayer de charger web-vitals si installé
        const { onCLS, onFID, onLCP, onFCP, onTTFB } = await import('web-vitals');
        
        onCLS(sendToAnalytics);
        onFID(sendToAnalytics);
        onLCP(sendToAnalytics);
        onFCP(sendToAnalytics);
        onTTFB(sendToAnalytics);
        
        webVitalsLoaded = true;
      } catch {
        // web-vitals n'est pas installé, utiliser les métriques custom uniquement
      }
    };

    // Mesurer immédiatement
    measureRenderTime();
    measureReactRender();

    // Charger web-vitals
    loadWebVitals();

    // Mesurer périodiquement (toutes les 30 secondes)
    const intervalId = setInterval(() => {
      measureReactRender();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [pageName]);
}

