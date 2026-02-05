# 📋 Analyse des Fonctionnalités Manquantes - AnomalyAnnotationPanel

## ✅ Fonctionnalités Actuelles

### Design & UX
- ✅ Header avec statistiques en temps réel
- ✅ Sections collapsibles (anomalies actives, résolues, annotations)
- ✅ Recherche en temps réel
- ✅ Filtres par sévérité
- ✅ Tri (date, sévérité)
- ✅ Tooltips sur les boutons
- ✅ Raccourcis clavier (Enter, Escape)
- ✅ États de chargement
- ✅ Gestion d'erreurs avec try/catch
- ✅ Modal de confirmation pour suppression

### Modals Existants
- ✅ Modal de détail d'anomalie (`AnomalyDetailModal`)
- ✅ Modal de confirmation de suppression
- ✅ Formulaire inline d'ajout d'annotation

### Fonctionnalités Métier
- ✅ Ajout d'annotation
- ✅ Modification d'annotation (inline)
- ✅ Suppression d'annotation
- ✅ Résolution d'anomalie
- ✅ Copie du texte (presse-papiers)
- ✅ Navigation entre anomalies (prev/next dans modal)

---

## ❌ Fonctionnalités Manquantes Critiques

### 1. **Pagination & Performance**
**Problème** : Toutes les anomalies/annotations sont chargées en une fois
**Impact** : Performance dégradée avec beaucoup de données
**Solution** :
- Pagination avec `itemsPerPage` configurable (10, 25, 50, 100)
- Virtual scrolling pour très grandes listes
- Lazy loading des sections repliées

```typescript
interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}
```

### 2. **Export des Données**
**Problème** : Pas de moyen d'exporter les anomalies/annotations
**Impact** : Utilisateurs ne peuvent pas partager ou analyser les données
**Solution** :
- Modal d'export avec formats : CSV, Excel, PDF, JSON
- Options : tout exporter, export filtré, export sélectionné
- Templates d'export personnalisables

```typescript
interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  scope: 'all' | 'filtered' | 'selected';
  includeDetails: boolean;
  includeAnnotations: boolean;
  includeResolved: boolean;
}
```

### 3. **Actions en Lot (Batch Actions)**
**Problème** : Pas de sélection multiple ni d'actions groupées
**Impact** : Inefficace pour traiter plusieurs items
**Solution** :
- Checkbox pour sélection multiple
- Barre d'actions en lot : résoudre, exporter, supprimer
- Sélection par catégorie (toutes les critiques, etc.)

```typescript
interface BatchActions {
  selectedIds: Set<string>;
  onResolveSelected: (ids: string[]) => void;
  onExportSelected: (ids: string[]) => void;
  onDeleteSelected: (ids: string[]) => void;
}
```

### 4. **Modal de Détail d'Annotation**
**Problème** : Pas de modal détaillé pour les annotations (comme pour les anomalies)
**Impact** : Impossible de voir toutes les infos d'une annotation en détail
**Solution** :
- Modal similaire à `AnomalyDetailModal`
- Affichage complet : historique, liens, métadonnées
- Navigation entre annotations

### 5. **Filtres Avancés**
**Problème** : Filtres limités (seulement sévérité)
**Impact** : Difficile de trouver des anomalies spécifiques
**Solution** :
- Filtre par date (range picker)
- Filtre par champ (`montant_ht`, `fournisseur`, etc.)
- Filtre par type d'annotation (`comment`, `correction`, etc.)
- Filtre par auteur
- Filtres combinables avec AND/OR

```typescript
interface AdvancedFilters {
  dateRange?: { start: Date; end: Date };
  fields?: string[];
  annotationTypes?: AnnotationType[];
  authors?: string[];
  hasAnnotations?: boolean;
  resolved?: boolean;
}
```

### 6. **Modal de Statistiques Détaillées**
**Problème** : Stats limitées dans le header
**Impact** : Pas d'analyse approfondie
**Solution** :
- Modal avec graphiques (tendances, répartition par type/sévérité)
- Statistiques par période
- Comparaisons (vs période précédente)
- Graphiques interactifs

### 7. **Modal de Recherche Avancée**
**Problème** : Recherche simple (texte uniquement)
**Impact** : Recherche limitée
**Solution** :
- Recherche multi-critères
- Recherche par expressions régulières
- Recherche dans les métadonnées
- Historique de recherches
- Recherches sauvegardées

### 8. **Modal d'Aide / Raccourcis Clavier**
**Problème** : Pas de référence des raccourcis
**Impact** : Utilisateurs ne découvrent pas les raccourcis
**Solution** :
- Modal listant tous les raccourcis
- Catégories : navigation, actions, modals
- Test interactif des raccourcis

### 9. **Modal de Paramètres / Configuration**
**Problème** : Pas de personnalisation de l'affichage
**Impact** : Expérience utilisateur non personnalisable
**Solution** :
- Configuration des colonnes affichées
- Taille des items (compact, normal, large)
- Ordre par défaut
- Filtres par défaut
- Sauvegarde des préférences

### 10. **Timeline / Historique**
**Problème** : Pas d'historique des modifications
**Impact** : Impossible de suivre l'évolution
**Solution** :
- Timeline des modifications d'annotation
- Historique des résolutions d'anomalies
- Affichage des versions précédentes
- Audit trail complet

### 11. **Visualisation des Relations**
**Problème** : Relations anomalies ↔ annotations peu claires
**Impact** : Difficile de comprendre les liens
**Solution** :
- Graphique de relations
- Vue en arbre
- Liens visuels entre éléments liés
- Navigation par relations

### 12. **APIs / Callbacks Manquants**
**Problème** : Interface props limitée
**Impact** : Intégration difficile avec l'extérieur
**Solution** :

```typescript
interface AnomalyAnnotationPanelProps {
  // Existant
  documentId: string;
  documentType: DocumentType;
  anomalies: DocumentAnomaly[];
  annotations: DocumentAnnotation[];
  onAddAnnotation: (annotation: Omit<DocumentAnnotation, 'id' | 'createdAt'>) => void;
  onResolveAnomaly: (anomalyId: string) => void;
  onUpdateAnnotation?: (annotationId: string, comment: string) => void;
  onDeleteAnnotation?: (annotationId: string) => void;

  // MANQUANTS
  onRefresh?: () => Promise<void>; // Rafraîchir les données
  onExport?: (config: ExportConfig) => Promise<Blob>; // Export
  onBulkResolve?: (anomalyIds: string[]) => Promise<void>; // Résolution en lot
  onBulkDelete?: (annotationIds: string[]) => Promise<void>; // Suppression en lot
  onFilterChange?: (filters: AdvancedFilters) => void; // Notification changement filtres
  onAnnotationDetail?: (annotationId: string) => void; // Ouverture détail annotation
  isLoading?: boolean; // État de chargement global
  error?: string | null; // Erreur globale
  permissions?: { // Gestion des permissions
    canEdit?: boolean;
    canDelete?: boolean;
    canExport?: boolean;
    canResolve?: boolean;
  };
  config?: { // Configuration
    pagination?: {
      enabled: boolean;
      defaultItemsPerPage: number;
    };
    filters?: {
      enabled: boolean;
      defaultFilters: AdvancedFilters;
    };
    export?: {
      enabled: boolean;
      allowedFormats: ('csv' | 'excel' | 'pdf' | 'json')[];
    };
  };
}
```

### 13. **Mock Data & APIs Manquants**
**Problème** : Pas de structure pour les mocks
**Solution** :
- Fichier `mockAnomalies.ts` avec données réalistes
- Fichier `mockAnnotations.ts`
- Service API mock avec méthodes :
  - `fetchAnomalies()`
  - `fetchAnnotations()`
  - `exportData()`
  - `bulkResolve()`
  - `getStats()`

---

## 🎯 Priorités d'Implémentation

### Priorité 1 (Critique)
1. **Pagination** - Performance avec beaucoup de données
2. **Export** - Fonctionnalité métier essentielle
3. **Actions en lot** - Efficacité opérationnelle
4. **Modal détail annotation** - Cohérence UX

### Priorité 2 (Important)
5. **Filtres avancés** - Amélioration UX
6. **Modal statistiques** - Analyse approfondie
7. **APIs manquantes** - Intégration

### Priorité 3 (Souhaitable)
8. **Recherche avancée** - Pour utilisateurs avancés
9. **Modal aide** - Documentation
10. **Configuration** - Personnalisation
11. **Timeline** - Audit trail
12. **Relations visuelles** - Compréhension

---

## 🔧 Modifications Recommandées

### Structure de Fichiers Suggérée
```
src/components/features/bmo/validation-bc/
├── AnomalyAnnotationPanel.tsx (existant)
├── AnomalyDetailModal.tsx (existant)
├── AnnotationDetailModal.tsx (NOUVEAU)
├── modals/
│   ├── ExportModal.tsx (NOUVEAU)
│   ├── StatsModal.tsx (NOUVEAU)
│   ├── AdvancedFiltersModal.tsx (NOUVEAU)
│   ├── HelpModal.tsx (NOUVEAU)
│   └── SettingsModal.tsx (NOUVEAU)
├── components/
│   ├── BatchActionsBar.tsx (NOUVEAU)
│   ├── Pagination.tsx (NOUVEAU)
│   └── RelationsGraph.tsx (NOUVEAU)
└── hooks/
    ├── usePagination.ts (NOUVEAU)
    ├── useBatchSelection.ts (NOUVEAU)
    └── useAdvancedFilters.ts (NOUVEAU)
```

### Pattern Modal Overlay (Comme Tickets)
Le composant doit utiliser le même pattern que le système de tickets :
- Modal overlay avec backdrop blur
- Fermeture par clic extérieur ou Escape
- Navigation fluide entre modals
- État géré par un store centralisé (optionnel)

---

## 📝 Notes Supplémentaires

### Points de Vérification
- ✅ Modal d'anomalie existe et fonctionne
- ❌ Modal d'annotation manquant
- ❌ Modal d'export manquant
- ❌ Modal de stats manquant
- ❌ Pagination manquante
- ❌ Actions en lot manquantes
- ❌ Filtres avancés manquants

### Patterns à Réutiliser
- Pattern modal overlay (TicketsModals.tsx)
- Pattern batch actions (BatchActionsBar.tsx)
- Pattern export (ExportModal.tsx)
- Pattern pagination (TransactionsDataTable.tsx)

