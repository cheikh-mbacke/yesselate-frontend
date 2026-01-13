# 🎓 Guide Développeur - Module Tickets-Clients BTP

## 📚 TABLE DES MATIÈRES

1. [Architecture](#architecture)
2. [Store Zustand](#store-zustand)
3. [Composants](#composants)
4. [Modales](#modales)
5. [API Service](#api-service)
6. [Données Mock](#données-mock)
7. [Préférences Utilisateur](#préférences-utilisateur)
8. [Raccourcis Clavier](#raccourcis-clavier)
9. [Personnalisation](#personnalisation)
10. [Connexion Backend](#connexion-backend)

---

## 🏗️ ARCHITECTURE

### Structure du projet

```
tickets-client/
├── page.tsx                    # Page principale
├── stores/
│   └── ticketsClientWorkspaceStore.ts
├── api/
│   └── ticketsClientAPI.ts
├── data/
│   └── ticketsClientMock.ts
└── components/
    ├── TicketsClientToast.tsx
    ├── TicketsClientWorkspaceTabs.tsx
    ├── TicketsClientLiveCounters.tsx
    ├── TicketsClientCommandPalette.tsx
    ├── TicketsClientWorkspaceContent.tsx
    ├── TicketsClientModals.tsx
    ├── TicketsClientClientsManager.tsx
    ├── TicketsClientChantiersManager.tsx
    ├── TicketsClientBulkActions.tsx
    └── TicketsClientSettings.tsx
```

### Flux de données

```
Page principale
    ↓
Store Zustand (état global)
    ↓
Composants (lecture état)
    ↓
Actions utilisateur
    ↓
API Service (appels backend)
    ↓
Store mis à jour
    ↓
Re-render composants
```

---

## 📦 STORE ZUSTAND

### Utilisation basique

```typescript
import { useTicketsClientWorkspaceStore } from '@/lib/stores/ticketsClientWorkspaceStore';

function MyComponent() {
  const { tabs, activeTabId, openTab, closeTab } = useTicketsClientWorkspaceStore();
  
  // Ouvrir un nouvel onglet
  const handleOpenTicket = (ticketId: string) => {
    openTab('ticket', {
      title: `Ticket ${ticketId}`,
      icon: 'FileText',
      closeable: true,
      data: { ticketId },
    });
  };
  
  return <button onClick={() => handleOpenTicket('TC-001')}>Ouvrir ticket</button>;
}
```

### Actions disponibles

```typescript
// Gestion des onglets
openTab(type, options)      // Ouvrir un nouvel onglet
closeTab(id)                // Fermer un onglet
setActiveTab(id)            // Activer un onglet
updateTab(id, updates)      // Mettre à jour un onglet
closeOthers(id)             // Fermer tous sauf un
closeAll()                  // Fermer tous les onglets

// Navigation
goBack()                    // Retour historique
goForward()                 // Avancer historique
canGoBack()                 // Peut revenir en arrière ?
canGoForward()              // Peut avancer ?

// Préférences
setPreference(key, value)   // Modifier une préférence
```

### État du store

```typescript
interface TicketsClientWorkspaceStore {
  tabs: TicketsClientTab[];
  activeTabId: string | null;
  history: string[];
  historyIndex: number;
  preferences: {
    autoRefresh: boolean;
    defaultView: 'list' | 'kanban' | 'map' | 'timeline';
    compactMode: boolean;
    showClosedTickets: boolean;
    theme: 'auto' | 'light' | 'dark';
    notifications: {
      sound: boolean;
      desktop: boolean;
      email: boolean;
    };
  };
}
```

---

## 🎨 COMPOSANTS

### TicketsClientLiveCounters

Affiche les compteurs en temps réel.

```typescript
<TicketsClientLiveCounters
  counters={{
    nouveau: 12,
    en_cours: 34,
    critique: 3,
    sla_breach: 5,
  }}
  loading={false}
  onOpenStats={() => setStatsOpen(true)}
  onOpenExport={() => setExportOpen(true)}
  onRefresh={() => loadCounters()}
/>
```

### TicketsClientWorkspaceTabs

Gère l'affichage des onglets.

```typescript
<TicketsClientWorkspaceTabs
  tabs={tabs}
  activeTabId={activeTabId}
  onTabClick={(id) => setActiveTab(id)}
  onTabClose={(id) => closeTab(id)}
/>
```

### TicketsClientCommandPalette

Palette de commandes accessible via ⌘K.

```typescript
<TicketsClientCommandPalette
  open={commandOpen}
  onClose={() => setCommandOpen(false)}
  onOpenStats={() => setStatsOpen(true)}
  onOpenExport={() => setExportOpen(true)}
  onCreateTicket={openCreateWizard}
/>
```

### FileUploader

Upload de fichiers drag & drop.

```typescript
<FileUploader
  maxFiles={10}
  maxSize={10} // MB
  acceptedTypes={['pdf', 'jpg', 'png', 'docx']}
  onFilesSelected={(files) => {
    console.log('Fichiers sélectionnés:', files);
    // Envoyer vers API
  }}
/>
```

---

## 🪟 MODALES

### Stats & Analytics

```typescript
<TicketsClientStatsModal
  open={statsOpen}
  onClose={() => setStatsOpen(false)}
/>
```

Onglets disponibles :
- Vue d'ensemble
- Par statut
- Par priorité
- SLA & Performance

### Export

```typescript
<TicketsClientExportModal
  open={exportOpen}
  onClose={() => setExportOpen(false)}
/>
```

Formats supportés : CSV, Excel, JSON, PDF

### Gestion Clients

```typescript
<TicketsClientClientsManagerModal
  open={clientsManagerOpen}
  onClose={() => setClientsManagerOpen(false)}
  onSelectClient={(client) => {
    console.log('Client sélectionné:', client);
  }}
/>
```

### Gestion Chantiers

```typescript
<TicketsClientChantiersManagerModal
  open={chantiersManagerOpen}
  onClose={() => setChantiersManagerOpen(false)}
  onSelectChantier={(chantier) => {
    console.log('Chantier sélectionné:', chantier);
  }}
/>
```

### Actions en Masse

```typescript
<TicketsClientBulkActionsModal
  open={bulkActionsOpen}
  onClose={() => setBulkActionsOpen(false)}
  selectedTickets={selectedTickets}
  onActionComplete={() => {
    // Recharger les données
    loadCounters();
  }}
/>
```

### Paramètres

```typescript
<TicketsClientSettingsModal
  open={settingsOpen}
  onClose={() => setSettingsOpen(false)}
/>
```

---

## 🔌 API SERVICE

### Utilisation

```typescript
import { ticketsClientAPI } from '@/lib/api/ticketsClientAPI';

// Récupérer la liste des tickets
const tickets = await ticketsClientAPI.getTickets({
  page: 1,
  limit: 20,
  status: 'nouveau',
  priority: 'haute',
});

// Créer un ticket
const newTicket = await ticketsClientAPI.createTicket({
  titre: 'Problème de sécurité',
  description: 'Les échafaudages ne sont pas sécurisés',
  priority: 'critique',
  categorie: 'securite',
  clientId: 'C001',
  chantierId: 'CH001',
});

// Mettre à jour un ticket
await ticketsClientAPI.updateTicket('TC-001', {
  status: 'en_cours',
  responsable: 'Jean Dupont',
});

// Ajouter un message
await ticketsClientAPI.addMessage('TC-001', {
  contenu: 'Nous avons envoyé une équipe sur place',
  auteur: 'Support',
});

// Upload de fichier
await ticketsClientAPI.uploadAttachment('TC-001', file);
```

### Méthodes disponibles

| Méthode | Description |
|---------|-------------|
| `getTickets(filters)` | Liste des tickets avec filtres |
| `getTicketById(id)` | Détail d'un ticket |
| `createTicket(data)` | Créer un nouveau ticket |
| `updateTicket(id, data)` | Mettre à jour un ticket |
| `executeAction(id, action)` | Exécuter une action |
| `addMessage(id, message)` | Ajouter un message |
| `getMessages(id)` | Récupérer les messages |
| `uploadAttachment(id, file)` | Upload fichier |
| `getStats(filters)` | Statistiques |
| `exportTickets(filters, format)` | Export |
| `search(query)` | Recherche |
| `bulkUpdate(ids, updates)` | Mise à jour en masse |

---

## 🎲 DONNÉES MOCK

### Générer des tickets

```typescript
import { generateMockTickets } from '@/lib/data/ticketsClientMock';

const tickets = generateMockTickets(100); // 100 tickets
```

### Structure d'un ticket

```typescript
interface Ticket {
  id: string;
  numero: string;              // TC-2025-001
  titre: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  categorie: TicketCategory;
  clientId: string;
  clientNom: string;
  chantierId: string;
  chantierNom: string;
  responsable: string | null;
  dateCreation: string;
  dateModification: string;
  dateLimite: string;
  slaStatus: 'ok' | 'warning' | 'breach';
  tags: string[];
  messages: Message[];
  historique: HistoryEntry[];
}
```

---

## ⚙️ PRÉFÉRENCES UTILISATEUR

### Lire les préférences

```typescript
const { preferences } = useTicketsClientWorkspaceStore();

if (preferences.autoRefresh) {
  // Auto-refresh activé
}

const theme = preferences.theme; // 'auto' | 'light' | 'dark'
```

### Modifier les préférences

```typescript
const { setPreference } = useTicketsClientWorkspaceStore();

// Activer l'auto-refresh
setPreference('autoRefresh', true);

// Changer la vue par défaut
setPreference('defaultView', 'kanban');

// Modifier les notifications
setPreference('notifications', {
  sound: true,
  desktop: true,
  email: false,
});
```

### Préférences disponibles

```typescript
autoRefresh: boolean          // Auto-actualisation
defaultView: string           // Vue par défaut (list/kanban/map/timeline)
compactMode: boolean          // Mode compact
showClosedTickets: boolean    // Afficher tickets clos
theme: string                 // Thème (auto/light/dark)
notifications: {
  sound: boolean              // Son
  desktop: boolean            // Push bureau
  email: boolean              // Email
}
```

---

## ⌨️ RACCOURCIS CLAVIER

### Implémentation

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // ⌘K ou Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandOpen(true);
    }
    
    // ESC
    if (e.key === 'Escape') {
      closeAllOverlays();
    }
    
    // ⌘N
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      openCreateWizard();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Liste des raccourcis

| Raccourci | Action |
|-----------|--------|
| `⌘K` / `Ctrl+K` | Palette de commandes |
| `⌘N` / `Ctrl+N` | Nouveau ticket |
| `⌘S` / `Ctrl+S` | Statistiques |
| `⌘E` / `Ctrl+E` | Export |
| `⌘⇧H` | Aide |
| `ESC` | Fermer overlays |
| `Alt + ←` | Navigation retour |
| `Alt + →` | Navigation suivant |

---

## 🎨 PERSONNALISATION

### Couleurs

Les couleurs sont définies dans Tailwind. Pour personnaliser :

```typescript
// Statuts
const statutColors = {
  nouveau: 'text-blue-600 bg-blue-50',
  en_cours: 'text-emerald-600 bg-emerald-50',
  critique: 'text-rose-600 bg-rose-50',
};
```

### Icônes

Utiliser Lucide React :

```typescript
import { Star, Building, AlertCircle } from 'lucide-react';

<Star className="w-4 h-4 text-amber-500" />
```

### Thème sombre

Utiliser les classes Tailwind `dark:` :

```typescript
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
  Contenu
</div>
```

---

## 🔌 CONNEXION BACKEND

### 1. Remplacer les données mock

Dans `ticketsClientAPI.ts`, remplacer :

```typescript
// AVANT (mock)
export async function getTickets(filters?: TicketFilters) {
  await simulateDelay();
  let tickets = generateMockTickets(150);
  // ... filtrage
  return tickets;
}

// APRÈS (backend réel)
export async function getTickets(filters?: TicketFilters) {
  const response = await fetch('/api/tickets-client?' + new URLSearchParams(filters));
  if (!response.ok) throw new Error('Erreur lors du chargement des tickets');
  return response.json();
}
```

### 2. Gérer l'authentification

```typescript
const token = localStorage.getItem('authToken');

const response = await fetch('/api/tickets-client', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### 3. Gérer les erreurs

```typescript
try {
  const tickets = await ticketsClientAPI.getTickets();
  // Succès
} catch (error) {
  console.error('Erreur:', error);
  toast.error('Erreur', 'Impossible de charger les tickets');
}
```

### 4. Upload de fichiers

```typescript
export async function uploadAttachment(ticketId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ticketId', ticketId);

  const response = await fetch('/api/tickets-client/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Erreur upload');
  return response.json();
}
```

### 5. WebSocket pour temps réel

```typescript
// Dans page.tsx
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3000/tickets-client');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'ticket_update') {
      // Recharger les compteurs
      loadCounters('auto');
      toast.info('Nouveau ticket', data.ticket.titre);
    }
  };
  
  return () => ws.close();
}, []);
```

---

## 🧪 TESTS

### Test d'un composant

```typescript
import { render, screen } from '@testing-library/react';
import { TicketsClientLiveCounters } from './TicketsClientLiveCounters';

test('affiche les compteurs', () => {
  render(
    <TicketsClientLiveCounters
      counters={{ nouveau: 12, en_cours: 34 }}
      loading={false}
    />
  );
  
  expect(screen.getByText('12')).toBeInTheDocument();
  expect(screen.getByText('34')).toBeInTheDocument();
});
```

### Test du store

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTicketsClientWorkspaceStore } from './ticketsClientWorkspaceStore';

test('ouvre et ferme un onglet', () => {
  const { result } = renderHook(() => useTicketsClientWorkspaceStore());
  
  act(() => {
    result.current.openTab('ticket', { title: 'Test' });
  });
  
  expect(result.current.tabs).toHaveLength(1);
  
  act(() => {
    result.current.closeTab(result.current.tabs[0].id);
  });
  
  expect(result.current.tabs).toHaveLength(0);
});
```

---

## 🐛 DÉBOGAGE

### Logs du store

```typescript
// Activer les logs dans ticketsClientWorkspaceStore.ts
const useTicketsClientWorkspaceStore = create<TicketsClientWorkspaceStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ... state
      }),
      { name: 'tickets-client-workspace' }
    ),
    { name: 'TicketsClientStore' }
  )
);
```

Puis ouvrir Redux DevTools dans le navigateur.

### Logs API

```typescript
// Dans ticketsClientAPI.ts
console.log('[API] getTickets:', filters);
const response = await fetch(...);
console.log('[API] Response:', response);
```

---

## 📚 RESSOURCES

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Lucide React Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Next.js](https://nextjs.org/)

---

## 🆘 SUPPORT

Pour toute question :
1. Vérifier ce guide
2. Consulter le code source des composants
3. Examiner les données mock
4. Ouvrir une issue GitHub

---

**Version:** 2.0.0  
**Dernière mise à jour:** 10 janvier 2026

