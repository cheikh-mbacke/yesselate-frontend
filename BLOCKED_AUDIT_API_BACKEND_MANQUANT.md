# 🚨 AUDIT CRITIQUE : API BACKEND MANQUANT POUR BLOCKED

**Date** : 2026-01-10  
**Priorité** : 🔴 **CRITIQUE - BLOQUANT PRODUCTION**  
**Impact** : ⚠️ **Le module Blocked ne peut PAS fonctionner en production**

---

## 📊 DÉCOUVERTE

Après analyse approfondie du codebase, j'ai découvert que **le module "Dossiers Bloqués" n'a AUCUNE route API backend Next.js** !

### Comparaison Analytics vs Blocked

#### ✅ Analytics (9 routes API complètes)
```
app/api/analytics/
├── alerts/route.ts        ✅ GET/POST alertes
├── comparison/route.ts    ✅ GET comparaisons
├── export/route.ts        ✅ POST exports
├── kpis/route.ts          ✅ GET/POST KPIs
├── performance/route.ts   ✅ GET performance
├── predictive/route.ts    ✅ GET analytics prédictives
├── reports/route.ts       ✅ GET/POST rapports
├── stats/route.ts         ✅ GET statistiques
└── trends/route.ts        ✅ GET tendances
```

#### ❌ Blocked (0 routes API)
```
app/api/bmo/blocked/       ❌ N'EXISTE PAS
app/api/blocked/           ❌ N'EXISTE PAS
```

### Ce qui existe actuellement

1. **Service Frontend Mock** : `src/lib/services/blockedApiService.ts`
   - ✅ Architecture complète
   - ❌ Utilise UNIQUEMENT des données mock
   - ❌ Aucun appel API réel
   - ⚠️ Tous les calls sont commentés :

```typescript
// ligne 232 de blockedApiService.ts
// En production: 
// const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), ...filter });
// const response = await fetch(`${this.baseUrl}?${params}`);  // ❌ COMMENTÉ
// return response.json();

// Mock data for now  // ⚠️ TOUT EST MOCK
const { blockedDossiers } = await import('@/lib/data');
```

2. **Base URL configurée mais inutilisée** :
```typescript
private baseUrl = '/api/bmo/blocked';  // ⚠️ Cette route n'existe pas !
```

---

## 🚨 IMPACT CRITIQUE

### 1. **Module Non Fonctionnel en Production**
Sans API backend :
- ❌ Impossible de récupérer les vrais dossiers bloqués
- ❌ Impossible de résoudre un blocage
- ❌ Impossible d'escalader
- ❌ Impossible de substituer
- ❌ Impossible d'exporter
- ❌ Impossible de synchroniser les stats en temps réel

### 2. **WebSocket Inutile**
Le service `blockedWebSocket.ts` est configuré mais :
- ❌ Aucun endpoint backend pour recevoir les events
- ❌ Aucun serveur WebSocket configuré
- ❌ Le frontend ne peut pas recevoir de notifications temps réel

### 3. **React Query Hooks Inutilisables**
Les hooks qu'on voulait créer (`useBlocked.ts`) seront inutiles sans API.

### 4. **Données Statiques Obsolètes**
Toutes les données viennent de `@/lib/data` (fichier statique) :
- ❌ Ne reflète pas l'état réel
- ❌ Aucune mise à jour possible
- ❌ Aucune synchronisation multi-utilisateurs

---

## 🎯 SOLUTION : CRÉER LES ROUTES API BACKEND

### Architecture Recommandée

```
app/api/bmo/blocked/
├── route.ts                    # GET (list), POST (create)
├── [id]/
│   ├── route.ts               # GET (detail), PATCH (update), DELETE
│   ├── resolve/route.ts       # POST - Résoudre un blocage
│   ├── escalate/route.ts      # POST - Escalader
│   ├── substitute/route.ts    # POST - Substituer
│   ├── reassign/route.ts      # POST - Réaffecter
│   ├── comment/route.ts       # POST - Ajouter commentaire
│   ├── audit/route.ts         # GET - Audit trail
│   └── timeline/route.ts      # GET - Timeline
├── stats/route.ts             # GET - Statistiques temps réel
├── matrix/route.ts            # GET - Matrice impact x délai
├── bureaux/route.ts           # GET - Stats par bureau
├── timeline/route.ts          # GET - Timeline globale
├── decisions/route.ts         # GET - Décisions en attente
├── export/route.ts            # POST - Export Excel/PDF
├── bulk/route.ts              # POST - Actions groupées
└── search/route.ts            # GET - Recherche avancée
```

---

## 📝 CODE À CRÉER

### 1. Route Principale : `app/api/bmo/blocked/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bmo/blocked
 * Récupère la liste des dossiers bloqués avec filtres
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const skip = (page - 1) * pageSize;
    
    // Filtres
    const impact = searchParams.get('impact');
    const bureau = searchParams.get('bureau');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build where clause
    const where: any = {};
    
    if (impact && impact !== 'all') {
      where.impact = impact;
    }
    
    if (bureau) {
      where.bureauCode = bureau;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Fetch data
    const [dossiers, total] = await Promise.all([
      prisma.blockedDossier.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { priority: 'desc' },
          { delay: 'desc' },
        ],
        include: {
          bureau: true,
          assignedTo: true,
          comments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          auditLog: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.blockedDossier.count({ where }),
    ]);
    
    return NextResponse.json({
      data: dossiers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
    
  } catch (error) {
    console.error('Error fetching blocked dossiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked dossiers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bmo/blocked
 * Créer un nouveau dossier bloqué
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      subject,
      description,
      impact,
      type,
      bureauCode,
      assignedToId,
      dueDate,
      amount,
    } = body;
    
    // Validation
    if (!subject || !impact || !type || !bureauCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Calculer la priorité
    const impactScore = { critical: 4, high: 3, medium: 2, low: 1 };
    const delay = dueDate ? Math.floor((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
    const priority = impactScore[impact as keyof typeof impactScore] * (delay > 0 ? 1 / delay : 10);
    
    // Créer le dossier
    const dossier = await prisma.blockedDossier.create({
      data: {
        subject,
        description,
        impact,
        type,
        bureauCode,
        assignedToId,
        dueDate: dueDate ? new Date(dueDate) : null,
        amount: amount || null,
        priority,
        delay,
        status: 'pending',
        auditLog: {
          create: {
            action: 'created',
            actorId: 'SYSTEM', // TODO: Get from session
            actorName: 'Système',
            details: 'Dossier bloqué créé',
          },
        },
      },
      include: {
        bureau: true,
        assignedTo: true,
      },
    });
    
    return NextResponse.json(dossier, { status: 201 });
    
  } catch (error) {
    console.error('Error creating blocked dossier:', error);
    return NextResponse.json(
      { error: 'Failed to create blocked dossier' },
      { status: 500 }
    );
  }
}
```

### 2. Route Stats : `app/api/bmo/blocked/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bmo/blocked/stats
 * Statistiques temps réel des blocages
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bureauCode = searchParams.get('bureau');
    
    const where: any = {};
    if (bureauCode) {
      where.bureauCode = bureauCode;
    }
    
    // Compteurs par impact
    const [total, critical, high, medium, low] = await Promise.all([
      prisma.blockedDossier.count({ where }),
      prisma.blockedDossier.count({ where: { ...where, impact: 'critical' } }),
      prisma.blockedDossier.count({ where: { ...where, impact: 'high' } }),
      prisma.blockedDossier.count({ where: { ...where, impact: 'medium' } }),
      prisma.blockedDossier.count({ where: { ...where, impact: 'low' } }),
    ]);
    
    // Moyennes
    const aggregates = await prisma.blockedDossier.aggregate({
      where,
      _avg: {
        delay: true,
        priority: true,
        amount: true,
      },
      _sum: {
        amount: true,
      },
    });
    
    // Overdue SLA (delay > 10 jours par exemple)
    const overdueSLA = await prisma.blockedDossier.count({
      where: {
        ...where,
        delay: { gt: 10 },
      },
    });
    
    // Résolus aujourd'hui
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const resolvedToday = await prisma.blockedDossier.count({
      where: {
        status: 'resolved',
        resolvedAt: { gte: todayStart },
      },
    });
    
    // Escaladés aujourd'hui
    const escalatedToday = await prisma.blockedDossier.count({
      where: {
        status: 'escalated',
        escalatedAt: { gte: todayStart },
      },
    });
    
    // Par bureau
    const byBureau = await prisma.blockedDossier.groupBy({
      by: ['bureauCode'],
      where,
      _count: true,
      orderBy: {
        _count: {
          bureauCode: 'desc',
        },
      },
    });
    
    // Par type
    const byType = await prisma.blockedDossier.groupBy({
      by: ['type'],
      where,
      _count: true,
      orderBy: {
        _count: {
          type: 'desc',
        },
      },
    });
    
    const stats = {
      total,
      critical,
      high,
      medium,
      low,
      avgDelay: Math.round(aggregates._avg.delay || 0),
      avgPriority: Math.round((aggregates._avg.priority || 0) * 100) / 100,
      totalAmount: aggregates._sum.amount || 0,
      overdueSLA,
      resolvedToday,
      escalatedToday,
      byBureau: byBureau.map(b => ({
        bureau: b.bureauCode,
        count: b._count,
        critical: 0, // TODO: Add sub-query
      })),
      byType: byType.map(t => ({
        type: t.type,
        count: t._count,
      })),
      ts: new Date().toISOString(),
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error fetching blocked stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked stats' },
      { status: 500 }
    );
  }
}
```

### 3. Route Résolution : `app/api/bmo/blocked/[id]/resolve/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashChain } from '@/lib/hash';

/**
 * POST /api/bmo/blocked/[id]/resolve
 * Résoudre un dossier bloqué
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { method, comment, actorId, actorName } = body;
    
    // Validation
    if (!method || !['direct', 'escalation', 'substitution'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid resolution method' },
        { status: 400 }
      );
    }
    
    // Vérifier que le dossier existe
    const dossier = await prisma.blockedDossier.findUnique({
      where: { id },
    });
    
    if (!dossier) {
      return NextResponse.json(
        { error: 'Dossier not found' },
        { status: 404 }
      );
    }
    
    // Hash chaîné pour l'audit (anti-contestation)
    const prevHash = dossier.hash || 'genesis';
    const chainPayload = {
      action: 'resolved',
      method,
      actorId,
      actorName,
      comment,
      timestamp: new Date().toISOString(),
    };
    const newHash = hashChain(prevHash, chainPayload);
    
    // Mettre à jour le dossier
    const updated = await prisma.blockedDossier.update({
      where: { id },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: actorName,
        resolutionMethod: method,
        resolutionComment: comment,
        hash: newHash,
        auditLog: {
          create: {
            action: 'resolved',
            actorId,
            actorName,
            details: `Résolu via ${method}${comment ? `: ${comment}` : ''}`,
            hash: newHash,
          },
        },
      },
      include: {
        bureau: true,
        assignedTo: true,
        auditLog: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    
    // TODO: Envoyer notification WebSocket
    // broadcastBlockedEvent('resolution', { dossier: updated });
    
    return NextResponse.json({
      success: true,
      dossier: updated,
    });
    
  } catch (error) {
    console.error('Error resolving blocked dossier:', error);
    return NextResponse.json(
      { error: 'Failed to resolve blocked dossier' },
      { status: 500 }
    );
  }
}
```

---

## 🗄️ SCHÉMA PRISMA REQUIS

### À ajouter dans `prisma/schema.prisma`

```prisma
model BlockedDossier {
  id          String   @id @default(cuid())
  subject     String
  description String?
  impact      String   // 'critical' | 'high' | 'medium' | 'low'
  type        String
  status      String   @default("pending") // 'pending' | 'escalated' | 'resolved' | 'substituted'
  priority    Float
  delay       Int?
  amount      Float?
  dueDate     DateTime?
  
  // Relations
  bureauCode    String
  bureau        Bureau   @relation(fields: [bureauCode], references: [code])
  assignedToId  String?
  assignedTo    Agent?   @relation(fields: [assignedToId], references: [id])
  
  // Résolution
  resolvedAt        DateTime?
  resolvedBy        String?
  resolutionMethod  String?  // 'direct' | 'escalation' | 'substitution'
  resolutionComment String?
  
  // Escalade
  escalatedAt    DateTime?
  escalatedTo    String?
  escalationReason String?
  
  // Audit trail (hash chaîné anti-contestation)
  hash        String?
  auditLog    BlockedAuditLog[]
  comments    BlockedComment[]
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([bureauCode])
  @@index([impact])
  @@index([status])
  @@index([priority])
  @@index([delay])
}

model BlockedAuditLog {
  id        String   @id @default(cuid())
  dossierId String
  dossier   BlockedDossier @relation(fields: [dossierId], references: [id], onDelete: Cascade)
  
  action    String
  actorId   String
  actorName String
  details   String?
  hash      String?
  
  createdAt DateTime @default(now())
  
  @@index([dossierId])
  @@index([createdAt])
}

model BlockedComment {
  id        String   @id @default(cuid())
  dossierId String
  dossier   BlockedDossier @relation(fields: [dossierId], references: [id], onDelete: Cascade)
  
  content     String
  authorId    String
  authorName  String
  visibility  String  @default("internal") // 'internal' | 'shared'
  
  createdAt   DateTime @default(now())
  
  @@index([dossierId])
  @@index([createdAt])
}
```

---

## 📋 CHECKLIST D'IMPLÉMENTATION

### Phase 1 : Base de données (4h)
- [ ] Ajouter les models Prisma (`BlockedDossier`, `BlockedAuditLog`, `BlockedComment`)
- [ ] Créer et exécuter la migration : `npx prisma migrate dev --name add-blocked-dossiers`
- [ ] Seeder les données de test
- [ ] Vérifier avec Prisma Studio

### Phase 2 : Routes API principales (6h)
- [ ] `GET/POST /api/bmo/blocked/route.ts` (liste + création)
- [ ] `GET/PATCH/DELETE /api/bmo/blocked/[id]/route.ts` (détail + update)
- [ ] `GET /api/bmo/blocked/stats/route.ts` (statistiques)
- [ ] `POST /api/bmo/blocked/[id]/resolve/route.ts` (résolution)
- [ ] `POST /api/bmo/blocked/[id]/escalate/route.ts` (escalade)
- [ ] `POST /api/bmo/blocked/[id]/comment/route.ts` (commentaires)

### Phase 3 : Routes avancées (4h)
- [ ] `GET /api/bmo/blocked/matrix/route.ts` (matrice impact x délai)
- [ ] `GET /api/bmo/blocked/bureaux/route.ts` (stats par bureau)
- [ ] `GET /api/bmo/blocked/timeline/route.ts` (timeline)
- [ ] `GET /api/bmo/blocked/decisions/route.ts` (décisions)
- [ ] `POST /api/bmo/blocked/export/route.ts` (export Excel/PDF)
- [ ] `POST /api/bmo/blocked/bulk/route.ts` (actions groupées)

### Phase 4 : Intégration Frontend (3h)
- [ ] Décommenter les appels API dans `blockedApiService.ts`
- [ ] Créer les React Query hooks (`useBlocked.ts`)
- [ ] Tester toutes les opérations CRUD
- [ ] Gérer les erreurs et loading states

### Phase 5 : WebSocket temps réel (3h)
- [ ] Configurer le serveur WebSocket
- [ ] Broadcaster les events (nouveau blocage, résolution, escalade)
- [ ] Connecter le frontend au WebSocket
- [ ] Tester les notifications temps réel

---

## ⏱️ ESTIMATION TOTALE

**20 heures de développement** réparties sur **3-4 jours**

---

## 🚦 PRIORISATION

### 🔴 **CRITIQUE - À FAIRE IMMÉDIATEMENT**
1. Routes API de base (liste, détail, stats)
2. Routes d'actions (résoudre, escalader)
3. Schéma Prisma et migration

### 🟡 **IMPORTANT - SEMAINE 1**
4. Routes avancées (matrice, timeline, bureaux)
5. React Query hooks
6. Tests d'intégration

### 🟢 **NICE TO HAVE - SEMAINE 2**
7. WebSocket temps réel
8. Export avancé
9. Actions groupées

---

## ⚠️ CONCLUSION

**Le module "Dossiers Bloqués" est actuellement un POC frontend uniquement.**  

Pour le rendre fonctionnel en production, **toute la couche API backend doit être créée** :
- 15+ routes API Next.js
- 3 models Prisma
- Migrations de base de données
- Hash chaîné pour l'audit
- WebSocket pour le temps réel

**Sans ces APIs, le module ne peut PAS être déployé en production.**

---

**Recommandation** : Commencer par la Phase 1 (Base de données) et Phase 2 (Routes principales) cette semaine pour débloquer le développement.

