import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/realtime
 * 
 * Endpoint SSE (Server-Sent Events) pour les notifications temps réel
 * 
 * Events supportés:
 * - kpi_update: Mise à jour d'un KPI
 * - alert_new: Nouvelle alerte
 * - alert_resolved: Alerte résolue
 * - report_completed: Rapport terminé
 * - export_ready: Export prêt
 * - data_refresh: Données rafraîchies
 * - system_notification: Notification système
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bureauId = searchParams.get('bureauId');
  const userId = searchParams.get('userId');

  // Créer un ReadableStream pour SSE
  const stream = new ReadableStream({
    start(controller) {
      // Fonction pour envoyer un événement
      const sendEvent = (eventType: string, data: any) => {
        const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(message));
      };

      // Heartbeat pour maintenir la connexion
      const heartbeatInterval = setInterval(() => {
        sendEvent('heartbeat', { timestamp: new Date().toISOString() });
      }, 30000); // 30 secondes

      // Simuler des événements aléatoires
      const eventInterval = setInterval(() => {
        const events = [
          {
            type: 'kpi_update',
            data: {
              id: 'kpi-1',
              name: 'Performance',
              value: Math.round(80 + Math.random() * 15),
              timestamp: new Date().toISOString(),
            },
          },
          {
            type: 'alert_new',
            data: {
              id: `alert-${Date.now()}`,
              severity: Math.random() > 0.5 ? 'high' : 'medium',
              title: 'Nouvelle alerte détectée',
              timestamp: new Date().toISOString(),
            },
          },
          {
            type: 'data_refresh',
            data: {
              scope: 'dashboard',
              timestamp: new Date().toISOString(),
            },
          },
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];
        sendEvent(randomEvent.type, randomEvent.data);
      }, 10000); // Événement toutes les 10 secondes

      // Événement de connexion réussie
      sendEvent('connected', {
        message: 'Connexion établie avec succès',
        bureauId: bureauId || null,
        userId: userId || null,
        timestamp: new Date().toISOString(),
      });

      // Nettoyage lors de la fermeture
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        clearInterval(eventInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Désactiver le buffering nginx
    },
  });
}

