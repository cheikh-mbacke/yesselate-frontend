# 📋 Guide Complet : Tickets Clients Command Center

## 🎯 Vue d'Ensemble

Le module **Tickets Clients** est maintenant au même niveau de sophistication que le module **Blocked**, avec une architecture complète de command center.

---

## 📦 Composants Créés

### 1. **Service API** (`ticketsApiService.ts`)

Service complet avec mock data réaliste :

```typescript
import { ticketsApi } from '@/lib/services/ticketsApiService';

// CRUD
const tickets = await ticketsApi.getAll(filter, sort, page, pageSize);
const ticket = await ticketsApi.getById(id);
const newTicket = await ticketsApi.create(data);
const updated = await ticketsApi.update(id, data);

// Actions métier
await ticketsApi.assign({ ticketId, assigneeId });
await ticketsApi.escalate({ ticketId, reason, urgency });
await ticketsApi.bulkEscalate(ticketIds, reason);
await ticketsApi.resolve({ ticketId, resolution });
await ticketsApi.bulkResolve(ticketIds, resolution);
await ticketsApi.close(ticketId, notes);
await ticketsApi.reopen(ticketId, reason);
await ticketsApi.addMessage(ticketId, content, isInternal);

// Statistics & Data
const stats = await ticketsApi.getStats();
const auditLog = await ticketsApi.getAuditLog(ticketId, limit);
const templates = await ticketsApi.getResponseTemplates();
const slaRules = await ticketsApi.getSLARules();
const clients = await ticketsApi.getClients();
const assignees = await ticketsApi.getAssignees();

// Export
const blob = await ticketsApi.exportData('xlsx', filter);
```

**Mock Data incluse:**
- 75 tickets réalistes
- 8 clients (avec segmentation: enterprise, PME, startup)
- 6 agents avec départements
- 8 templates de réponse
- 5 règles SLA
- Génération automatique de SLA avec deadlines

---

### 2. **Charts Analytics** (`TicketsAnalyticsCharts.tsx`)

9 graphiques Chart.js prêts à l'emploi :

```typescript
import {
  TicketsTrendChart,              // Évolution nouveaux vs résolus
  TicketsPriorityChart,            // Distribution par priorité (doughnut)
  TicketsCategoryChart,            // Distribution par catégorie (bar)
  TicketsResponseTimeChart,        // Temps de réponse vs objectif SLA
  TicketsAgentPerformanceChart,    // Performance par agent (stacked bar)
  TicketsSatisfactionChart,        // Score satisfaction (doughnut)
  TicketsSLAComplianceChart,       // Conformité SLA dans le temps
  TicketsHourlyVolumeChart,        // Volume horaire (24h)
  TicketsClientDistributionChart,  // Répartition par segment client
} from '@/components/features/bmo/workspace/tickets/command-center';
```

---

### 3. **Toast Notifications** (`TicketsToast.tsx`)

Système de notifications contextuel :

```typescript
import { TicketsToastProvider, useTicketsToast } from './command-center';

// Dans votre page
<TicketsToastProvider>
  {children}
</TicketsToastProvider>

// Dans vos composants
const toast = useTicketsToast();

// Méthodes génériques
toast.success('Opération réussie', 'Le ticket a été créé');
toast.error('Erreur', 'Impossible de sauvegarder');
toast.warning('Attention', 'Le SLA expire bientôt');
toast.info('Information', 'Mise à jour disponible');

// Méthodes spécifiques
toast.ticketCreated('TK-2024-0142');
toast.ticketResolved('TK-2024-0142');
toast.ticketAssigned('TK-2024-0142', 'Marie Dupont');
toast.ticketEscalated('TK-2024-0142');
toast.dataRefreshed();
toast.exportComplete('xlsx');
toast.slaWarning('TK-2024-0142', '2 heures');
```

---

### 4. **Decision Center** (`TicketsDecisionCenter.tsx`)

Centre de décision pour actions en lot :

**Onglets disponibles:**
- **Overview**: Vue d'ensemble + actions rapides
- **Critical**: Liste des tickets critiques
- **Assign**: Assignation en lot
- **Resolve**: Résolution en lot
- **Bulk**: Actions groupées (escalade, résolution)

**Fonctionnalités:**
- Sélection multiple de tickets
- Escalade en lot avec motif
- Résolution en lot avec message
- Assignation en lot à un agent
- Statistiques en temps réel

```typescript
import { TicketsDecisionCenter } from './command-center';

<TicketsDecisionCenter 
  open={isOpen} 
  onClose={handleClose} 
/>
```

---

### 5. **Modales Centralisées** (`TicketsModals.tsx`)

Toutes les modales du système :

```typescript
import { TicketsModals } from './command-center';

// Dans la page
<TicketsModals />

// Ouvrir une modale via le store
const { openModal } = useTicketsWorkspaceStore();

openModal('stats');                                    // Statistiques détaillées
openModal('decision-center');                          // Centre de décision
openModal('export');                                   // Export multi-format
openModal('shortcuts');                                // Raccourcis clavier
openModal('settings');                                 // Paramètres
openModal('ticket-detail', { ticketId: 'TKT-00001' }); // Détail ticket
openModal('kpi-drilldown', { kpiId: 'total' });       // Détail KPI
openModal('templates');                                // Modèles de réponse
openModal('confirm', {                                 // Confirmation
  title: 'Confirmer la suppression',
  message: 'Cette action est irréversible',
  onConfirm: () => handleDelete(),
  variant: 'destructive',
});
```

**Modales disponibles:**

| Modale | Description | Fonctionnalités |
|--------|-------------|-----------------|
| **StatsModal** | Statistiques détaillées | KPI clés, 6 graphiques interactifs, basculement entre vues |
| **ExportModal** | Export données | JSON, CSV, XLSX, PDF avec téléchargement |
| **ShortcutsModal** | Raccourcis clavier | Liste de tous les shortcuts disponibles |
| **SettingsModal** | Paramètres | Auto-refresh, notifications, vue compacte |
| **TicketDetailModal** | Détail ticket | Infos complètes, SLA, conversation, envoi message |
| **KPIDrilldownModal** | Détail KPI | Analyse approfondie avec graphiques |
| **TemplatesModal** | Modèles | Liste des templates de réponse, copie rapide |
| **ConfirmModal** | Confirmation | Modale générique pour confirmations |

---

### 6. **Filters Panel** (`TicketsFiltersPanel.tsx`)

Panneau de filtres avancés :

**Sections disponibles:**
- **Recherche**: Texte libre
- **Statut**: Ouvert, En cours, En attente, Résolu, Fermé
- **Priorité**: Critique, Haute, Moyenne, Basse
- **Catégorie**: Technique, Commercial, Facturation, Livraison, Qualité, Autre
- **Assigné à**: Liste déroulante d'agents + "Non assignés"
- **Client**: Liste déroulante + filtre "VIP uniquement"
- **SLA**: SLA dépassés / conformes
- **Tags**: Tags multiples avec sélection visuelle
- **Période**: Date de début et fin

**Fonctionnalités:**
- Compteur de filtres actifs
- Sections expansibles/collapsibles
- Réinitialisation rapide
- Application des filtres avec feedback visuel

```typescript
import { TicketsFiltersPanel } from './command-center';

<TicketsFiltersPanel />
```

---

### 7. **Store Enrichi** (`ticketsWorkspaceStore.ts`)

Store Zustand avec toutes les fonctionnalités :

```typescript
import { useTicketsWorkspaceStore } from '@/lib/stores/ticketsWorkspaceStore';

const {
  // Navigation
  navigation,
  navigate,
  goBack,
  
  // Modales
  modal,
  openModal,
  closeModal,
  
  // Sélection
  selectedIds,
  toggleSelected,
  selectAll,
  clearSelection,
  
  // Filtres
  currentFilter,
  setFilter,
  clearFilter,
  filtersPanelOpen,
  toggleFiltersPanel,
  
  // UI
  sidebarCollapsed,
  toggleSidebar,
  kpiConfig,
  setKPIConfig,
  fullscreen,
  toggleFullscreen,
  
  // Decision Register (audit local)
  decisionRegister,
  addDecision,
  clearDecisions,
  
  // Watchlist
  watchlist,
  addToWatchlist,
  removeFromWatchlist,
} = useTicketsWorkspaceStore();
```

**Decision Register** (Audit Trail):
```typescript
// Enregistrer une décision
addDecision({
  at: new Date().toISOString(),
  action: 'escalated',
  ticketId: 'TKT-00001',
  ticketReference: 'TK-2024-0142',
  userId: 'USR-001',
  userName: 'A. DIALLO',
  userRole: 'Superviseur',
  notes: 'Escaladé en raison de la criticité',
  hash: await sha256Hex(JSON.stringify(data)),
});
```

---

## 🔗 Intégration Complète

### Dans `page.tsx`:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { useTicketsWorkspaceStore } from '@/lib/stores/ticketsWorkspaceStore';
import {
  TicketsCommandSidebar,
  TicketsSubNavigation,
  TicketsKPIBar,
  TicketsContentRouter,
  TicketsModals,
  TicketsFiltersPanel,
  TicketsToastProvider,
  useTicketsToast,
} from '@/components/features/bmo/workspace/tickets/command-center';

export default function TicketsClientsPage() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    kpiConfig,
    setKPIConfig,
    fullscreen,
    toggleFullscreen,
    openModal,
    toggleFiltersPanel,
  } = useTicketsWorkspaceStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K - Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // openCommandPalette();
      }
      
      // ⌘E - Export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        openModal('export');
      }
      
      // ⌘F - Filters
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        toggleFiltersPanel();
      }
      
      // F11 - Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      
      // Esc - Close modals
      if (e.key === 'Escape') {
        // Handled by modals
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal, toggleFiltersPanel, toggleFullscreen]);

  return (
    <TicketsToastProvider>
      <div className="flex h-screen overflow-hidden bg-slate-950">
        {/* Sidebar */}
        <TicketsCommandSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub Navigation */}
          <TicketsSubNavigation />
          
          {/* KPI Bar */}
          {kpiConfig.visible && <TicketsKPIBar />}
          
          {/* Content */}
          <TicketsContentRouter />
        </div>
        
        {/* Modales */}
        <TicketsModals />
        
        {/* Filters Panel */}
        <TicketsFiltersPanel />
      </div>
    </TicketsToastProvider>
  );
}
```

---

## 🎨 Vues Disponibles dans ContentRouter

Le `TicketsContentRouter` supporte automatiquement ces vues selon la navigation :

| Vue | Déclencheur | Description |
|-----|-------------|-------------|
| **OverviewView** | `overview` | Dashboard principal avec stats et graphiques |
| **QueueView** | `queue` | Liste des tickets en file d'attente |
| **CriticalView** | `critical` | Tickets critiques nécessitant attention |
| **MatrixView** | `matrix` | Matrice Urgence × Impact |
| **TimelineView** | `timeline` | Timeline chronologique des événements |
| **ClientsView** | `clients` | Vue par client |
| **AgentsView** | `agents` | Vue par agent |
| **AnalyticsView** | `analytics` | Graphiques et analyses approfondies |
| **AuditView** | `audit` | Journal d'audit complet avec traçabilité |

---

## 📊 Exemples d'Utilisation

### 1. Workflow complet de résolution

```typescript
const toast = useTicketsToast();
const { openModal, addDecision } = useTicketsWorkspaceStore();

// 1. Ouvrir le centre de décision
openModal('decision-center');

// 2. Sélectionner des tickets critiques
// (fait dans le DecisionCenter)

// 3. Résoudre en lot
await ticketsApi.bulkResolve(selectedIds, 'Problème résolu par mise à jour système');

// 4. Notification
toast.success('Résolution réussie', `${selectedIds.length} tickets résolus`);

// 5. Enregistrer dans l'audit
addDecision({
  at: new Date().toISOString(),
  action: 'resolved',
  ticketId: 'BULK',
  ticketReference: `BULK-${selectedIds.length}`,
  userId: 'USR-001',
  userName: 'A. DIALLO',
  userRole: 'Superviseur',
  notes: `Résolution en lot de ${selectedIds.length} tickets`,
});
```

### 2. Export de données

```typescript
// Via modale
openModal('export');

// Ou directement
const blob = await ticketsApi.exportData('xlsx', {
  status: ['open', 'in_progress'],
  priority: 'critical',
  slaBreached: true,
});
```

### 3. Filtrage avancé

```typescript
// Ouvrir le panneau
toggleFiltersPanel();

// Ou appliquer programmatiquement
setFilter({
  status: 'open',
  priority: 'critical',
  slaBreached: true,
  vipOnly: true,
});
```

---

## 🚀 Fonctionnalités Clés

✅ **Service API complet** avec mock data réaliste  
✅ **9 graphiques Chart.js** pour analytics  
✅ **Toast notifications** contextuelles  
✅ **Decision Center** avec actions en lot  
✅ **8 modales** fonctionnelles  
✅ **Filters Panel** avancé avec 11 critères  
✅ **Store enrichi** avec decision register  
✅ **Export multi-format** (JSON, CSV, XLSX, PDF)  
✅ **Audit trail** complet  
✅ **Templates de réponse**  
✅ **Règles SLA** configurables  
✅ **Keyboard shortcuts**  

---

## 🔄 Migration vers vraies APIs

Pour remplacer les mocks par de vraies APIs, modifier `ticketsApiService.ts` :

```typescript
// Remplacer
async getAll(filter, sort, page, pageSize) {
  await this.delay(300); // ← SUPPRIMER
  // ... mock logic
}

// Par
async getAll(filter, sort, page, pageSize) {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    body: JSON.stringify({ filter, sort, page, pageSize }),
  });
  return response.json();
}
```

Tous les types TypeScript sont déjà définis et prêts à l'emploi ! 🎉

---

## 📝 Checklist de Validation

- [x] Service API avec CRUD complet
- [x] Actions métier (assign, escalate, resolve, etc.)
- [x] 75+ tickets mock réalistes
- [x] 9 graphiques analytics
- [x] Toast notifications
- [x] Decision Center
- [x] 8 modales fonctionnelles
- [x] Filters Panel avancé
- [x] Store avec decision register
- [x] Export multi-format
- [x] Audit trail
- [x] Templates de réponse
- [x] Règles SLA
- [x] Keyboard shortcuts
- [x] Documentation complète

**Le module Tickets Clients est maintenant aussi sophistiqué que le module Blocked !** 🚀

