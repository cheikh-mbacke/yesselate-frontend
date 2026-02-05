# Architecture Moderne - Validation Paiements

## 📋 Vue d'ensemble

Page de validation des paiements refactorisée avec une architecture moderne inspirée d'Analytics et Gouvernance, incluant une navigation latérale collapsible, des KPIs en temps réel avec sparklines, et une interface utilisateur fluide.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│ ┌─────────┐ ┌───────────────────────────────────────┐   │
│ │         │ │ Header: Titre + Recherche + Actions   │   │
│ │ Sidebar │ ├───────────────────────────────────────┤   │
│ │         │ │ SubNavigation: Breadcrumb + Onglets   │   │
│ │ (nav)   │ ├───────────────────────────────────────┤   │
│ │         │ │ KPIBar: 8 indicateurs temps réel      │   │
│ │         │ ├───────────────────────────────────────┤   │
│ │         │ │                                       │   │
│ │         │ │ Contenu principal                     │   │
│ │         │ │                                       │   │
│ │         │ ├───────────────────────────────────────┤   │
│ │         │ │ Status Bar: MAJ + Stats + Connexion   │   │
│ └─────────┘ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Nouveaux Composants Créés

### 1. **PaiementsCommandSidebar**
Navigation latérale collapsible avec :
- Icône et titre "Validation Paiements"
- Barre de recherche avec raccourci ⌘K
- 9 catégories de navigation avec badges :
  - Vue d'ensemble
  - À valider (12 badges warning)
  - Urgents (5 badges critical)
  - Validés
  - Rejetés
  - Planifiés (8 badges)
  - Trésorerie
  - Fournisseurs
  - Audit
- Indicateur visuel pour la catégorie active
- Mode collapsed avec icônes uniquement

```tsx
<PaiementsCommandSidebar
  activeCategory={activeCategory}
  collapsed={sidebarCollapsed}
  onCategoryChange={handleCategoryChange}
  onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
  onOpenCommandPalette={() => setCommandPaletteOpen(true)}
/>
```

### 2. **PaiementsSubNavigation**
Navigation secondaire avec :
- Breadcrumb : Validation Paiements → Catégorie → Sous-catégorie
- Sous-onglets contextuels selon la catégorie (ex: Tous, Bureau Finance, Direction Générale pour "À valider")
- Filtres de niveau 3 optionnels
- Support des badges avec compteurs

```tsx
<PaiementsSubNavigation
  mainCategory={activeCategory}
  mainCategoryLabel={CATEGORY_LABELS[activeCategory]}
  subCategory={activeSubCategory}
  subCategories={SUB_CATEGORIES_MAP[activeCategory] || []}
  onSubCategoryChange={handleSubCategoryChange}
/>
```

### 3. **PaiementsKPIBar**
Barre de KPIs temps réel avec :
- 8 indicateurs clés :
  - Total paiements
  - En attente (avec sparkline)
  - Urgents (avec tendance)
  - Validés (avec sparkline)
  - Rejetés
  - Planifiés
  - Trésorerie disponible (avec sparkline)
  - Montant moyen
- Sparklines pour visualiser l'évolution
- Mode collapsed/expanded
- Bouton de rafraîchissement
- Statut avec couleurs sémantiques (success, warning, critical, neutral)
- KPIs cliquables pour navigation rapide

```tsx
<PaiementsKPIBar
  kpis={kpis}
  visible={true}
  collapsed={kpiBarCollapsed}
  onToggleCollapse={() => setKpiBarCollapsed(prev => !prev)}
  onRefresh={() => loadStats('manual')}
  isRefreshing={statsLoading}
/>
```

### 4. **PaiementsStatusBar**
Barre de statut en footer avec :
- Indicateur de dernière mise à jour
- Statut de connexion (connecté/déconnecté)
- Résumé des statistiques
- Indicateur d'auto-refresh

```tsx
<PaiementsStatusBar
  lastUpdate={lastUpdate}
  isConnected={isConnected}
  autoRefresh={autoRefresh}
  stats={stats}
/>
```

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `⌘K` / `Ctrl+K` | Ouvrir la palette de commandes |
| `⌘B` / `Ctrl+B` | Toggle sidebar (afficher/masquer) |
| `Alt+←` | Retour à la navigation précédente |
| `F11` | Mode plein écran |

## 🎯 Fonctionnalités Principales

### Navigation Contextuelle
- **Historique de navigation** : Retour aux catégories/sous-catégories précédentes
- **Breadcrumb dynamique** : Affiche le chemin complet de navigation
- **Badges en temps réel** : Compteurs mis à jour automatiquement

### KPIs Interactifs
- **Sparklines** : Graphiques miniatures pour visualiser les tendances
- **Tendances** : Indicateurs up/down/stable avec pourcentages
- **Statuts coloriés** : Vert (success), Orange (warning), Rouge (critical), Gris (neutral)
- **Cliquables** : Navigation rapide vers les catégories

### Auto-refresh Intelligent
- Rafraîchissement automatique toutes les 60 secondes (configurable)
- Mode manuel avec bouton de rafraîchissement
- Indicateur de dernière mise à jour
- Gestion de l'état de connexion

### Responsive Design
- Sidebar collapsible pour économiser l'espace
- Adaptation mobile avec masquage progressif des éléments
- KPI Bar avec grid responsive (4 colonnes sur mobile, 8 sur desktop)

## 🎨 Design System

### Palette de Couleurs
- **Primary (Emerald)** : `emerald-400`, `emerald-500`
- **Success** : `emerald-400`
- **Warning** : `amber-400`, `amber-500`
- **Critical** : `red-400`, `red-500`
- **Neutral** : `slate-300`, `slate-400`, `slate-500`
- **Background** : `slate-900`, `slate-950`
- **Borders** : `slate-700/50`, `slate-800/50`

### Effets Visuels
- **Backdrop blur** : `backdrop-blur-xl` pour les panneaux
- **Gradients** : `from-slate-950 via-slate-900 to-slate-950`
- **Transitions** : `transition-all duration-200/300`
- **Hover effects** : `scale-[1.01]`, `scale-[1.02]`, `scale-105`
- **Border animations** : Indicateurs visuels sur les éléments actifs

## 📦 Structure des Fichiers

```
src/components/features/bmo/workspace/paiements/
├── PaiementsCommandSidebar.tsx      # Sidebar navigation
├── PaiementsSubNavigation.tsx       # Breadcrumb + sous-onglets
├── PaiementsKPIBar.tsx              # Barre KPIs + sparklines
├── PaiementsStatusBar.tsx           # Footer status bar
├── PaiementsCommandPalette.tsx      # Command palette (existant)
├── PaiementsWorkspaceTabs.tsx       # Tabs workspace (existant)
├── PaiementsWorkspaceContent.tsx    # Contenu workspace (existant)
├── PaiementsLiveCounters.tsx        # Compteurs live (existant)
├── views/
│   ├── PaiementsInboxView.tsx       # Vue liste (existant)
│   └── PaiementsDetailView.tsx      # Vue détail (existant)
└── index.ts                          # Exports centralisés

app/(portals)/maitre-ouvrage/validation-paiements/
└── page.tsx                          # Page principale refactorisée
```

## 🔄 Intégration avec l'existant

Les composants suivants sont préservés et intégrés dans la nouvelle architecture :
- ✅ `PaiementsWorkspaceTabs` : Gestion des onglets
- ✅ `PaiementsWorkspaceContent` : Router de contenu
- ✅ `PaiementsCommandPalette` : Palette de commandes ⌘K
- ✅ `PaiementsInboxView` : Vue liste des paiements
- ✅ `PaiementsDetailView` : Vue détail d'un paiement
- ✅ Store Zustand : `usePaiementsWorkspaceStore`
- ✅ API Service : `paiementsApiService`

## 🚀 Utilisation

```tsx
import { 
  PaiementsCommandSidebar,
  PaiementsSubNavigation,
  PaiementsKPIBar,
  PaiementsStatusBar,
} from '@/components/features/bmo/workspace/paiements';

// Dans votre page
<div className="flex h-screen">
  <PaiementsCommandSidebar {...sidebarProps} />
  <div className="flex-1 flex flex-col">
    <Header />
    <PaiementsSubNavigation {...navProps} />
    <PaiementsKPIBar {...kpiProps} />
    <main>{/* Contenu */}</main>
    <PaiementsStatusBar {...statusProps} />
  </div>
</div>
```

## 📊 Données KPIs

Les KPIs sont générés à partir des stats de l'API :

```typescript
interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
  onClick?: () => void;
}
```

## 🎭 États & Navigation

```typescript
// État de navigation
const [activeCategory, setActiveCategory] = useState('overview');
const [activeSubCategory, setActiveSubCategory] = useState('dashboard');
const [navigationHistory, setNavigationHistory] = useState([]);

// États UI
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);
const [isFullScreen, setIsFullScreen] = useState(false);

// États données
const [stats, setStats] = useState<PaiementsStats | null>(null);
const [autoRefresh, setAutoRefresh] = useState(true);
const [isConnected, setIsConnected] = useState(true);
```

## 🔧 Configuration

### Catégories de Navigation

Modifiez `CATEGORY_LABELS` et `SUB_CATEGORIES_MAP` pour personnaliser la navigation :

```typescript
const CATEGORY_LABELS: Record<string, string> = {
  overview: 'Vue d\'ensemble',
  pending: 'À valider',
  // ...
};

const SUB_CATEGORIES_MAP: Record<string, SubCategory[]> = {
  pending: [
    { id: 'all', label: 'Tous', badge: 12 },
    { id: 'bf-pending', label: 'Bureau Finance', badge: 7 },
    { id: 'dg-pending', label: 'Direction Générale', badge: 5, badgeType: 'critical' },
  ],
  // ...
};
```

## 🎨 Personnalisation

### Changer les Couleurs
Remplacez `emerald` par une autre couleur Tailwind :
- `blue` pour Analytics
- `purple` pour Gouvernance
- `emerald` pour Paiements (actuel)

### Ajouter des KPIs
Ajoutez de nouveaux KPIs dans le tableau `kpis` :

```typescript
{
  id: 'nouveau-kpi',
  label: 'Nouveau KPI',
  value: 123,
  trend: 'up',
  trendValue: '+5%',
  status: 'success',
  sparkline: [10, 15, 12, 18, 20, 19, 23],
}
```

## ✅ Checklist de Migration

- [x] Créer PaiementsCommandSidebar
- [x] Créer PaiementsSubNavigation
- [x] Créer PaiementsKPIBar
- [x] Créer PaiementsStatusBar
- [x] Refactoriser page.tsx avec nouvelle architecture
- [x] Intégrer raccourcis clavier
- [x] Ajouter auto-refresh intelligent
- [x] Implémenter navigation contextuelle
- [x] Gérer historique de navigation
- [x] Ajouter animations CSS
- [x] Exporter les composants dans index.ts
- [x] Tests linter (0 erreurs)

## 📝 Notes

- **Performance** : Les composants utilisent `React.memo` pour optimiser les re-renders
- **Accessibilité** : Support complet du clavier et des titres ARIA
- **Responsive** : Testé sur mobile, tablette et desktop
- **Dark mode** : Design pensé pour le mode sombre (thème Slate)
- **Cohérence** : Architecture identique à Analytics et Gouvernance pour une UX uniforme

## 🔗 Références

- Page Analytics : `app/(portals)/maitre-ouvrage/analytics/page.tsx`
- Page Gouvernance : `app/(portals)/maitre-ouvrage/gouvernance/page.tsx`
- Composants Analytics : `src/components/features/bmo/analytics/command-center/`
- Store Paiements : `src/lib/stores/paiementsWorkspaceStore.ts`
- API Service : `src/lib/services/paiementsApiService.ts`

