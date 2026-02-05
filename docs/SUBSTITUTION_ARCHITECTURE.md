# Architecture Centre de Commandement - Substitution

## Vue d'ensemble

La page Substitution a été refactorisée pour utiliser la même architecture que les pages Analytics et Gouvernance, offrant une expérience utilisateur cohérente et moderne.

## 📐 Architecture

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

## 🧩 Nouveaux Composants

### 1. SubstitutionCommandSidebar
**Fichier**: `src/components/features/bmo/substitution/command-center/SubstitutionCommandSidebar.tsx`

Sidebar de navigation principale avec 9 catégories :

- 🏠 **Vue d'ensemble** - Résumé général
- ⚠️ **Critiques** (3) - Substitutions urgentes
- ⏰ **En Attente** (12) - Demandes non assignées
- 📅 **Absences** (8) - Calendrier des absences
- 👥 **Délégations** (15) - Délégations actives
- ✅ **Terminées** - Substitutions complétées
- 📜 **Historique** - Archive complète
- 📊 **Analytiques** - Statistiques et tendances
- ⚙️ **Paramètres** - Configuration

**Fonctionnalités** :
- Mode collapsed avec icônes uniquement
- Badges avec types (default, warning, critical)
- Indicateur visuel pour la catégorie active
- Barre de recherche intégrée avec raccourci ⌘K
- Transition fluide entre états

**Props** :
```typescript
interface SubstitutionCommandSidebarProps {
  activeCategory: string;
  collapsed: boolean;
  onCategoryChange: (category: string) => void;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
}
```

### 2. SubstitutionSubNavigation
**Fichier**: `src/components/features/bmo/substitution/command-center/SubstitutionSubNavigation.tsx`

Navigation secondaire contextuelle avec :

- **Breadcrumb** - Substitution → Catégorie → Sous-catégorie
- **Sous-onglets** - Navigation de niveau 2
- **Filtres** - Niveau 3 optionnel

**Exemples de sous-catégories** :

**Critiques** :
- Toutes (3)
- Urgentes (1)
- Haute priorité (2)

**En Attente** :
- Toutes (12)
- Sans substitut (5)
- En validation (7)

**Absences** :
- En cours (8)
- À venir (15)
- Planifiées

**Props** :
```typescript
interface SubstitutionSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: SubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: SubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}
```

### 3. SubstitutionKPIBar
**Fichier**: `src/components/features/bmo/substitution/command-center/SubstitutionKPIBar.tsx`

Barre de KPIs en temps réel avec 8 indicateurs :

| KPI | Description | Statut |
|-----|-------------|--------|
| **Substitutions Actives** | Total en cours | 38 |
| **Critiques** | Urgentes | 3 (↓-1) |
| **En Attente** | Non assignées | 12 (↑+2) |
| **Absences J** | Aujourd'hui | 8 |
| **Délégations** | Actives | 15 (↑+3) |
| **Taux Complétion** | Pourcentage | 94% (↑+2%) |
| **Temps Réponse** | Moyenne | 2.4h (↓-0.3h) |
| **Satisfaction** | Note moyenne | 4.7/5 |

**Fonctionnalités** :
- Sparklines pour visualiser les tendances
- Indicateurs de tendance (↑↓→)
- Couleurs sémantiques (success, warning, critical)
- Mode collapsed/expanded
- Rafraîchissement manuel
- Timestamp de dernière mise à jour

**Props** :
```typescript
interface SubstitutionKPIBarProps {
  visible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onRefresh?: () => void;
}
```

## 🎨 Design System

### Palette de couleurs
```css
/* Primaire */
--indigo-400: #818cf8
--indigo-500: #6366f1

/* Fond */
--slate-900: rgb(15 23 42)
--slate-950: rgb(2 6 23)

/* Bordures */
--slate-700/50: rgba(51 65 85 / 0.5)

/* États */
--critical: #ef4444 (red-500)
--warning: #f59e0b (amber-500)
--success: #10b981 (emerald-500)
--neutral: #94a3b8 (slate-400)
```

### Typographie
- **Titre principal** : 16px font-semibold
- **Catégories sidebar** : 14px font-medium
- **Sous-navigation** : 14px font-medium
- **KPIs valeur** : 18px font-bold
- **KPIs label** : 12px
- **Breadcrumb** : 14px

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `⌘K` / `Ctrl+K` | Palette de commandes |
| `⌘B` / `Ctrl+B` | Toggle sidebar |
| `⌘R` / `Ctrl+R` | Rafraîchir |
| `⌘I` / `Ctrl+I` | Statistiques |
| `⌘E` / `Ctrl+E` | Exporter |
| `F11` | Plein écran |
| `Alt+←` | Retour arrière |
| `Escape` | Fermer panneau |

## 🔄 Navigation

### Historique
Le système maintient un historique de navigation permettant de revenir en arrière :

```typescript
const [navigationHistory, setNavigationHistory] = useState<
  Array<{ category: string; subCategory: string }>
>([]);
```

### Catégories → Sous-catégories
Chaque catégorie principale possède ses propres sous-catégories :

```typescript
const subCategoriesMap: Record<string, SubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'summary', label: 'Résumé' },
    { id: 'today', label: "Aujourd'hui", badge: 8 },
  ],
  // ... autres catégories
};
```

## 📊 Status Bar

La barre de statut affiche :
- Dernière mise à jour (relative)
- Nombre de substitutions actives
- Statut de connexion (avec animation pulse)

```tsx
<footer className="flex items-center justify-between px-4 py-1.5 border-t">
  <div className="flex items-center gap-4">
    <span>Dernière mise à jour: il y a 2 min</span>
    <span>38 substitutions actives</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
    <span>Connecté</span>
  </div>
</footer>
```

## 🔔 Notifications Panel

Panneau latéral coulissant pour les notifications :
- Ouverture/fermeture fluide
- Overlay semi-transparent
- Accessible via icône Bell avec badge
- Fermeture par Escape ou clic overlay

## 🎯 Intégration avec les stores

### SubstitutionWorkspaceStore
```typescript
const {
  commandPaletteOpen,
  setCommandPaletteOpen,
  statsModalOpen,
  setStatsModalOpen,
  directionPanelOpen,
  setDirectionPanelOpen,
} = useSubstitutionWorkspaceStore();
```

### BMOStore
```typescript
const { 
  addToast, 
  addActionLog, 
  currentUser 
} = useBMOStore();
```

## 📝 Logs d'actions

Tous les événements importants sont loggés :

```typescript
addActionLog({
  userId: currentUser.id,
  userName: currentUser.name,
  userRole: currentUser.role,
  action: 'navigation',
  module: 'substitution',
  targetId: category,
  targetType: 'category',
  targetLabel: categoryLabel,
  details: `Navigation vers la catégorie ${category}`,
  bureau: 'BMO',
});
```

## 🚀 Fonctionnalités communes avec Analytics/Gouvernance

✅ Layout flex h-screen avec sidebar collapsible  
✅ Même palette de couleurs (slate-900/950, indigo-400)  
✅ Header simplifié avec back button, recherche et menu actions  
✅ Panneau de notifications latéral  
✅ Raccourcis clavier identiques  
✅ Status bar avec indicateur de connexion  
✅ Navigation breadcrumb à 3 niveaux  
✅ KPI Bar avec sparklines  
✅ Mode plein écran  
✅ Menu actions dropdown  
✅ Historique de navigation  

## 📦 Structure des fichiers

```
src/components/features/bmo/substitution/
├── command-center/
│   ├── SubstitutionCommandSidebar.tsx    # Sidebar principale
│   ├── SubstitutionSubNavigation.tsx     # Navigation secondaire
│   ├── SubstitutionKPIBar.tsx           # Barre de KPIs
│   └── index.ts                         # Export centralisé
└── workspace/
    ├── SubstitutionWorkspaceContent.tsx  # Contenu principal
    ├── SubstitutionCommandPalette.tsx    # Palette de commandes
    ├── SubstitutionStatsModal.tsx        # Modal statistiques
    └── SubstitutionDirectionPanel.tsx    # Panneau de pilotage

app/(portals)/maitre-ouvrage/
└── substitution/
    └── page.tsx                          # Page principale refactorisée
```

## 🎭 Modes d'affichage

Le système peut basculer entre plusieurs modes :
- **Normal** : Affichage standard
- **Collapsed Sidebar** : Sidebar réduite aux icônes
- **Collapsed KPIBar** : KPIs masqués
- **Plein écran** : Utilise toute la fenêtre

## 💡 Best Practices

1. **Réactivité** : Utiliser `useCallback` et `useMemo` pour optimiser les performances
2. **Accessibilité** : Titles sur les icônes, raccourcis clavier, focus visible
3. **Feedback** : Toasts pour les actions, animations de chargement
4. **Logging** : Tous les événements importants sont loggés
5. **État** : Gestion centralisée via Zustand stores
6. **Types** : TypeScript strict pour la sécurité
7. **Style** : Utilisation cohérente de la palette de couleurs

## 🔄 Migration depuis l'ancienne version

### Avant
```tsx
<header className="border-b">
  <div className="px-6 py-4">
    <h1>Substitutions & Délégations</h1>
    {/* Actions multiples */}
  </div>
</header>
```

### Après
```tsx
<SubstitutionCommandSidebar />
<header>
  {/* Header simplifié */}
</header>
<SubstitutionSubNavigation />
<SubstitutionKPIBar />
```

## 🎉 Résultat

Une interface moderne, cohérente et performante qui suit les mêmes patterns que Analytics et Gouvernance, offrant une expérience utilisateur unifiée à travers toute l'application.

