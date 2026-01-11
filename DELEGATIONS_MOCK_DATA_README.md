# 📊 Mock Data - Délégations

## Description

Fichier de mock data réalistes pour le développement du module Délégations. Ces données peuvent être facilement remplacées par de vraies API calls.

## Structure

### Fichier: `src/lib/data/delegations-mock-data.ts`

### Données incluses

1. **40 délégations mock** avec différents statuts :
   - 15 actives
   - 5 expirant bientôt (dans moins de 7 jours)
   - 8 expirées récentes
   - 5 expirées anciennes
   - 4 révoquées
   - 3 suspendues

2. **Statistiques calculées** :
   - Total, actives, expirées, révoquées, suspendues
   - Nombre expirant bientôt
   - Utilisations totales
   - Répartition par bureau
   - Répartition par type
   - Activité récente (10 dernières utilisations)

### Fonctions utilitaires

- `getDelegationsByQueue(queue: string)` - Filtrer par file (active, expired, revoked, suspended, expiring_soon)
- `getDelegationById(id: string)` - Récupérer une délégation par ID
- `filterDelegations(filters)` - Filtrer avec critères multiples (bureau, type, status, search, dates)

## Utilisation

```typescript
import { mockDelegations, mockDelegationsStats, getDelegationsByQueue, filterDelegations } from '@/lib/data/delegations-mock-data';

// Récupérer toutes les délégations actives
const activeDelegations = getDelegationsByQueue('active');

// Filtrer par bureau et type
const filtered = filterDelegations({
  bureau: 'BAGD',
  type: 'Signature',
  status: 'active',
  search: 'contrat',
});

// Récupérer les statistiques
const stats = mockDelegationsStats;
```

## Remplacement par API

Pour remplacer par de vraies API calls, il suffit de :

1. Modifier le service `delegationsApiService.ts` pour appeler les vraies APIs
2. Les hooks `useDelegations` et `useDelegationsStats` utiliseront automatiquement les vraies données
3. Le fichier de mock data peut être conservé pour les tests

## Données réalistes

- **IDs**: Format `DEL-0001`, `DEL-0002`, etc.
- **Types**: 8 types différents (Signature, Approbation, Engagement, etc.)
- **Bureaux**: BAGD, BAVM, BDI, BFEP, BRH, BSG, DBMO, Direction
- **Agents**: 8 agents avec rôles variés
- **Dates**: Dates cohérentes (début il y a 30-180 jours, fin dans 3-90 jours)
- **Hashes**: Format mock SHA3-256 (peut être remplacé par de vrais hashs)
- **Permissions**: 2-4 permissions par délégation

## Exemple de données

```typescript
{
  id: 'DEL-0001',
  type: 'Signature de contrats',
  status: 'active',
  agentName: 'Yao N\'Guessan',
  agentRole: 'Chef de Bureau',
  bureau: 'BAGD',
  scope: 'Signature de contrats - BAGD',
  maxAmount: 5000000,
  startDate: '2025-12-01T00:00:00.000Z',
  endDate: '2026-01-30T00:00:00.000Z',
  delegatorName: 'Amadou Diallo',
  usageCount: 3,
  lastUsedAt: '2026-01-10T00:00:00.000Z',
  expiringSoon: false,
  hash: 'sha3-256:...',
  permissions: ['signature_contrats', 'validation_documents'],
  reason: 'Délégation pour signature de contrats dans le cadre de formation',
}
```

