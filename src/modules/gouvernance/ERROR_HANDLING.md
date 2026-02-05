# Gestion des erreurs API - Module Gouvernance

## ✅ Améliorations apportées

### 1. Intercepteur Axios global
**Fichier** : `src/modules/gouvernance/api/gouvernanceApi.ts`

Ajout d'un intercepteur de réponse pour :
- Détecter les erreurs 404 et les marquer avec `isNotFound: true`
- Détecter les erreurs réseau et les marquer avec `isNetworkError: true`
- Logger les erreurs de manière cohérente

### 2. Helpers de gestion d'erreurs
- `isNotFoundError(error)` : Vérifie si une erreur est un 404
- `emptyPaginatedResponse<T>()` : Retourne une réponse paginée vide

### 3. Gestion gracieuse des 404
Toutes les fonctions API gèrent maintenant les erreurs 404 en retournant :
- **Pour les réponses paginées** : `{ data: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }`
- **Pour les tableaux** : `[]`
- **Pour les statistiques** : Objet avec toutes les valeurs à 0
- **Pour les overview** : Structure complète avec valeurs par défaut

### 4. Timeout configuré
- Timeout de 30 secondes pour éviter les requêtes qui pendent indéfiniment

## 📋 Fonctions mises à jour

Toutes les fonctions API suivantes gèrent maintenant les 404 :

### Vue d'ensemble
- ✅ `getGouvernanceOverview` - Retourne structure vide
- ✅ `getGouvernanceStats` - Retourne stats à 0
- ✅ `getTendancesMensuelles` - Retourne tableau vide

### Synthèses
- ✅ `getSyntheseProjets` - Retourne réponse paginée vide
- ✅ `getSyntheseBudget` - Retourne réponse paginée vide
- ✅ `getSyntheseJalons` - Retourne réponse paginée vide
- ✅ `getSyntheseRisques` - Retourne réponse paginée vide
- ✅ `getSyntheseValidations` - Retourne réponse paginée vide

### Points d'attention
- ✅ `getPointsAttention` - Retourne réponse paginée vide
- ✅ `getDepassementsBudget` - Retourne réponse paginée vide
- ✅ `getRetardsCritiques` - Retourne réponse paginée vide
- ✅ `getRessourcesIndispo` - Retourne réponse paginée vide
- ✅ `getEscalades` - Retourne réponse paginée vide

### Arbitrages
- ✅ `getDecisionsValidees` - Retourne réponse paginée vide
- ✅ `getArbitragesEnAttente` - Retourne réponse paginée vide
- ✅ `getHistoriqueDecisions` - Retourne réponse paginée vide

### Instances
- ✅ `getReunionsDG` - Retourne réponse paginée vide
- ✅ `getReunionsMOAMOE` - Retourne réponse paginée vide
- ✅ `getReunionsTransverses` - Retourne réponse paginée vide

### Conformité
- ✅ `getIndicateursConformite` - Retourne réponse paginée vide
- ✅ `getAuditGouvernance` - Retourne réponse paginée vide
- ✅ `getSuiviEngagements` - Retourne réponse paginée vide

## 🎯 Comportement

### Avant
- Les erreurs 404 faisaient planter l'application
- Les erreurs réseau n'étaient pas différenciées
- Pas de valeurs par défaut

### Après
- Les erreurs 404 retournent des structures vides
- L'application continue de fonctionner
- Les utilisateurs voient des listes vides au lieu d'erreurs
- Les erreurs sont loggées pour le debugging

## 🔍 Exemple d'utilisation

```typescript
// Avant : crashait si l'endpoint n'existait pas
const data = await getGouvernanceStats();

// Après : retourne des stats à 0 si 404
const data = await getGouvernanceStats();
// data = { projets_actifs: 0, budget_consomme_pourcent: 0, ... }
```

## 📝 Notes

- Les erreurs autres que 404 (500, 401, etc.) sont toujours throwées
- Les erreurs réseau sont détectées et marquées
- Les logs sont conservés pour le debugging
- Le comportement est cohérent sur toutes les fonctions API

