# Audit Détaillé Bloc Pilotage - Corrections Nécessaires

**Date :** 10 janvier 2026  
**Statut :** 🔍 AUDIT EN COURS

---

## 🔴 Problèmes Identifiés

### 1. SATURATION VISUELLE (Couleurs excessives)

**Problème** : Les couleurs sont utilisées sur les backgrounds au lieu d'être limitées aux icônes.

**Occurences** :
```typescript
// ❌ MAUVAIS - Backgrounds colorés
bg-blue-500/10 border-blue-500/20    // KPI Cards
bg-emerald-500/10 border-emerald-500/20
bg-amber-500/10 border-amber-500/20
bg-purple-500/10 border-purple-500/20

// ❌ MAUVAIS - Textes colorés pour les valeurs
text-emerald-400  // Valeurs KPI
text-blue-400
```

**Solution** :
```typescript
// ✅ BON - Backgrounds neutres
bg-slate-800/30 border-slate-700/50

// ✅ BON - Couleurs uniquement sur icônes
<Icon className="text-blue-400" />
<TrendIcon className="text-emerald-400" />
```

**Fichiers à corriger** :
- `OverviewView.tsx` — Lines 81-85, 94-95
- `RealtimeView.tsx` — Lines 186-191
- `DashboardKPIBar.tsx` — Sparklines avec couleurs
- `PerformanceView.tsx` — Cards métriques
- `DecisionsView.tsx` — Lines 103-107 (typeColors)

---

### 2. BOUTONS RACCOURCIS NON CONSOLIDÉS

**Problème** : Le bouton "Rechercher" avec raccourci dans le header est redondant.

**Occurence** :
```typescript
// ❌ Dans page.tsx - ligne 159-170
<Button variant="ghost" size="sm" onClick={toggleCommandPalette}>
  <Search className="h-4 w-4 mr-2" />
  <span className="text-xs hidden sm:inline">Rechercher</span>
  <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
    ⌘K
  </kbd>
</Button>
```

**Solution** :
Supprimer ce bouton ET consolidé la recherche uniquement dans :
1. Sidebar (déjà présent)
2. Palette de commandes (⌘K)

**Action** :
- Remplacer le bouton "Rechercher" par un simple icône Search dans le header
- Tout regrouperle menu Actions (MoreVertical) déjà existe

---

### 3. APIs MANQUANTES

**APIs existantes** :
- ✅ `/api/dashboard/stats` - Stats globales
- ✅ `/api/dashboard/risks` - Risques
- ✅ `/api/dashboard/actions` - Actions
- ✅ `/api/dashboard/decisions` - Décisions

**APIs manquantes critiques** :
- ❌ `/api/dashboard/refresh` (POST) - Rafraîchissement manuel
- ❌ `/api/dashboard/bureaux` (GET) - Stats par bureau
- ❌ `/api/dashboard/trends` (GET) - Tendances historiques
- ❌ `/api/dashboard/preferences` (GET/PUT) - Préférences utilisateur
- ❌ `/api/dashboard/export` (POST) - Export données
- ❌ `/api/dashboard/kpis/[id]` (GET) - Détail KPI avec historique
- ❌ `/api/dashboard/live` (WebSocket ou SSE) - Données temps réel
- ❌ `/api/dashboard/filters` (GET/POST/DELETE) - Filtres sauvegardés

---

### 4. FONCTIONNALITÉS MANQUANTES

#### A. Filtres sauvegardés
- [x] Store créé avec `savedFilters`
- [ ] UI pour créer/gérer les filtres
- [ ] Persistance API
- [ ] Partage de filtres entre utilisateurs

#### B. Graphiques interactifs
- [ ] Remplacer les placeholders par de vrais graphiques (Recharts)
- [ ] Graphique tendances KPIs
- [ ] Graphique évolution risques
- [ ] Graphique répartition actions

#### C. Vues personnalisables
- [x] Store créé avec `sections`
- [ ] UI drag & drop pour réordonner sections
- [ ] Toggle visibilité sections
- [ ] Sauvegarde layout personnalisé

#### D. Exports programmés
- [ ] Modal export avec options
- [ ] Programmation récurrente (quotidien, hebdo, mensuel)
- [ ] Email automatique des rapports

#### E. Alertes personnalisées
- [ ] Configuration seuils alertes
- [ ] Notifications push navigateur
- [ ] Filtrage par type/sévérité

---

### 5. ERREURS TECHNIQUES

#### A. Imports manquants
```typescript
// src/components/features/bmo/dashboard/command-center/views/OverviewView.tsx
// ❌ Ligne 55 : useMemo importé mais pas utilisé
import React, { useMemo } from 'react';  // useMemo non utilisé

// ✅ Correction
import React from 'react';
```

#### B. Props non utilisées
- OverviewView : `useMemo` importé mais non utilisé
- Vérifier tous les fichiers pour imports inutilisés

---

## 📋 Plan de correction

### Phase 1 : Réduire saturation visuelle (PRIORITÉ HAUTE)
1. [ ] Remplacer tous les backgrounds colorés par `bg-slate-800/30`
2. [ ] Garder couleurs uniquement sur icônes et sparklines
3. [ ] Uniformiser les bordures à `border-slate-700/50`
4. [ ] Textes KPI en `text-slate-200` (neutral)

### Phase 2 : Consolidation boutons (PRIORITÉ HAUTE)
1. [ ] Supprimer bouton "Rechercher" du header
2. [ ] Remplacer par icône simple qui ouvre ⌘K
3. [ ] Garder uniquement : Notifications + Actions menu

### Phase 3 : Créer APIs manquantes (PRIORITÉ MOYENNE)
1. [ ] `/api/dashboard/refresh` (POST)
2. [ ] `/api/dashboard/bureaux` (GET)
3. [ ] `/api/dashboard/trends` (GET)
4. [ ] `/api/dashboard/preferences` (GET/PUT)
5. [ ] `/api/dashboard/export` (POST)
6. [ ] `/api/dashboard/kpis/[id]` (GET)
7. [ ] `/api/dashboard/filters` (GET/POST/DELETE)

### Phase 4 : Ajouter fonctionnalités (PRIORITÉ MOYENNE)
1. [ ] UI filtres sauvegardés
2. [ ] Graphiques Recharts (remplacer placeholders)
3. [ ] UI sections personnalisables
4. [ ] Modal export avancé

### Phase 5 : Nettoyage code (PRIORITÉ BASSE)
1. [ ] Supprimer imports inutilisés
2. [ ] Vérifier linter
3. [ ] Optimiser bundle size

---

## ✅ Checklist validation finale

- [ ] Aucun background coloré (sauf icônes)
- [ ] Boutons header simplifiés à 2 max
- [ ] Toutes les APIs créées
- [ ] Graphiques réels (pas placeholders)
- [ ] Filtres sauvegardés fonctionnels
- [ ] Exports programmés
- [ ] Alertes configurables
- [ ] Aucune erreur linter
- [ ] Bundle optimisé

---

**Prochaine étape** : Commencer corrections Phase 1 et 2

