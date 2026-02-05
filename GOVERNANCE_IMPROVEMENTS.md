# 🎯 Plan d'Amélioration - Page Governance

## 📊 Analyse de l'État Actuel

### Problèmes Identifiés

1. **Sérialisation URL défectueuse** : `filters=%5Bobject+Object%5D` au lieu d'un JSON valide
2. **Performance** : Composant monolithique (1581 lignes), pas de virtualisation pour les listes longues
3. **Gestion d'état** : 20+ `useState`, logique complexe dispersée
4. **Accessibilité** : Manque d'ARIA labels, navigation clavier incomplète
5. **Maintenabilité** : Code dupliqué, logique métier mélangée avec la présentation
6. **TypeScript** : Utilisation de `any` à plusieurs endroits (lignes 336, 493, etc.)
7. **Tests** : Aucun test unitaire ou d'intégration

---

## 🚀 5 Phases d'Amélioration

### **PHASE 1 : Correction des Bugs Critiques & Sérialisation URL** ⚡
**Durée estimée** : 2-3 jours  
**Priorité** : 🔴 Critique  
**Impact** : Élimination des bugs bloquants

#### Objectifs
- Corriger la sérialisation des filtres dans l'URL
- Améliorer la synchronisation URL ↔ localStorage
- Stabiliser la gestion des paramètres de navigation

#### Actions
1. **Corriger la sérialisation JSON dans l'URL**
   ```typescript
   // ❌ Problème actuel (ligne 310-315)
   updateFilters?.({
     activeTab,
     search,
     filters, // Objet non sérialisé correctement
     activeViewId,
   });

   // ✅ Solution : Sérialiser explicitement
   updateFilters?.({
     activeTab,
     search,
     filters: JSON.stringify(filters), // ou utiliser un format plat
     activeViewId,
   });
   ```

2. **Créer un hook dédié pour la gestion des filtres**
   - `useGovernanceFilters()` : Centraliser la logique de filtres
   - Gérer la sérialisation/désérialisation automatique
   - Synchroniser URL ↔ localStorage de manière fiable

3. **Améliorer `usePageNavigation` pour gérer les objets complexes**
   - Ajouter support pour objets imbriqués
   - Validation des paramètres URL
   - Gestion d'erreurs robuste

4. **Tests unitaires pour la sérialisation**
   - Tester tous les cas de filtres
   - Vérifier la compatibilité avec les URLs existantes

#### Livrables
- ✅ Filtres correctement sérialisés dans l'URL
- ✅ Hook `useGovernanceFilters` réutilisable
- ✅ Tests unitaires pour la navigation
- ✅ Documentation de l'API de filtres

---

### **PHASE 2 : Refactoring Architecture & Extraction de Composants** 🏗️
**Durée estimée** : 5-7 jours  
**Priorité** : 🟠 Haute  
**Impact** : Maintenabilité, réutilisabilité, performance

#### Objectifs
- Découper le composant monolithique (1581 lignes → composants < 200 lignes)
- Extraire la logique métier dans des hooks personnalisés
- Créer des composants réutilisables

#### Actions
1. **Créer des hooks métier dédiés**
   ```typescript
   // hooks/useGovernanceRACI.ts
   export function useGovernanceRACI() {
     // Logique RACI isolée
   }

   // hooks/useGovernanceAlerts.ts
   export function useGovernanceAlerts() {
     // Logique alertes isolée
   }

   // hooks/useGovernanceState.ts
   export function useGovernanceState() {
     // Gestion d'état unifiée avec useReducer
   }
   ```

2. **Extraire les composants UI**
   ```
   components/features/bmo/governance/
   ├── RACITab/
   │   ├── RACITable.tsx
   │   ├── RACIDetailPanel.tsx
   │   ├── RACILegend.tsx
   │   └── index.ts
   ├── AlertsTab/
   │   ├── AlertsList.tsx
   │   ├── AlertsStats.tsx
   │   ├── AlertsFilters.tsx
   │   └── index.ts
   └── shared/
       ├── GovernanceHeader.tsx
       ├── GovernanceTabs.tsx
       └── KeyboardShortcutsModal.tsx
   ```

3. **Utiliser `useReducer` pour l'état complexe**
   ```typescript
   type GovernanceAction = 
     | { type: 'SET_TAB'; tab: TabValue }
     | { type: 'SET_FILTERS'; filters: SavedView['filters'] }
     | { type: 'SELECT_ALERT'; alertId: string }
     | { type: 'TOGGLE_FOCUS_MODE' }
     // ... autres actions

   function governanceReducer(state: GovernanceState, action: GovernanceAction) {
     // Logique centralisée
   }
   ```

4. **Créer des utilitaires partagés**
   - `utils/governance/alertTransformers.ts` : Transformation des données
   - `utils/governance/raciHelpers.ts` : Helpers RACI
   - `utils/governance/dateParsers.ts` : Parsing de dates (déjà présent mais isoler)

#### Livrables
- ✅ Composants < 200 lignes chacun
- ✅ Hooks métier réutilisables
- ✅ Architecture modulaire documentée
- ✅ Réduction de 40% du code dupliqué

---

### **PHASE 3 : Optimisation Performance & Virtualisation** ⚡
**Durée estimée** : 4-5 jours  
**Priorité** : 🟠 Haute  
**Impact** : Performance, expérience utilisateur

#### Objectifs
- Implémenter la virtualisation pour les listes longues
- Optimiser les re-renders avec React.memo
- Lazy loading des composants lourds

#### Actions
1. **Virtualiser les listes d'alertes**
   ```typescript
   import { useVirtualizer } from '@tanstack/react-virtual'

   // Dans AlertsList.tsx
   const virtualizer = useVirtualizer({
     count: filteredAlerts.length,
     getScrollElement: () => parentRef.current,
     estimateSize: () => 120, // Hauteur estimée par item
     overscan: 5,
   })
   ```

2. **Virtualiser le tableau RACI**
   - Utiliser `react-window` ou `@tanstack/react-virtual` pour le tableau
   - Virtualisation horizontale ET verticale
   - Sticky headers

3. **Memoization avancée**
   ```typescript
   // Composants memoïsés
   const RACIRow = React.memo(({ row, onSelect }) => {
     // ...
   }, (prev, next) => prev.row.activity === next.row.activity)

   const AlertCard = React.memo(({ alert, isSelected }) => {
     // ...
   })
   ```

4. **Lazy loading des composants lourds**
   ```typescript
   // Lazy load des composants IA
   const AISuggestions = lazy(() => import('./AISuggestions'))
   const RACIHeatmap = lazy(() => import('./RACIHeatmap'))
   const AlertPredictions = lazy(() => import('./AlertPredictions'))
   ```

5. **Optimiser les calculs coûteux**
   - Utiliser `useMemo` pour les stats (déjà fait, mais optimiser)
   - Web Workers pour les calculs RACI complexes (si > 1000 activités)
   - Debouncing amélioré pour la recherche

6. **Code splitting au niveau route**
   ```typescript
   // Dans le layout ou page parent
   const GovernancePage = lazy(() => import('./governance/page'))
   ```

#### Métriques de Performance Cibles
- ⚡ Temps de rendu initial < 200ms
- ⚡ Scroll fluide à 60fps même avec 1000+ alertes
- ⚡ Mémoire utilisée < 100MB pour 5000 items
- ⚡ Re-renders réduits de 70%

#### Livrables
- ✅ Virtualisation implémentée pour alertes et RACI
- ✅ Composants lazy-loaded
- ✅ Performance mesurée et documentée
- ✅ Guide d'optimisation pour autres pages

---

### **PHASE 4 : Accessibilité & UX Avancée** ♿
**Durée estimée** : 5-6 jours  
**Priorité** : 🟡 Moyenne  
**Impact** : Inclusion, conformité WCAG 2.1 AA

#### Objectifs
- Conformité WCAG 2.1 AA
- Navigation clavier complète
- Support lecteur d'écran

#### Actions
1. **ARIA labels complets**
   ```typescript
   <Tabs
     role="tablist"
     aria-label="Navigation principale de gouvernance"
   >
     <TabsTrigger
       value="raci"
       aria-controls="raci-panel"
       aria-selected={activeTab === 'raci'}
     >
       📐 Matrice RACI
       <span className="sr-only">
         {raciStats.critical} activités critiques
       </span>
     </TabsTrigger>
   </Tabs>
   ```

2. **Navigation clavier améliorée**
   - Tab, Shift+Tab : Navigation entre éléments
   - Enter/Space : Activation
   - Flèches : Navigation dans les listes
   - Escape : Fermer modales/panels
   - Raccourcis documentés visuellement

3. **Support lecteur d'écran**
   ```typescript
   // Annonces dynamiques
   <div
     role="status"
     aria-live="polite"
     aria-atomic="true"
     className="sr-only"
   >
     {filteredAlerts.length} alertes affichées
   </div>
   ```

4. **Focus visible amélioré**
   ```css
   .focus-visible {
     outline: 2px solid theme('colors.blue.400');
     outline-offset: 2px;
   }
   ```

5. **Skip links**
   ```typescript
   <a href="#main-content" className="skip-link">
     Aller au contenu principal
   </a>
   ```

6. **Landmarks ARIA**
   ```typescript
   <main id="main-content" role="main" aria-label="Gouvernance">
     <nav aria-label="Onglets de navigation">
     <aside aria-label="Panneau de détails">
   ```

7. **Tests d'accessibilité**
   - Utiliser `@axe-core/react` pour les tests automatiques
   - Tests manuels avec NVDA/JAWS
   - Audit Lighthouse accessibility score > 90

#### Livrables
- ✅ Conformité WCAG 2.1 AA
- ✅ Navigation clavier complète
- ✅ Tests d'accessibilité automatisés
- ✅ Documentation accessibilité

---

### **PHASE 5 : Tests & Qualité de Code** 🧪
**Durée estimée** : 4-5 jours  
**Priorité** : 🟡 Moyenne  
**Impact** : Fiabilité, maintenabilité long terme

#### Objectifs
- Couverture de tests > 80%
- Élimination des `any` TypeScript
- Documentation complète

#### Actions
1. **Tests unitaires (Jest + React Testing Library)**
   ```typescript
   // __tests__/hooks/useGovernanceFilters.test.ts
   describe('useGovernanceFilters', () => {
     it('should serialize filters correctly in URL', () => {
       // Test sérialisation
     })
     
     it('should restore filters from URL on mount', () => {
       // Test restauration
     })
   })

   // __tests__/components/RACITable.test.tsx
   describe('RACITable', () => {
     it('should render all activities', () => {
       // Test rendu
     })
     
     it('should handle row selection', () => {
       // Test interaction
     })
   })
   ```

2. **Tests d'intégration**
   - Navigation entre onglets
   - Filtrage et recherche
   - Actions sur alertes (acquitter, résoudre, escalader)

3. **Tests E2E (Playwright)**
   ```typescript
   test('should filter alerts by severity', async ({ page }) => {
     await page.goto('/maitre-ouvrage/governance?activeTab=alerts')
     await page.click('[aria-label="Filtrer par sévérité critique"]')
     // Vérifier que seules les alertes critiques sont affichées
   })
   ```

4. **Éliminer les `any` TypeScript**
   ```typescript
   // ❌ Avant
   const bmoGoverned = raciEnriched.filter(r => (r as any).decisionBMO).length

   // ✅ Après
   interface RACIEnriched extends RACIBase {
     decisionBMO?: string
   }
   const bmoGoverned = raciEnriched.filter(
     (r): r is RACIEnriched => 'decisionBMO' in r && !!r.decisionBMO
   ).length
   ```

5. **Documentation**
   - JSDoc pour tous les hooks et composants publics
   - Guide de développement pour la page
   - Storybook pour les composants UI

6. **Linting & Formatage**
   - ESLint strict
   - Prettier configuré
   - Pre-commit hooks avec Husky

#### Livrables
- ✅ Couverture de tests > 80%
- ✅ 0 `any` TypeScript
- ✅ Documentation complète
- ✅ CI/CD avec tests automatiques

---

## 📈 Métriques de Succès Globales

### Performance
- ⚡ Temps de chargement initial < 1s
- ⚡ Time to Interactive < 2s
- ⚡ Score Lighthouse Performance > 90

### Qualité
- ✅ Couverture de tests > 80%
- ✅ 0 bugs critiques
- ✅ TypeScript strict mode
- ✅ ESLint 0 erreurs

### Accessibilité
- ✅ WCAG 2.1 AA conforme
- ✅ Lighthouse Accessibility > 95
- ✅ Navigation clavier 100% fonctionnelle

### Maintenabilité
- ✅ Composants < 200 lignes
- ✅ Complexité cyclomatique < 10
- ✅ Documentation à jour

---

## 🗓️ Planning Global

| Phase | Durée | Priorité | Dépendances |
|-------|-------|----------|-------------|
| Phase 1 | 2-3 jours | 🔴 Critique | Aucune |
| Phase 2 | 5-7 jours | 🟠 Haute | Phase 1 |
| Phase 3 | 4-5 jours | 🟠 Haute | Phase 2 |
| Phase 4 | 5-6 jours | 🟡 Moyenne | Phase 2 |
| Phase 5 | 4-5 jours | 🟡 Moyenne | Phase 2, 3 |

**Total estimé** : 20-26 jours (4-5 semaines)

---

## 🎯 Priorisation Recommandée

### Sprint 1 (Semaine 1-2)
- ✅ Phase 1 : Correction bugs critiques
- ✅ Début Phase 2 : Extraction composants de base

### Sprint 2 (Semaine 3-4)
- ✅ Phase 2 : Refactoring complet
- ✅ Phase 3 : Optimisation performance

### Sprint 3 (Semaine 5)
- ✅ Phase 4 : Accessibilité
- ✅ Phase 5 : Tests & documentation

---

## 📝 Notes d'Implémentation

### Outils Recommandés
- **Virtualisation** : `@tanstack/react-virtual` (plus moderne que react-window)
- **Tests** : Jest + React Testing Library + Playwright
- **Accessibilité** : `@axe-core/react`, `eslint-plugin-jsx-a11y`
- **Performance** : React DevTools Profiler, Lighthouse CI

### Patterns à Suivre
- **Composition over configuration** : Composants petits et composables
- **Custom hooks** : Logique métier isolée
- **Type safety** : TypeScript strict, pas de `any`
- **Accessibility first** : ARIA dès le début, pas en post-traitement

---

## 🔄 Maintenance Continue

Après les 5 phases, maintenir :
- ✅ Revue de code systématique
- ✅ Tests de régression avant chaque PR
- ✅ Monitoring performance (Lighthouse CI)
- ✅ Mises à jour de sécurité régulières
- ✅ Documentation à jour avec le code

