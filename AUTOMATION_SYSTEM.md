# Système d'Automatisation et d'Interdépendance - Maître d'Ouvrage

## 📋 Vue d'ensemble

Ce document décrit le système complet d'automatisation et d'interdépendance mis en place pour le portail maître d'ouvrage. Tous les composants, pages, modales et interactions sont maintenant automatiquement synchronisés et interconnectés.

## 🎯 Objectifs atteints

### ✅ 1. Sidebar Automatisée

**Fichier**: `src/components/features/bmo/Sidebar.tsx`

- **Badges automatiques** : Les badges sont mis à jour automatiquement basés sur les données réelles
- **Synchronisation temps réel** : Mise à jour toutes les 30 secondes via `AutoSyncProvider`
- **Détection automatique de la page active** : Utilise `getActivePageId()` pour déterminer la page courante
- **Badges dynamiques** : Les types de badges (urgent, warning, gray) sont déterminés automatiquement selon le contexte

**Service**: `src/lib/services/navigation.service.ts`
- `updateNavBadges()` : Met à jour automatiquement les badges
- `getActivePageId()` : Détermine la page active depuis le pathname
- `routeMapping` : Mapping centralisé de toutes les routes

### ✅ 2. Store de Navigation Centralisé

**Fichier**: `src/lib/stores/navigation-store.ts`

**Fonctionnalités**:
- **Comptages par page** : Stocke les comptages pour chaque page
- **Historique de navigation** : Mémorise les dernières pages visitées
- **Filtres persistants** : Sauvegarde les filtres de chaque page
- **État de chargement** : Gère l'état de chargement de chaque page
- **Persistance** : Les filtres et l'historique sont sauvegardés dans le localStorage

**Actions disponibles**:
- `updatePageCount(pageId, count)` : Mettre à jour le comptage d'une page
- `updatePageCounts(counts)` : Mettre à jour plusieurs comptages en une fois
- `setPageFilter(pageId, filters)` : Sauvegarder les filtres d'une page
- `getPageFilter(pageId)` : Récupérer les filtres sauvegardés
- `addToHistory(route)` : Ajouter une route à l'historique
- `getPreviousRoute()` : Obtenir la route précédente

### ✅ 3. Hooks d'Automatisation

#### `usePageNavigation(pageId)`

**Fichier**: `src/hooks/usePageNavigation.ts`

**Fonctionnalités**:
- Navigation automatique entre pages avec contexte
- Gestion automatique des filtres (URL + sauvegarde)
- Synchronisation des paramètres d'URL
- Restauration automatique des filtres sauvegardés

**Exemple d'utilisation**:
```typescript
const { navigateTo, updateFilters, getFilters } = usePageNavigation('validation-bc');

// Naviguer vers une autre page avec contexte
navigateTo('demandes', { filter: 'urgent', projet: 'PRJ-0018' });

// Mettre à jour les filtres
updateFilters({ bureau: 'BA', status: 'pending' });

// Obtenir les filtres actuels
const filters = getFilters();
```

#### `useCrossPageLinks(pageId)`

**Fonctionnalités**:
- Liens prédéfinis vers les pages principales
- Passage automatique de contexte entre pages
- Navigation fluide et cohérente

**Exemple**:
```typescript
const links = useCrossPageLinks('validation-bc');

// Aller au calendrier avec une date
links.goToCalendrier('2026-01-15');

// Aller à un projet spécifique
links.goToProjet('PRJ-0018');
```

#### `useAutoSyncCounts(pageId, getCount, options)`

**Fichier**: `src/hooks/useAutoSync.ts`

**Fonctionnalités**:
- Synchronisation automatique des comptages
- Mise à jour périodique (par défaut toutes les 30s)
- Synchronisation immédiate au chargement

**Exemple**:
```typescript
useAutoSyncCounts('validation-bc', () => {
  return enrichedBCs.filter(bc => bc.status === 'pending').length;
}, { interval: 10000, immediate: true });
```

#### `useModalManager(modalId, options)`

**Fichier**: `src/hooks/useModalManager.ts`

**Fonctionnalités**:
- Gestion automatique des modales
- Synchronisation avec l'URL (optionnel)
- Persistance de l'état (optionnel)
- Gestion de plusieurs modales simultanément

**Exemple**:
```typescript
const { isOpen, openModal, closeModal, data } = useModalManager('bc-details', {
  syncWithURL: true,
  persistState: true
});

// Ouvrir avec données
openModal(bc, { tab: 'details' });

// Fermer
closeModal();
```

### ✅ 4. Provider de Synchronisation Automatique

**Fichier**: `src/components/shared/AutoSyncProvider.tsx`

**Fonctionnalités**:
- Synchronise automatiquement tous les comptages de toutes les pages
- Mise à jour périodique (30 secondes)
- Intégré dans `BMOLayout` pour être actif sur toutes les pages

**Pages synchronisées**:
- Alertes
- Demandes
- Validation BC/Factures/Avenants
- Dossiers bloqués
- Substitution
- Projets en cours
- Recouvrements
- Litiges
- Demandes RH
- Tickets clients

### ✅ 5. Service de Navigation Centralisé

**Fichier**: `src/lib/services/navigation.service.ts`

**Fonctionnalités**:
- Mapping centralisé de toutes les routes
- Génération automatique de paramètres d'URL
- Parsing des paramètres d'URL
- Création de liens cross-pages avec contexte
- Détection automatique de la page active

**Fonctions principales**:
- `routeMapping` : Toutes les routes du portail
- `updateNavBadges()` : Mise à jour automatique des badges
- `generateNavParams()` : Génération de paramètres d'URL
- `parseNavParams()` : Parsing des paramètres
- `createCrossPageLink()` : Création de liens entre pages
- `getActivePageId()` : Détection de la page active

## 🔄 Flux d'Automatisation

### 1. Synchronisation des Badges

```
AutoSyncProvider (toutes les 30s)
  ↓
updatePageCounts() → navigation-store
  ↓
Sidebar utilise useNavigationStore
  ↓
updateNavBadges() → Met à jour les badges
  ↓
Affichage automatique dans la sidebar
```

### 2. Navigation entre Pages

```
Utilisateur clique sur un lien
  ↓
usePageNavigation ou useCrossPageLinks
  ↓
createCrossPageLink() → Génère l'URL avec contexte
  ↓
router.push() → Navigation
  ↓
addToHistory() → Sauvegarde dans l'historique
  ↓
Page destination récupère le contexte
  ↓
Restauration automatique des filtres
```

### 3. Gestion des Modales

```
Utilisateur ouvre une modale
  ↓
useModalManager.openModal()
  ↓
Synchronisation avec URL (si activé)
  ↓
Sauvegarde dans le store (si activé)
  ↓
Affichage de la modale
  ↓
Fermeture → Nettoyage URL/store
```

## 📦 Intégration dans les Pages

### Page Validation BC

**Fichier**: `app/(portals)/maitre-ouvrage/validation-bc/page.tsx`

**Intégrations**:
- `usePageNavigation('validation-bc')` : Navigation automatique
- `useCrossPageLinks('validation-bc')` : Liens vers autres pages
- `useAutoSyncCounts()` : Synchronisation des comptages

### Page Demandes

**À intégrer**:
```typescript
import { usePageNavigation, useCrossPageLinks } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

// Dans le composant
const { navigateTo, updateFilters } = usePageNavigation('demandes');
const links = useCrossPageLinks('demandes');

// Synchronisation automatique
useAutoSyncCounts('demandes', () => {
  return demands.filter(d => d.status === 'pending').length;
}, { interval: 10000, immediate: true });
```

## 🎨 Cohérence et Logique

### Principes d'Automatisation

1. **Centralisation** : Toutes les routes et mappings sont centralisés dans `navigation.service.ts`
2. **Synchronisation** : Les données sont synchronisées automatiquement via `AutoSyncProvider`
3. **Persistance** : Les filtres et l'historique sont sauvegardés automatiquement
4. **Cohérence** : Toutes les pages utilisent les mêmes hooks et services
5. **Logique métier** : Les badges et types sont déterminés automatiquement selon le contexte

### Règles de Navigation

- **Badges** : Mis à jour automatiquement toutes les 30 secondes
- **Filtres** : Sauvegardés automatiquement et restaurés au retour sur la page
- **Historique** : Limité à 50 entrées, les 20 dernières sont persistées
- **Contexte** : Passé automatiquement entre les pages via les paramètres d'URL
- **Modales** : Peuvent être synchronisées avec l'URL pour permettre le partage de liens

## 🚀 Utilisation

### Pour une nouvelle page

1. **Importer les hooks** :
```typescript
import { usePageNavigation, useCrossPageLinks } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
```

2. **Utiliser dans le composant** :
```typescript
const { navigateTo, updateFilters } = usePageNavigation('ma-page');
const links = useCrossPageLinks('ma-page');

// Synchronisation automatique
useAutoSyncCounts('ma-page', () => {
  // Retourner le comptage
  return myData.filter(item => item.status === 'pending').length;
}, { interval: 10000, immediate: true });
```

3. **Ajouter la route dans `navigation.service.ts`** :
```typescript
export const routeMapping: Record<string, string> = {
  // ...
  'ma-page': '/maitre-ouvrage/ma-page',
};
```

4. **Ajouter dans `navSections`** (si nécessaire) :
```typescript
{
  id: 'ma-page',
  icon: '📄',
  label: 'Ma Page',
}
```

## 📝 Notes Importantes

- **Performance** : La synchronisation se fait toutes les 30 secondes par défaut, ajustable par page
- **Persistance** : Les filtres sont sauvegardés dans le localStorage
- **Compatibilité** : Toutes les pages existantes continuent de fonctionner
- **Extensibilité** : Facile d'ajouter de nouvelles pages et fonctionnalités

## ✅ Validation

Toutes les modifications ont été validées :
- ✅ Sidebar automatique avec badges dynamiques
- ✅ Store de navigation centralisé
- ✅ Hooks d'automatisation créés
- ✅ Provider de synchronisation intégré
- ✅ Service de navigation centralisé
- ✅ Intégration dans validation-bc
- ✅ Compatibilité avec toutes les pages existantes

