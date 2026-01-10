# 📋 Documentation complète - Module Clients

## 🎯 Vue d'ensemble

Le module Clients est une application complète de gestion de la relation client (CRM) intégrée au portail Maître d'Ouvrage. Il offre une interface sophistiquée pour gérer les clients, prospects, litiges, interactions, et contrats.

---

## 📁 Architecture des fichiers

```
yesselate-frontend/
├── app/(portals)/maitre-ouvrage/clients/
│   └── page.tsx                          # Page principale avec layout
│
├── src/components/features/bmo/clients/
│   ├── command-center/
│   │   ├── ClientsCommandSidebar.tsx     # ✅ Sidebar navigation
│   │   ├── ClientsSubNavigation.tsx      # ✅ Breadcrumb + sous-onglets
│   │   ├── ClientsKPIBar.tsx             # ✅ Barre KPIs temps réel
│   │   ├── ClientsContentRouter.tsx      # ✅ Router de contenu avec 9 vues
│   │   ├── ClientsAnalyticsCharts.tsx    # ✅ 8 graphiques analytics
│   │   ├── ClientsFiltersPanel.tsx       # ✅ Filtres avancés
│   │   ├── modals/
│   │   │   ├── ClientDetailModal.tsx     # ✅ Fiche client complète (7 onglets)
│   │   │   ├── InteractionModal.tsx      # ✅ Nouvelle interaction (6 types)
│   │   │   ├── LitigeDetailModal.tsx     # ✅ Gestion litiges (3 onglets)
│   │   │   ├── ExportModal.tsx           # ✅ Export avancé (4 formats)
│   │   │   └── index.ts                  # ✅ Exports des modals
│   │   └── index.ts                      # ✅ Exports du command center
│   │
│   ├── ClientsStatsModal.tsx             # ℹ️ Statistiques globales
│   └── ClientsDirectionPanel.tsx         # ℹ️ Panneau direction
│
└── lib/
    ├── stores/
    │   └── clientsWorkspaceStore.ts      # ✅ Zustand store
    └── data/
        └── clientsMockData.ts            # ✅ Mock data complet
```

---

## 🎨 Layout de la page

### Structure principale

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────────────┐  │
│ │          │ │  Header: Titre + Recherche + Actions          │  │
│ │          │ ├──────────────────────────────────────────────┤  │
│ │ Sidebar  │ │  SubNav: Breadcrumb + Onglets + Filtres      │  │
│ │ (9 nav)  │ ├──────────────────────────────────────────────┤  │
│ │          │ │  KPI Bar: 8 indicateurs temps réel           │  │
│ │          │ ├──────────────────────────────────────────────┤  │
│ │          │ │                                               │  │
│ │          │ │  Contenu principal (ContentRouter)           │  │
│ │          │ │                                               │  │
│ │          │ ├──────────────────────────────────────────────┤  │
│ │          │ │  Status Bar: MAJ + Stats + Connexion         │  │
│ └──────────┘ └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧭 Navigation

### Sidebar - 9 catégories principales

1. **Vue d'ensemble** (Home)
   - Dashboard général
   - Métriques clés
   - Activité récente

2. **Prospects** (UserPlus)
   - Pipeline de vente
   - Conversion
   - Lead scoring

3. **Clients Premium** (Crown)
   - Portefeuille premium
   - Comptes clés
   - VIP tracking

4. **Litiges** (AlertTriangle)
   - Litiges ouverts
   - En cours de résolution
   - Historique

5. **Entreprises** (Building2)
   - Annuaire complet
   - Recherche avancée
   - Fiches détaillées

6. **Interactions** (MessageSquare)
   - Historique complet
   - Nouvelle interaction
   - Suivi

7. **Contrats** (FileText)
   - Contrats actifs
   - À renouveler
   - Expirés

8. **Rapports** (TrendingUp)
   - Analytics
   - KPIs
   - Exports

9. **Paramètres** (Settings)
   - Configuration
   - Préférences
   - Intégrations

### Sub-navigation contextuelle

Chaque catégorie a ses propres sous-onglets :

**Vue d'ensemble:**
- Tableau de bord
- Activité récente
- Alertes

**Prospects:**
- Chauds (Hot)
- Tièdes (Warm)
- Froids (Cold)

**Clients Premium:**
- Top 10
- À risque
- Satisfaction élevée

**Litiges:**
- Ouverts
- En cours
- Résolus

**Entreprises:**
- Tous
- Par secteur
- Par région

etc...

---

## 📊 KPI Bar - 8 indicateurs

1. **Total Clients** - Nombre total de clients actifs
2. **Prospects** - Prospects en cours
3. **Premium** - Clients premium
4. **CA Total** - Chiffre d'affaires cumulé
5. **Satisfaction** - Score moyen de satisfaction
6. **Litiges** - Litiges actifs
7. **À Risque** - Clients à surveiller
8. **Renouvellements** - Contrats à renouveler ce mois

Chaque KPI affiche :
- Valeur principale
- Tendance (↑↓)
- Variation en %
- Mini sparkline (optionnel)
- Status coloré (emerald/amber/rose)

---

## 🎯 Vues principales (ContentRouter)

### 1. Vue d'ensemble
- Grille de KPIs
- Graphiques principaux (CA, Satisfaction, Distribution)
- Activité récente
- Alertes et actions requises

### 2. Prospects
- Tableau avec filtres
- Pipeline visuel
- Cartes prospects (Hot/Warm/Cold)
- Probabilités de conversion

### 3. Clients Premium
- Liste enrichie
- Métriques par client
- Contrats et projets
- Managers assignés

### 4. Litiges
- Liste avec priorités
- Statuts visuels (open/in_progress/resolved)
- Timeline des actions
- Assignation

### 5. Entreprises (Annuaire complet)
- Tableau avec recherche avancée
- Tri multi-colonnes
- Filtres secteur/région/CA
- Actions en masse

### 6. Interactions
- Historique chronologique
- Filtres par type (call/email/meeting...)
- Outcome tracking
- Nouvelle interaction rapide

### 7. Contrats
- Liste avec statuts
- Alertes renouvellement
- Valeurs et échéances
- Documents associés

### 8. Rapports
- Graphiques avancés
- Export de données
- Comparaisons
- Tendances

### 9. Paramètres
- Configuration du module
- Préférences utilisateur
- Intégrations API

---

## 📈 Graphiques Analytics (8 charts)

1. **ClientsSatisfactionChart** - Évolution satisfaction dans le temps
2. **ClientsMonthlyRevenueChart** - CA mensuel
3. **ClientsTypeDistributionChart** - Répartition Premium/Standard/Prospect
4. **ClientsSectorChart** - Distribution par secteur
5. **ClientsRegionChart** - Carte/Distribution géographique
6. **ClientsChurnRiskChart** - Analyse du risque de perte
7. **ClientsAcquisitionChart** - Nouveaux clients par mois
8. **ClientsLTVChart** - Lifetime Value moyen

---

## 🔲 Modals complets

### 1. ClientDetailModal
**7 onglets:**
- **Overview**: Informations générales, KPIs, notes
- **Contacts**: Liste des contacts avec rôles
- **Interactions**: Historique complet
- **Contracts**: Contrats actifs/expirés
- **Financials**: CA, graphiques, projets
- **Litiges**: Litiges associés
- **History**: Timeline complète

**Fonctionnalités:**
- Édition inline
- Actions contextuelles
- Export fiche client
- Partage
- Archivage

### 2. InteractionModal
**6 types d'interactions:**
- Call (Appel)
- Email
- Meeting (Réunion)
- Demo (Démonstration)
- Visit (Visite)
- Support

**Champs:**
- Sujet et description
- Date/Heure/Durée
- Participants multiples
- Outcome (Positive/Neutral/Negative)
- Action de suivi
- Tags rapides

### 3. LitigeDetailModal
**3 onglets:**
- **Détails**: Description, montant, priorité, catégorie
- **Timeline**: Actions chronologiques avec commentaires
- **Résolution**: Formulaire de résolution

**Actions:**
- Ajouter commentaire
- Escalader
- Résoudre
- Générer rapport

**Visualisation:**
- Timeline verticale
- Badges de statut
- Priorités visuelles
- Alertes selon ancienneté

### 4. ExportModal
**Processus en 4 étapes:**

**Étape 1 - Format:**
- CSV
- Excel (.xlsx)
- PDF
- JSON

**Étape 2 - Colonnes:**
- Sélection granulaire
- Groupes: Basic, Financial, Metrics, Dates, Contact
- Tout sélectionner/désélectionner

**Étape 3 - Filtres:**
- Type (Premium/Standard/Prospect)
- Statut (Active/Pending/At Risk/Inactive)
- Période (date range)

**Étape 4 - Options:**
- Inclure contacts (feuille séparée)
- Inclure interactions
- Inclure contrats
- Résumé avant export

---

## 💾 Mock Data

### Types de données

```typescript
interface Client {
  id: string;
  name: string;
  type: 'premium' | 'standard' | 'prospect';
  sector: string;
  ca: string;
  caNumeric: number;
  satisfaction: number;
  since: string;
  city: string;
  region: string;
  status: 'active' | 'pending' | 'at_risk' | 'inactive' | 'prospect';
  contacts: number;
  employees?: number;
  website?: string;
  address?: string;
  postalCode?: string;
  country: string;
  tags: string[];
  lastInteraction?: string;
  nextAction?: string;
  manager?: string;
  projects?: number;
  contracts?: number;
  revenue?: { month: string; amount: number }[];
  notes?: string;
}

interface Prospect {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  source: string;
  status: 'hot' | 'warm' | 'cold';
  value: string;
  valueNumeric: number;
  lastContact: string;
  progress: number;
  sector: string;
  employees?: number;
  city: string;
  nextStep?: string;
  probability?: number;
  competitors?: string[];
  notes?: string;
}

interface Litige {
  id: string;
  client: string;
  clientId: string;
  subject: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  amount: string;
  amountNumeric: number;
  daysOpen: number;
  assignedTo?: string;
  resolution?: string;
  priority: number;
  category: string;
  actions: Action[];
}

interface Contact { ... }
interface Interaction { ... }
interface Contract { ... }
```

### Exemples de données

**Fichier:** `lib/data/clientsMockData.ts`

- 6+ clients variés
- 4+ prospects (hot/warm/cold)
- 3+ litiges (différentes sévérités)
- Contacts multiples
- Interactions historiques
- Contrats avec statuts

**Helper functions:**
```typescript
getClientById(id)
getProspectById(id)
getLitigeById(id)
getClientContacts(clientId)
getClientInteractions(clientId)
getClientContracts(clientId)
calculateStats()
```

---

## 🔑 Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `⌘K` | Ouvrir recherche/Command Palette |
| `⌘B` | Toggle sidebar |
| `F11` | Mode plein écran |
| `Alt+←` | Retour |
| `⌘N` | Nouvelle interaction |
| `⌘E` | Exporter |
| `⌘D` | Ouvrir détail client |
| `⌘M` | Ouvrir stats modal |
| `Shift+?` | Aide |
| `Esc` | Fermer modal/panel |

---

## 🎨 Design System

### Palette de couleurs

**Backgrounds:**
- Primary: `slate-900` (#0f172a)
- Secondary: `slate-800` (#1e293b)
- Tertiary: `slate-950` (#020617)

**Accents:**
- Primary: `cyan-500` (#06b6d4)
- Success: `emerald-500` (#10b981)
- Warning: `amber-500` (#f59e0b)
- Danger: `rose-500` (#f43f5e)
- Premium: `amber-400` (#fbbf24)

**Borders:**
- Default: `slate-700/50`
- Focus: `cyan-500/50`
- Error: `rose-500/50`

### Composants UI

**Buttons:**
- Primary: `bg-cyan-600 hover:bg-cyan-700`
- Outline: `border border-slate-700/50`
- Ghost: `hover:bg-slate-800/50`

**Badges:**
- Status (actif): `bg-emerald-500/20 text-emerald-400 border-emerald-500/30`
- Warning: `bg-amber-500/20 text-amber-400 border-amber-500/30`
- Error: `bg-rose-500/20 text-rose-400 border-rose-500/30`
- Premium: `bg-amber-500/20 text-amber-400 border-amber-500/30`

**Cards:**
```tsx
className="p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 
           hover:bg-slate-800/50 transition-colors"
```

---

## 🔌 APIs à créer

### Endpoints requis

```typescript
// Clients
GET    /api/clients                   // Liste clients avec pagination
GET    /api/clients/:id               // Détail client
POST   /api/clients                   // Créer client
PUT    /api/clients/:id               // MAJ client
DELETE /api/clients/:id               // Supprimer/Archiver

// Prospects
GET    /api/prospects                 // Liste prospects
POST   /api/prospects                 // Créer prospect
POST   /api/prospects/:id/convert     // Convertir en client

// Litiges
GET    /api/litiges                   // Liste litiges
GET    /api/litiges/:id               // Détail litige
POST   /api/litiges                   // Créer litige
PUT    /api/litiges/:id               // MAJ litige
POST   /api/litiges/:id/resolve       // Résoudre litige
POST   /api/litiges/:id/escalate      // Escalader litige
POST   /api/litiges/:id/actions       // Ajouter action

// Interactions
GET    /api/interactions              // Liste interactions
GET    /api/clients/:id/interactions  // Interactions d'un client
POST   /api/interactions              // Créer interaction

// Contacts
GET    /api/clients/:id/contacts      // Contacts d'un client
POST   /api/contacts                  // Créer contact
PUT    /api/contacts/:id              // MAJ contact

// Contrats
GET    /api/contracts                 // Liste contrats
GET    /api/clients/:id/contracts     // Contrats d'un client
POST   /api/contracts                 // Créer contrat

// Analytics
GET    /api/clients/stats             // Stats globales
GET    /api/clients/analytics         // Données graphiques
GET    /api/clients/export            // Export données
```

### Hook personnalisé (à créer)

```typescript
// lib/hooks/useClientsApi.ts

export function useClientsApi() {
  const getClients = useCallback((filters) => {
    return fetch('/api/clients', {
      method: 'POST',
      body: JSON.stringify(filters)
    });
  }, []);

  const getClientById = useCallback((id) => {
    return fetch(`/api/clients/${id}`);
  }, []);

  // ... autres méthodes
  
  return {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    // Prospects
    getProspects,
    convertProspect,
    // Litiges
    getLitiges,
    resolveLitige,
    // etc...
  };
}
```

---

## 🧪 Tests suggérés

### Tests unitaires

- [ ] Mock data helpers retournent les bonnes données
- [ ] Store Zustand fonctionne correctement
- [ ] Filtres appliquent la bonne logique
- [ ] Calculs de stats sont corrects

### Tests d'intégration

- [ ] Navigation entre onglets
- [ ] Ouverture/fermeture modals
- [ ] Soumission formulaire interaction
- [ ] Export avec différentes configurations
- [ ] Recherche et filtrage

### Tests E2E

- [ ] Flux complet: Voir client → Créer interaction → Fermer
- [ ] Flux prospect → Conversion → Client
- [ ] Flux litige: Créer → Actions → Résoudre
- [ ] Export complet avec toutes options

---

## 🚀 Fonctionnalités avancées à ajouter

### Phase 2 (Suggestions)

1. **Notifications en temps réel**
   - WebSocket pour litiges urgents
   - Alertes satisfaction
   - Rappels actions

2. **IA / Smart features**
   - Prédiction churn
   - Recommandations d'actions
   - Scoring automatique prospects

3. **Collaboration**
   - Commentaires partagés
   - @mentions
   - Notifications équipe

4. **Intégrations**
   - Synchronisation CRM externe (Salesforce, HubSpot)
   - Email (Gmail, Outlook)
   - Calendrier
   - Téléphonie

5. **Mobile**
   - Version responsive améliorée
   - App mobile native

6. **Automatisation**
   - Workflows personnalisés
   - Déclencheurs automatiques
   - Email automation

---

## ✅ Checklist d'implémentation

### Fichiers créés ✅
- [x] clientsMockData.ts - Mock data complet
- [x] ClientDetailModal.tsx - Fiche client (7 onglets)
- [x] InteractionModal.tsx - Nouvelle interaction (6 types)
- [x] LitigeDetailModal.tsx - Gestion litiges (3 onglets)
- [x] ExportModal.tsx - Export avancé (4 étapes)
- [x] modals/index.ts - Export des modals

### Composants existants ✅
- [x] ClientsCommandSidebar - Navigation (9 catégories)
- [x] ClientsSubNavigation - Breadcrumb + sous-onglets
- [x] ClientsKPIBar - 8 KPIs temps réel
- [x] ClientsContentRouter - 9 vues principales
- [x] ClientsAnalyticsCharts - 8 graphiques
- [x] ClientsFiltersPanel - Filtres avancés
- [x] clientsWorkspaceStore - State management

### À intégrer
- [ ] Connecter modals à la page principale
- [ ] Implémenter hooks API
- [ ] Remplacer mock data par vrais appels API
- [ ] Ajouter tests
- [ ] Optimiser performances

---

## 📞 Support & Questions

Pour toute question sur l'architecture ou l'implémentation :
- Consultez le code avec commentaires
- Voir les fichiers d'exemples (BlockedContentRouter, CalendrierPageContent)
- La structure suit les patterns établis dans Governance et Analytics

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2026-01-10  
**Status:** ✅ Architecture complète - Prêt pour intégration API

