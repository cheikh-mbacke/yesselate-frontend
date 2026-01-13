// Service Worker pour le calendrier - Mode hors ligne
const CACHE_NAME = 'calendrier-v1';
const DATA_CACHE = 'calendrier-data-v1';

// Ressources à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/maitre-ouvrage/calendrier',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation du Service Worker calendrier');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Erreur lors du cache initial:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation du Service Worker calendrier');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DATA_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Stratégie: Network First, puis Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Pour les données du calendrier, utiliser Cache First
  if (url.pathname.includes('/calendrier') || url.pathname.includes('/api/calendrier')) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Retourner le cache immédiatement
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  cache.put(request, networkResponse.clone());
                }
              })
              .catch(() => {
                // Hors ligne, utiliser le cache
              });
            return cachedResponse;
          }

          // Pas de cache, essayer le réseau
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Hors ligne et pas de cache
              return new Response(
                JSON.stringify({ error: 'Hors ligne', cached: false }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            });
        });
      })
    );
    return;
  }

  // Pour les autres ressources, Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || new Response('Hors ligne', { status: 503 });
        });
      })
  );
});

// Gestion des messages depuis l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CALENDRIER_DATA') {
    const { data } = event.data;
    caches.open(DATA_CACHE).then((cache) => {
      cache.put(
        new Request('/calendrier/data'),
        new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  }

  if (event.data && event.data.type === 'GET_CALENDRIER_DATA') {
    caches.open(DATA_CACHE).then((cache) => {
      cache.match('/calendrier/data').then((response) => {
        if (response) {
          response.json().then((data) => {
            event.ports[0].postMessage({ success: true, data });
          });
        } else {
          event.ports[0].postMessage({ success: false, data: null });
        }
      });
    });
  }
});

