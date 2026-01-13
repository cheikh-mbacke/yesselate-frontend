# Decisions Command Center

Centre de Commandement pour la gestion des décisions - Version 2.0

## Architecture

Cette architecture suit le même pattern que la page Analytics et Gouvernance pour une expérience utilisateur cohérente.

### Structure

```
decisions/command-center/
├── DecisionsCommandSidebar.tsx    # Navigation latérale collapsible
├── DecisionsSubNavigation.tsx      # Navigation secondaire (breadcrumb + sous-onglets)
├── DecisionsKPIBar.tsx            # Barre de KPIs temps réel
├── DecisionsContentRouter.tsx      # Router de contenu par catégorie
└── index.ts                        # Exports centralisés
```

### Composants

#### DecisionsCommandSidebar
Navigation latérale avec 9 catégories principales :
- Vue d'ensemble
- En attente (badge warning)
- Critiques (badge critical)
- Stratégiques
- Opérationnelles
- Approuvées
- Historique
- Analytics
- Par type

#### DecisionsSubNavigation
Navigation secondaire avec :
- Breadcrumb (Décisions → Catégorie → Sous-catégorie)
- Sous-onglets contextuels selon la catégorie
- Filtres de niveau 3 optionnels

#### DecisionsKPIBar
Barre de KPIs avec 8 indicateurs :
- En attente, Critiques, Approuvées aujourd'hui
- Temps moyen, Stratégiques, Opérationnelles
- Taux d'approbation, Bloquées

#### DecisionsContentRouter
Router qui affiche le contenu approprié selon la catégorie active :
- Vue d'ensemble : Dashboard avec cartes de synthèse
- Autres catégories : Intégration avec DecisionsWorkspaceContent
- Analytics : Placeholder (en développement)

### Store

Le store `useDecisionsCommandCenterStore` gère :
- Navigation (catégorie, sous-catégorie, filtre)
- État UI (sidebar, fullscreen, modals)
- Filtres actifs
- Configuration KPIs
- Sélections multiples

### Raccourcis clavier

- `⌘K` : Ouvrir la command palette
- `⌘B` : Basculer la sidebar
- `⌘R` : Rafraîchir les données
- `⌘I` : Ouvrir les statistiques
- `F11` : Mode plein écran
- `Alt+←` : Retour en arrière

### Intégration

La page `app/(portals)/maitre-ouvrage/decisions/page.tsx` utilise cette architecture avec :
- Layout flex h-screen
- Sidebar → Header → SubNavigation → KPIBar → Main Content → Status Bar
- Intégration des composants existants (CommandPalette, StatsModal, DirectionPanel)

