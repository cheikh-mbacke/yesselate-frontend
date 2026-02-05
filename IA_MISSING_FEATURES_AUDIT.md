# 🔍 AUDIT COMPLET - IA Command Center - Fonctionnalités Manquantes

**Date**: 2026-01-XX  
**Statut**: ⚠️ Composants critiques manquants  
**Référence**: Architecture Analytics/Gouvernance

---

## 📊 RÉSUMÉ EXÉCUTIF

### ✅ Ce qui est COMPLET
- ✅ Architecture Command Center (store, navigation)
- ✅ IACommandSidebar (12 catégories avec badges)
- ✅ IASubNavigation (breadcrumb + sous-onglets)
- ✅ IAKPIBar (8 KPIs temps réel)
- ✅ IAContentRouter (routage de contenu)
- ✅ Page principale refactorisée
- ✅ Raccourcis clavier (⌘K, ⌘B, F11, Alt+←)
- ✅ Status bar avec indicateurs

### ❌ COMPOSANTS CRITIQUES MANQUANTS

#### 1. **IACommandPalette** ❌ ⭐ CRITIQUE
**Référence**: `AnalyticsCommandPalette`

**Fonctionnalités attendues**:
- Recherche globale (⌘K)
- Navigation rapide entre catégories
- Recherche de modules par nom/ID/type
- Recherche dans l'historique
- Actions rapides (exécuter, ré-entraîner, exporter)
- Suggestions intelligentes

**Fichier à créer**: `src/components/features/bmo/ia/workspace/IACommandPalette.tsx`

---

#### 2. **IAModuleDetailModal** ❌ ⭐⭐⭐ **TRÈS CRITIQUE** (Pattern Overlay)

**Référence**: Pattern modal overlay (comme Tickets Clients / GenericDetailModal)

**Problème**: Actuellement, les détails du module sont affichés dans une sidebar. L'utilisateur recommande le pattern modal overlay pour:
- ✅ Contexte préservé (liste visible en arrière-plan)
- ✅ Navigation rapide (précédent/suivant)
- ✅ UX moderne (sensation fluide)
- ✅ Multitâche (voir plusieurs modules rapidement)

**Pattern recommandé**:
```typescript
// Ouverture depuis la liste
<ModuleCard 
  onClick={() => openModuleDetailModal(module.id)}
/>

// Modal overlay
<IAModuleDetailModal
  isOpen={detailModalOpen}
  moduleId={selectedModuleId}
  onClose={() => closeModuleDetailModal()}
  onNext={() => navigateToNextModule()}
  onPrevious={() => navigateToPreviousModule()}
  onRunAnalysis={(module) => handleRunAnalysis(module)}
  onRetrain={(module) => handleRetrain(module)}
/>
```

**Sections nécessaires**:
1. **Onglet Vue d'ensemble**
   - Informations générales (ID, nom, type, statut)
   - Description
   - Version et sources de données
   - Dates (création, dernière exécution, prochaine planifiée)

2. **Onglet Métriques**
   - Précision actuelle avec graphique
   - Historique de précision (sparkline)
   - Statistiques d'exécution
   - Performance (temps d'exécution moyen)

3. **Onglet Configuration**
   - Paramètres du module
   - Sources de données configurées
   - Planification (cron/schedule)
   - Seuils d'alerte

4. **Onglet Historique**
   - Dernières analyses exécutées
   - Résultats récents
   - Logs d'erreur (si applicable)

5. **Onglet Actions**
   - Boutons: Exécuter, Ré-entraîner, Désactiver/Activer
   - Export des résultats
   - Voir traçabilité (hash, inputs)

**Fichier à créer**: `src/components/features/bmo/ia/command-center/IAModuleDetailModal.tsx`

---

#### 3. **IAModals** ❌

**Référence**: `AnalyticsModals`

**Modals nécessaires**:
- ✅ Export (avec options: CSV, JSON, Excel)
- ✅ Settings/Paramètres (configuration IA globale)
- ✅ Shortcuts/Raccourcis (liste complète)
- ✅ Help/Aide (guide utilisateur IA)
- ✅ Confirm (pour actions destructives: désactiver, supprimer)

**Fichier à créer**: `src/components/features/bmo/ia/command-center/IAModals.tsx`

---

#### 4. **IABatchActionsBar** ❌

**Référence**: `AnalyticsBatchActionsBar`

**Fonctionnalités attendues**:
- Barre d'actions groupées (quand modules sélectionnés)
- Actions: activer, désactiver, exporter, ré-entraîner, supprimer
- Compteur d'items sélectionnés
- Bouton "Tout désélectionner"

**Fichier à créer**: `src/components/features/bmo/ia/command-center/IABatchActionsBar.tsx`

---

#### 5. **IAFiltersPanel** ❌

**Référence**: `AnalyticsFiltersPanel`

**Filtres nécessaires**:
- Statut (multi-select: actif, formation, désactivé, erreur)
- Type (multi-select: analyse, prédiction, anomalie, rapport, recommandation)
- Date de création (range)
- Précision (min/max)
- Sources de données (multi-select)
- Tags/Labels (multi-select)
- Recherche texte (nom, ID, description)

**Fichier à créer**: `src/components/features/bmo/ia/command-center/IAFiltersPanel.tsx`

---

#### 6. **ActionsMenu** ❌

**Référence**: `ActionsMenu` (analytics)

**Menu d'actions consolidé**:
- Rechercher (⌘K)
- Filtres avancés (⌘F)
- Exporter (⌘E)
- Rafraîchir
- Plein écran (F11)
- Masquer/Afficher KPIs
- Statistiques (⌘I)
- Paramètres
- Raccourcis (?)
- Aide

**Fichier à créer**: `src/components/features/bmo/ia/command-center/IAActionsMenu.tsx`

---

#### 7. **IADetailPanel** (Optionnel - Alternative au Modal)

**Référence**: `AnalyticsDetailPanel`

**Note**: Si on utilise le pattern modal overlay (recommandé), ce composant n'est pas nécessaire. Mais on peut l'ajouter pour une vue rapide en sidebar.

---

## 🔧 INTÉGRATIONS MANQUANTES DANS LA PAGE

### Dans `app/(portals)/maitre-ouvrage/ia/page.tsx`:

```typescript
// ❌ Manquant:
{commandPaletteOpen && <IACommandPalette />}
<IAModals />
<IAModuleDetailModal /> // Pattern overlay recommandé
<IABatchActionsBar onAction={handleBatchAction} />
<IAActionsMenu /> // Dans le header

// ✅ Existant:
<IACommandSidebar />
<IASubNavigation />
<IAKPIBar />
<IAContentRouter />
```

---

## 📝 STORE - FONCTIONNALITÉS MANQUANTES

### Dans `iaCommandCenterStore.ts`:

- ✅ Navigation (déjà fait)
- ✅ Modals (déjà fait)
- ❌ DetailPanel state (si on garde le panel, sinon utiliser modal)
- ✅ Filters (déjà fait)
- ✅ SelectedItems (déjà fait)

**Note**: Le store est déjà bien structuré, mais il faudra ajouter:
- `openModuleDetailModal(moduleId: string)`
- `closeModuleDetailModal()`
- `navigateToNextModule()`
- `navigateToPreviousModule()`

---

## 🎯 PRIORITÉS

### Priorité 1 - CRITIQUE ⭐⭐⭐
1. **IAModuleDetailModal** (pattern overlay)
   - Impact UX majeur
   - Pattern recommandé par l'utilisateur
   - Navigation prev/next

### Priorité 2 - IMPORTANT ⭐⭐
2. **IACommandPalette**
   - Recherche globale (⌘K déjà implémenté mais pas de composant)
3. **IAModals**
   - Export, Settings, Help, Shortcuts

### Priorité 3 - RECOMMANDÉ ⭐
4. **IABatchActionsBar**
   - Actions groupées
5. **IAFiltersPanel**
   - Filtres avancés
6. **IAActionsMenu**
   - Menu consolidé dans le header

---

## 📊 STATUT ACTUEL

- ✅ **Composants créés**: 5/11 (45%)
- ✅ **Linting**: 0 erreur (100%)
- ❌ **Composants manquants**: 6 composants critiques
- ⚠️ **Intégrations**: Page principale incomplète (manque modals, palette, batch actions)

---

## ✅ RECOMMANDATION FINALE

**Action immédiate**: Créer `IAModuleDetailModal` avec pattern overlay (comme GenericDetailModal) car c'est le composant le plus critique pour l'UX et c'est explicitement demandé par l'utilisateur.

Ensuite, créer les autres composants dans l'ordre de priorité.

