# Module Gouvernance - Command Center

Centre de commandement stratégique et opérationnel pour la maîtrise d'ouvrage.

## 📋 Vue d'ensemble

Le module Gouvernance est une plateforme sophistiquée de pilotage stratégique et opérationnel conçue pour les grandes entreprises (BTP, infrastructure, etc.). Il offre une surveillance multi-niveaux, une coordination avancée et des outils de prise de décision pour la gestion de portfolios de projets complexes.

## 🎯 Fonctionnalités principales

### 🏠 Vue d'ensemble (Dashboard)
- Tableau de bord centralisé avec KPIs en temps réel
- Décisions urgentes en attente
- Escalades critiques
- Projets nécessitant une attention

### 📊 Gestion de Projets
- Portfolio complet avec vue tableau et cartes
- Timeline de jalons et livrables
- Suivi budget et avancement
- Indicateurs de santé (On-track, At-risk, Late)
- Alertes et notifications ciblées

### ⚠️ Gestion des Risques
- Registre des risques avec matrice Probabilité/Impact
- Plans de mitigation et suivi
- Alertes actives par catégorie
- Escalation automatique des risques critiques

### 👥 Gestion des Ressources
- Affectations et disponibilités
- Planification de capacité
- Gestion des compétences
- Sous-traitants et prestataires

### 💰 Gestion Financière
- Engagements et facturations
- Prévisions et écarts budgétaires
- Cash flow et trésorerie
- Tableaux de bord financiers

### ✅ Conformité & Audits
- Suivi réglementaire
- Contrats et avenants
- Calendrier d'audits
- Certifications et habilitations
- Indicateurs HSE

### 🔄 Processus & Workflows
- Circuits de validation configurables
- Files d'attente de validations
- Délégations actives
- Matrices RACI

## 🏗️ Architecture

### Structure des composants

```
src/components/features/bmo/governance/command-center/
├── views/                      # Vues principales
│   ├── OverviewView.tsx       # Dashboard
│   ├── ProjectsView.tsx       # Gestion projets
│   ├── RisksView.tsx          # Gestion risques
│   ├── ResourcesView.tsx      # Gestion ressources
│   ├── FinancialView.tsx      # Gestion financière
│   ├── ComplianceView.tsx     # Conformité
│   └── ProcessesView.tsx      # Processus
├── modals/                     # Modales spécialisées
│   ├── DecisionModal.tsx      # Workflow décision
│   ├── EscalationModal.tsx    # Escalade
│   ├── FiltersModal.tsx       # Filtres avancés
│   ├── ExportModal.tsx        # Export données
│   └── ConfirmDialog.tsx      # Confirmation
├── CommandCenterSidebar.tsx   # Navigation principale
├── SubNavigation.tsx          # Navigation secondaire
├── KPIBar.tsx                 # Barre d'indicateurs
├── ContentRouter.tsx          # Routeur de contenu
├── DetailModal.tsx            # Modal détaillé
├── DetailPanel.tsx            # Panneau latéral
├── CommandPalette.tsx         # Palette de commandes
├── NotificationsPanel.tsx     # Panneau notifications
├── SurveillanceTable.tsx      # Table réutilisable
├── BatchActionsBar.tsx        # Actions par lot
├── EmptyState.tsx             # États vides
├── ActionsMenu.tsx            # Menu actions
├── config.ts                  # Configuration
└── types.ts                   # Types TypeScript
```

### Store Zustand

```typescript
src/lib/stores/governanceCommandCenterStore.ts
```

État global pour :
- Navigation multi-niveaux (main → sub → sub-sub)
- Pile de modales
- Toggles UI (sidebar, fullscreen, command palette, notifications)
- Historique de navigation

### Services API

```typescript
src/lib/services/governanceService.ts
```

APIs pour :
- Projets (CRUD, filtres, recherche)
- Risques (création, mise à jour, mitigation)
- Alertes (marquage, résolution, dismissal)
- Décisions (approbation, rejet, différé)
- Escalades (création, résolution)
- KPIs (récupération temps réel)
- Export (Excel, PDF, CSV)

### Données Mock

```typescript
src/lib/mocks/governanceMockData.ts
```

Données de développement pour :
- Projets types (BTP, infrastructure)
- Risques et alertes
- Décisions et escalades
- KPIs et métriques

### Utilitaires

```typescript
src/lib/utils/governanceHelpers.ts
```

Fonctions helper pour :
- Calculs de santé projets
- Formatage (devises, dates, pourcentages)
- Filtrage et tri
- Agrégations et statistiques
- Validation et vérifications

## 🎨 Design System

### Couleurs

- **Textes** : Neutral (slate-xxx) pour éviter la saturation
- **Icônes** : Couleurs sémantiques (success, warning, critical)
- **Graphiques** : Colorés pour la visualisation
- **Badges** : Couleurs selon statut

### Principes UX

1. **Navigation multi-niveaux** : Main tabs → Sub-tabs → Sub-sub-tabs
2. **Breadcrumb** : Toujours visible pour le contexte
3. **Actions contextuelles** : Menu consolidé pour éviter la surcharge
4. **Modales spécialisées** : Workflows guidés pour décisions critiques
5. **Raccourcis clavier** : Navigation rapide (Ctrl+K, F11, Alt+Left)
6. **États vides** : Messages clairs et actions suggérées
7. **Feedback immédiat** : Toasts, badges, notifications

## ⌨️ Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+K` / `Cmd+K` | Ouvrir la palette de commandes |
| `F11` | Activer/désactiver le plein écran |
| `Alt+←` | Retour à la vue précédente |
| `Ctrl+S` | Sauvegarder (dans les modales) |
| `Esc` | Fermer la modale/palette active |

## 📊 KPIs suivis

1. **Projets actifs** : Nombre de projets en cours
2. **Budget consommé** : Pourcentage global avec sparkline
3. **Jalons en retard** : Alertes de planning
4. **Risques critiques** : Nombre de risques à surveiller
5. **Validations en attente** : Files d'attente
6. **Taux d'utilisation** : Ressources (humaines/matérielles)
7. **Alertes non lues** : Notifications à traiter
8. **Conformité SLA** : Respect des engagements

## 🔧 Configuration

### Variables d'environnement

```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
NEXT_PUBLIC_AUTO_REFRESH_INTERVAL=30000
```

### Configuration navigation

```typescript
// src/components/features/bmo/governance/command-center/config.ts
export const MAIN_NAVIGATION: NavigationItem[] = [...]
```

## 🚀 Utilisation

### Intégration de la page

```typescript
import GovernancePage from '@/app/(portals)/maitre-ouvrage/governance/page';

// La page est autonome et gère son propre état
```

### Accès au store

```typescript
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

function MyComponent() {
  const { currentNavigation, goTo, openModal } = useGovernanceCommandCenterStore();
  
  // Navigation
  goTo(['pilotage', 'projets', 'portfolio']);
  
  // Ouvrir une modale
  openModal('detail', { type: 'project', id: '123' });
}
```

### Utilisation des hooks de données

```typescript
import { useProjects, useKPIs } from '@/lib/hooks/useGovernanceData';

function ProjectsList() {
  const { data: projects, isLoading, error } = useProjects({
    status: 'active',
    healthStatus: 'at-risk',
  });
  
  const { data: kpis } = useKPIs();
  
  // Render...
}
```

## 🔮 Évolutions futures

### Phase 2
- [ ] Intégration React Query pour cache et synchronisation
- [ ] WebSockets pour notifications temps réel
- [ ] Mode hors-ligne avec synchronisation
- [ ] Export planifié (rapports récurrents)
- [ ] Tableaux de bord personnalisables

### Phase 3
- [ ] Intelligence artificielle (prédictions de risques)
- [ ] Recommandations automatiques
- [ ] Analyse prédictive des budgets
- [ ] Détection d'anomalies
- [ ] Chatbot d'assistance

### Phase 4
- [ ] Application mobile native
- [ ] Mode tablette optimisé
- [ ] Collaboration temps réel (présence utilisateurs)
- [ ] Commentaires et annotations
- [ ] Intégration MS Teams / Slack

## 📝 Bonnes pratiques

### Pour les développeurs

1. **Types TypeScript** : Toujours typer les données
2. **Composants réutilisables** : DRY (Don't Repeat Yourself)
3. **Performance** : Utiliser React.memo pour composants lourds
4. **Accessibilité** : ARIA labels, navigation clavier
5. **Tests** : Unit tests pour logique métier critique

### Pour les utilisateurs

1. **Favoris** : Épingler les vues fréquentes
2. **Filtres sauvegardés** : Créer des vues personnalisées
3. **Notifications** : Configurer les alertes pertinentes
4. **Raccourcis** : Maîtriser les raccourcis clavier
5. **Export** : Automatiser les rapports récurrents

## 🐛 Débogage

### Activer les logs

```typescript
// Dans le store
useGovernanceCommandCenterStore.setState({ debug: true });
```

### Vérifier l'état du store

```typescript
// Console navigateur
window.__ZUSTAND_STORES__
```

## 📚 Références

- [Architecture de navigation multi-niveaux](#)
- [Design system BTP](#)
- [Spécifications métier](#)
- [Guide d'intégration API](#)

## 👥 Contributeurs

Ce module a été conçu pour répondre aux besoins des grandes entreprises en matière de pilotage stratégique et opérationnel.

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2026

