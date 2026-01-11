# 🔄 APIs Délégations avec Fallback Mock Data

## Description

Les APIs principales des délégations ont été mises à jour pour utiliser les mock data en fallback :
- **Mode développement** : Utilise automatiquement les mock data
- **Mode production** : Utilise Prisma avec fallback vers mock data en cas d'erreur
- **Variable d'environnement** : `USE_DELEGATIONS_MOCK=true` pour forcer l'utilisation des mock data

## APIs Mises à Jour

### 1. `GET /api/delegations`

**Fonctionnalités**:
- ✅ Liste des délégations avec filtres (queue, bureau, type, dates)
- ✅ Pagination (page, limit)
- ✅ Tri (sort, dir)
- ✅ Recherche textuelle (q)
- ✅ Fallback automatique vers mock data en développement ou en cas d'erreur Prisma

**Exemple**:
```
GET /api/delegations?queue=active&bureau=BAGD&page=1&limit=50&sort=endDate&dir=asc
```

**Réponse**:
```json
{
  "items": [...],
  "total": 40,
  "page": 1,
  "limit": 50,
  "totalPages": 1,
  "hasMore": false,
  "_mock": true  // Indique si les mock data sont utilisés
}
```

### 2. `GET /api/delegations/stats`

**Fonctionnalités**:
- ✅ Statistiques complètes (total, active, expired, revoked, suspended, expiringSoon)
- ✅ Utilisations totales
- ✅ Répartition par bureau et type
- ✅ Activité récente
- ✅ Fallback automatique vers mock data

**Exemple**:
```
GET /api/delegations/stats
```

**Réponse**:
```json
{
  "total": 40,
  "active": 20,
  "expired": 13,
  "revoked": 4,
  "suspended": 3,
  "expiringSoon": 5,
  "totalUsage": 150,
  "byBureau": [...],
  "byType": [...],
  "recentActivity": [...],
  "ts": "2026-01-11T...",
  "_mock": true
}
```

### 3. `GET /api/delegations/[id]`

**Fonctionnalités**:
- ✅ Détails complets d'une délégation
- ✅ Calcul automatique du statut (active/expired)
- ✅ Détection expiring soon
- ✅ Historique des événements
- ✅ Fallback automatique vers mock data

**Exemple**:
```
GET /api/delegations/DEL-0001
```

**Réponse**:
```json
{
  "item": {
    "id": "DEL-0001",
    "type": "Signature de contrats",
    "status": "active",
    "agent": {...},
    "bureau": "BAGD",
    "scope": "...",
    "startDate": "...",
    "endDate": "...",
    "daysRemaining": 45,
    "expiringSoon": false,
    "delegator": {...},
    "usageCount": 3,
    "history": [...],
    "_mock": true
  }
}
```

## Configuration

### Mode Développement (Automatique)

En mode développement (`NODE_ENV=development`), les APIs utilisent automatiquement les mock data.

### Mode Production avec Mock

Pour forcer l'utilisation des mock data en production :

```bash
USE_DELEGATIONS_MOCK=true npm run dev
```

Ou dans `.env`:
```
USE_DELEGATIONS_MOCK=true
```

### Mode Production Normal

Par défaut en production, les APIs utilisent Prisma. Si Prisma échoue, fallback automatique vers mock data.

## Structure des Mock Data

Les mock data sont définis dans `src/lib/data/delegations-mock-data.ts`:

- **40 délégations** avec différents statuts
- **Statistiques calculées** automatiquement
- **Fonctions utilitaires** : `getDelegationsByQueue()`, `getDelegationById()`, `filterDelegations()`

## Migration vers Vraies APIs

Quand les vraies APIs Prisma seront disponibles :

1. **Supprimer le mode mock** : Retirer `USE_MOCK_FALLBACK` des APIs
2. **Conserver les mock data** : Pour les tests et le développement
3. **Les mock data serviront d'exemples** : Structure à suivre pour les vraies données

## Avantages

✅ **Développement sans base de données** : Fonctionne immédiatement  
✅ **Tests rapides** : Données réalistes pour tester les composants  
✅ **Exemples de structure** : Les mock data montrent le format attendu  
✅ **Fallback robuste** : L'application reste fonctionnelle même si Prisma échoue  
✅ **Transition facile** : Remplacement progressif par de vraies données

## Format de Réponse

Toutes les réponses incluent le flag `_mock: boolean` pour indiquer si les mock data sont utilisés :

```json
{
  "items": [...],
  "_mock": true  // ou false si Prisma est utilisé
}
```

Cela permet au frontend de savoir si on utilise des données réelles ou mock.

