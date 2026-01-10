# 🔄 GUIDE DE MIGRATION - Intégration des Améliorations

## 📋 Vue d'ensemble

Ce guide vous aide à intégrer progressivement les nouvelles fonctionnalités dans votre application existante.

---

## 🎯 Étapes d'Intégration

### Étape 1: Installation des Dépendances

```bash
# Installer les packages nécessaires (si pas déjà installés)
npm install zod
npm install --save-dev vitest @vitest/ui
```

### Étape 2: Configuration Vitest

Créer/modifier `vitest.config.ts` :

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Créer `src/__tests__/setup.ts` :

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});
```

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 🔧 Intégration Service par Service

### 1. Cache Service

#### A. Intégration de base

Dans votre API route existante :

```typescript
// app/api/calendar/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCachedCalendarStats } from '@/lib/services/cacheService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bureau = searchParams.get('bureau') || undefined;

  // Utiliser cache
  const stats = await getCachedCalendarStats(bureau);

  return NextResponse.json(stats);
}
```

#### B. Invalidation après modification

```typescript
// app/api/calendar/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { invalidateCalendarCache } from '@/lib/services/cacheService';

export async function POST(req: NextRequest) {
  const data = await req.json();
  
  // Créer événement
  const event = await prisma.calendarEvent.create({ data });

  // Invalider cache
  await invalidateCalendarCache(event.bureauId);

  return NextResponse.json(event);
}
```

#### C. Configuration Redis (Production)

Installer Redis:
```bash
npm install ioredis
```

Modifier `cacheService.ts` :

```typescript
import Redis from 'ioredis';

private client: Redis;

constructor(config?: CacheConfig) {
  // En production, utiliser Redis
  if (process.env.NODE_ENV === 'production') {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }
}

async get<T>(key: CacheKey): Promise<T | null> {
  if (this.client) {
    const value = await this.client.get(this.getFullKey(key));
    return value ? JSON.parse(value) : null;
  }
  // Sinon utiliser Map (dev)
  // ...
}
```

Ajouter dans `.env` :

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

---

### 2. Rate Limiting

#### A. Middleware global

Créer/modifier `middleware.ts` à la racine :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRateLimitMiddleware, RATE_LIMITS } from '@/lib/middleware/rateLimiter';

export async function middleware(req: NextRequest) {
  // Rate limit pour toutes les API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const limiter = createRateLimitMiddleware(RATE_LIMITS.AUTHENTICATED);
    const response = await limiter(req);
    if (response) return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

#### B. Rate limit spécifique par route

```typescript
// app/api/calendar/export/route.ts
import { withRateLimit, RATE_LIMITS } from '@/lib/middleware/rateLimiter';

export async function GET(req: NextRequest) {
  return withRateLimit(
    async (req) => {
      // Logique d'export
      const data = await generateExport();
      return NextResponse.json(data);
    },
    RATE_LIMITS.EXPORT // 5 req/5min
  )(req);
}
```

#### C. Whitelist d'IPs

```typescript
// Dans un script d'initialisation
import rateLimiter from '@/lib/middleware/rateLimiter';

// IPs de confiance (serveurs internes, monitoring)
rateLimiter.addToWhitelist('192.168.1.100');
rateLimiter.addToWhitelist('10.0.0.50');
```

---

### 3. Webhooks

#### A. Configuration initiale

Créer table Prisma pour webhooks:

```prisma
// prisma/schema.prisma
model Webhook {
  id        String   @id @default(cuid())
  url       String
  secret    String
  events    String[] // JSON array
  enabled   Boolean  @default(true)
  retryCount Int     @default(3)
  timeout   Int      @default(10000)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([enabled])
}

model WebhookLog {
  id         String   @id @default(cuid())
  webhookId  String
  event      String
  payload    Json
  statusCode Int?
  success    Boolean
  error      String?
  responseTime Int?
  retries    Int      @default(0)
  timestamp  DateTime @default(now())

  @@index([webhookId, timestamp])
  @@index([success])
}
```

Migrer:
```bash
npx prisma migrate dev --name add_webhooks
```

#### B. Enregistrer un webhook (UI Admin)

```typescript
// app/api/admin/webhooks/route.ts
import { WebhookService } from '@/lib/services/webhookService';

export async function POST(req: NextRequest) {
  const data = await req.json();
  
  const webhookId = await WebhookService.getInstance().registerWebhook({
    url: data.url,
    secret: data.secret,
    events: data.events,
    enabled: true,
  });

  return NextResponse.json({ id: webhookId });
}
```

#### C. Envoyer webhooks depuis votre code

```typescript
// Dans votre service de création d'événement
import { notifyCalendarEventCreated } from '@/lib/services/webhookService';

export async function createCalendarEvent(data: any) {
  const event = await prisma.calendarEvent.create({ data });

  // Notifier webhook
  await notifyCalendarEventCreated(event);

  return event;
}
```

#### D. Tester un webhook

```typescript
// app/api/admin/webhooks/[id]/test/route.ts
import { WebhookService } from '@/lib/services/webhookService';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await WebhookService.getInstance().testWebhook(params.id);
  return NextResponse.json(result);
}
```

---

### 4. Monitoring

#### A. Intégrer dans les API routes

```typescript
// app/api/calendar/events/route.ts
import { monitoring } from '@/lib/services/monitoringService';

export async function GET(req: NextRequest) {
  return monitoring.measure(
    'api.calendar.events.get',
    async () => {
      const events = await prisma.calendarEvent.findMany();
      
      // Tracker métrique business
      monitoring.incrementCounter('api.requests', {
        endpoint: '/api/calendar/events',
        method: 'GET',
      });

      return NextResponse.json(events);
    }
  );
}
```

#### B. Endpoint de métriques

```typescript
// app/api/monitoring/metrics/route.ts
import { monitoring } from '@/lib/services/monitoringService';
import { NextResponse } from 'next/server';

export async function GET() {
  const snapshot = monitoring.getSnapshot();
  return NextResponse.json(snapshot);
}

// Format Prometheus
export async function GET_PROMETHEUS() {
  const metrics = monitoring.exportPrometheus();
  return new NextResponse(metrics, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
```

#### C. Dashboard de monitoring (React)

```typescript
// app/(portals)/admin/monitoring/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const res = await fetch('/api/monitoring/metrics');
      const data = await res.json();
      setMetrics(data);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Refresh 5s

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Monitoring</h1>

      {/* Health Status */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">System Health</h2>
        <div className={`p-4 rounded ${
          metrics.health.status === 'healthy' ? 'bg-green-100' :
          metrics.health.status === 'degraded' ? 'bg-yellow-100' :
          'bg-red-100'
        }`}>
          Status: {metrics.health.status.toUpperCase()}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Performance</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-600">Avg Latency</div>
            <div className="text-2xl font-bold">
              {metrics.performance?.avgDuration?.toFixed(0) || 0}ms
            </div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-2xl font-bold">
              {metrics.performance?.successRate?.toFixed(1) || 0}%
            </div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-600">P95 Latency</div>
            <div className="text-2xl font-bold">
              {metrics.performance?.p95?.toFixed(0) || 0}ms
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Errors</h2>
        <div className="bg-white rounded shadow overflow-hidden">
          {metrics.errors?.recent?.map((error: any, i: number) => (
            <div key={i} className="p-3 border-b hover:bg-gray-50">
              <div className="font-semibold text-red-600">{error.type}</div>
              <div className="text-sm text-gray-600">{error.message}</div>
              <div className="text-xs text-gray-400">
                {new Date(error.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### 5. Optimisations Prisma

#### A. DataLoader pour éviter N+1

```typescript
// lib/loaders.ts
import { createUserLoader } from '@/lib/services/prismaOptimization';
import { prisma } from '@/lib/prisma';

export const loaders = {
  user: createUserLoader(prisma),
};
```

Dans vos composants/API:

```typescript
// Au lieu de:
const events = await prisma.calendarEvent.findMany();
for (const event of events) {
  const organizer = await prisma.user.findUnique({
    where: { id: event.organizerId }
  }); // N+1 queries !
}

// Utiliser:
import { loaders } from '@/lib/loaders';

const events = await prisma.calendarEvent.findMany();
for (const event of events) {
  const organizer = await loaders.user.load(event.organizerId); // Batché !
}
```

#### B. Pagination cursor-based

```typescript
// app/api/calendar/events/route.ts
import { paginateCursorBased } from '@/lib/services/prismaOptimization';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor') || undefined;
  const limit = parseInt(searchParams.get('limit') || '20');

  const result = await paginateCursorBased(
    prisma.calendarEvent,
    { deletedAt: null },
    { cursor, limit }
  );

  return NextResponse.json(result);
}
```

Dans votre frontend:

```typescript
const [events, setEvents] = useState([]);
const [cursor, setCursor] = useState<string | undefined>();

const loadMore = async () => {
  const res = await fetch(`/api/calendar/events?cursor=${cursor}&limit=20`);
  const data = await res.json();
  
  setEvents([...events, ...data.data]);
  setCursor(data.pagination.nextCursor);
};
```

#### C. Bulk operations

```typescript
// Créer plusieurs événements en masse
import { bulkInsert } from '@/lib/services/prismaOptimization';

const events = [
  { title: 'Event 1', start: new Date(), ... },
  { title: 'Event 2', start: new Date(), ... },
  // ... 1000 events
];

const result = await bulkInsert(prisma.calendarEvent, events, 100);
// → { success: 995, failed: 5, errors: [...] }
```

#### D. Monitoring Prisma

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { createMonitoredPrismaClient } from '@/lib/services/prismaOptimization';

const prismaClient = new PrismaClient();

// Wrapper avec monitoring
export const prisma = createMonitoredPrismaClient(prismaClient);
```

---

## 📊 Monitoring en Production

### Configuration Grafana (optionnel)

1. **Exposer endpoint Prometheus:**

```typescript
// app/api/metrics/route.ts
import { monitoring } from '@/lib/services/monitoringService';

export async function GET() {
  const metrics = monitoring.exportPrometheus();
  return new Response(metrics, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
```

2. **Configurer Prometheus (`prometheus.yml`):**

```yaml
scrape_configs:
  - job_name: 'yesselate-bmo'
    scrape_interval: 15s
    static_configs:
      - targets: ['your-app.com']
    metrics_path: '/api/metrics'
```

3. **Créer dashboard Grafana:**

- Import dashboard avec métriques:
  - Request rate (req/s)
  - Error rate (%)
  - Latency (p50, p95, p99)
  - Cache hit rate (%)

---

## 🧪 Lancer les Tests

```bash
# Tests unitaires
npm run test

# Avec UI
npm run test:ui

# Coverage
npm run test:coverage

# Watch mode (dev)
npm run test -- --watch
```

---

## ✅ Checklist d'Intégration

### Phase 1: Foundation
- [ ] Installer dépendances (vitest, zod)
- [ ] Configurer vitest
- [ ] Lancer tests pour vérifier

### Phase 2: Cache
- [ ] Intégrer CacheService dans 1-2 API routes
- [ ] Tester hit/miss rates
- [ ] Configurer Redis (production)

### Phase 3: Rate Limiting
- [ ] Ajouter middleware global
- [ ] Configurer limites par endpoint
- [ ] Whitelist IPs internes

### Phase 4: Monitoring
- [ ] Wrapper API routes avec monitoring.measure()
- [ ] Créer endpoint /api/monitoring/metrics
- [ ] Dashboard de monitoring (optionnel)

### Phase 5: Webhooks
- [ ] Créer tables Webhook/WebhookLog
- [ ] Interface admin pour webhooks
- [ ] Intégrer notifications dans services

### Phase 6: Optimisations Prisma
- [ ] DataLoader pour queries fréquentes
- [ ] Pagination cursor-based
- [ ] Wrapper monitored Prisma client

### Phase 7: Production
- [ ] Tests de charge (k6, artillery)
- [ ] Configuration Redis
- [ ] Prometheus/Grafana (optionnel)
- [ ] Alertes (Slack, email)

---

## 🚨 Points d'Attention

### 1. Cache Invalidation

**Important:** Toujours invalider le cache après modifications !

```typescript
// ✅ BON
await prisma.calendarEvent.create({ data });
await invalidateCalendarCache(data.bureauId);

// ❌ MAUVAIS (cache stale)
await prisma.calendarEvent.create({ data });
// Oubli d'invalider !
```

### 2. Rate Limiting en Dev

En développement, le rate limiting peut être gênant. Ajoutez dans votre `.env.local`:

```env
DISABLE_RATE_LIMIT=true
```

Et dans le middleware:

```typescript
if (process.env.DISABLE_RATE_LIMIT === 'true') {
  return NextResponse.next();
}
```

### 3. Webhooks Timeout

Par défaut, timeout de 10s. Pour webhooks lents:

```typescript
await webhookService.registerWebhook({
  url: '...',
  secret: '...',
  events: [...],
  enabled: true,
  timeout: 30000, // 30s
});
```

### 4. Monitoring Performance

Le monitoring ajoute ~5-10ms de latence. Pour endpoints ultra-critiques, désactiver:

```typescript
// Sans monitoring
export async function GET() {
  const data = await fastQuery();
  return NextResponse.json(data);
}
```

---

## 📞 Support

- **Documentation:** Voir commentaires dans les fichiers
- **Tests:** `npm run test:ui` pour explorer
- **Exemples:** Voir fichiers de test pour usage

---

**Bonne intégration ! 🚀**

