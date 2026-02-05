# 🔍 Analyse - Fonctionnalités manquantes & API

## ❌ Fonctionnalités manquantes identifiées

### 1. **Composants de contenu détaillés**

#### ✅ Existants (Placeholders)
- `SubstitutionWorkspaceContent` - Liste basique avec expansion
- `SubstitutionLiveCounters` - Compteurs en temps réel
- `SubstitutionCommandPalette` - Palette de commandes
- `SubstitutionStatsModal` - Modal statistiques
- `SubstitutionDirectionPanel` - Panneau de pilotage

#### ❌ Manquants / À développer

**A. Onglet "Détail"** (actuellement placeholder)
```typescript
// Devrait inclure:
- Informations complètes de la substitution
- Timeline des événements
- Documents attachés
- Historique des actions
- Commentaires/Notes
- Actions disponibles (Assigner, Terminer, Escalader)
```

**B. Onglet "Absences"** (actuellement placeholder)
```typescript
// Devrait inclure:
- Calendrier visuel des absences
- Liste des absences planifiées
- Détails par employé
- Conflits d'absences
- Import/Export calendrier
```

**C. Onglet "Délégations"** (actuellement placeholder)
```typescript
// Devrait inclure:
- Liste des délégations actives
- Délégations temporaires vs permanentes
- Règles de délégation
- Historique des délégations
- Gestion des droits délégués
```

**D. Onglet "Historique"** (actuellement placeholder)
```typescript
// Devrait inclure:
- Timeline complète
- Filtres avancés (date, type, utilisateur)
- Export des données
- Recherche dans l'historique
```

**E. Onglet "Analytics"** (actuellement placeholder)
```typescript
// Devrait inclure:
- Dashboard avec graphiques
- KPIs détaillés
- Tendances temporelles
- Comparaisons entre bureaux
- Rapports générés
```

---

### 2. **Modales et Pop-ups manquants**

#### ❌ À créer

**A. Modal de création de substitution**
```typescript
interface CreateSubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubstitutionCreateData) => Promise<void>;
}

// Champs:
- Titulaire (sélection)
- Raison (absence, blocage, technique, documents)
- Urgence (critical, high, medium, low)
- Date début / Date fin
- Description
- Bureau
- Projets liés (multi-select)
- Documents (upload)
```

**B. Modal d'assignation de substitut**
```typescript
interface AssignSubstitutModalProps {
  substitutionId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Fonctionnalités:
- Liste des substituts disponibles
- Score de compatibilité
- Disponibilité en temps réel
- Charge de travail actuelle
- Compétences requises
- Historique des substitutions
- Affectation automatique (IA)
```

**C. Modal d'escalade**
```typescript
interface EscalateSubstitutionModalProps {
  substitutionId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Champs:
- Niveau d'escalade (Direction, DG, Externe)
- Raison de l'escalade
- Délai d'action
- Notifications
- Documents justificatifs
```

**D. Modal de commentaires**
```typescript
interface CommentsModalProps {
  substitutionId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Fonctionnalités:
- Thread de commentaires
- Mentions (@user)
- Pièces jointes
- Résolution de fils
- Notifications
```

**E. Modal d'export**
```typescript
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Options:
- Format (PDF, Excel, CSV)
- Période
- Catégories sélectionnées
- Champs à exporter
- Prévisualisation
```

---

### 3. **Sous-catégories et filtres détaillés**

#### Catégories principales vs sous-catégories actuelles

```typescript
const subCategoriesMap = {
  overview: [
    'all', 'summary', 'today'
  ],
  critical: [
    'all', 'urgent', 'high'
  ],
  pending: [
    'all', 'no-substitute', 'validation'
  ],
  absences: [
    'current', 'upcoming', 'planned'
  ],
  delegations: [
    'active', 'temporary', 'permanent'
  ],
  completed: [
    'recent', 'week', 'month'
  ],
  historique: [
    'all', 'by-employee', 'by-bureau'
  ],
  analytics: [
    'dashboard', 'statistics', 'trends'
  ],
  settings: [
    'general', 'rules', 'notifications'
  ],
};
```

#### ❌ Filtres de niveau 3 manquants

Pour chaque sous-catégorie, ajouter des filtres :

**Exemple: Critiques > Urgentes**
```typescript
filters: [
  { id: 'all', label: 'Tous' },
  { id: 'today', label: "Aujourd'hui", badge: 1 },
  { id: 'this-week', label: 'Cette semaine', badge: 2 },
  { id: 'overdue', label: 'En retard', badge: 3, badgeType: 'critical' },
]
```

**Exemple: Absences > En cours**
```typescript
filters: [
  { id: 'all', label: 'Tous' },
  { id: 'maladie', label: 'Maladie', badge: 3 },
  { id: 'conge', label: 'Congés', badge: 4 },
  { id: 'formation', label: 'Formation', badge: 1 },
]
```

---

### 4. **Panneau de pilotage (Direction Panel)**

#### ✅ Existe mais à enrichir

Contenu actuel : Placeholder

#### ❌ À ajouter :

```typescript
// Sections du panneau:

1. Vue d'ensemble
   - Métriques clés
   - Alertes actives
   - Actions requises

2. Équipe
   - Disponibilité en temps réel
   - Charge de travail
   - Performance

3. Tendances
   - Graphiques hebdomadaires
   - Comparaisons
   - Prévisions

4. Actions rapides
   - Assigner en masse
   - Escalader multiples
   - Notifications groupées

5. Règles & Automatisations
   - Règles actives
   - Créer nouvelle règle
   - Historique des automatisations
```

---

### 5. **Palette de commandes**

#### ✅ Existe mais à enrichir

Commandes actuelles : Basiques

#### ❌ Commandes à ajouter :

```typescript
const commands = [
  // Navigation
  { id: 'nav-overview', label: 'Aller à Vue d\'ensemble', shortcut: 'G O' },
  { id: 'nav-critical', label: 'Aller à Critiques', shortcut: 'G C' },
  { id: 'nav-pending', label: 'Aller à En Attente', shortcut: 'G P' },
  
  // Actions
  { id: 'create', label: 'Créer une substitution', shortcut: 'C' },
  { id: 'assign', label: 'Assigner un substitut', shortcut: 'A' },
  { id: 'escalate', label: 'Escalader', shortcut: 'E' },
  { id: 'export', label: 'Exporter les données', shortcut: '⌘E' },
  
  // Filtres
  { id: 'filter-urgent', label: 'Filtrer: Urgentes', shortcut: 'F U' },
  { id: 'filter-today', label: 'Filtrer: Aujourd\'hui', shortcut: 'F T' },
  
  // Vues
  { id: 'view-calendar', label: 'Vue Calendrier', shortcut: 'V C' },
  { id: 'view-timeline', label: 'Vue Timeline', shortcut: 'V T' },
  
  // Recherche
  { id: 'search-employee', label: 'Rechercher un employé', shortcut: '/' },
  { id: 'search-ref', label: 'Rechercher par référence', shortcut: '#' },
];
```

---

## 🔌 API manquantes

### Services à créer

#### 1. **substitutionApiService** (partiellement existant)

```typescript
// Fonctions existantes ✅
- getAll(filter, sort, page, pageSize)
- getStatusLabel(status)
- getReasonLabel(reason)
- formatMontant(amount)

// Fonctions manquantes ❌
- getById(id) // Détail d'une substitution
- create(data) // Créer une substitution
- update(id, data) // Mettre à jour
- delete(id) // Supprimer
- assign(id, substitutId) // Assigner un substitut
- escalate(id, data) // Escalader
- complete(id) // Marquer comme terminée
- addComment(id, comment) // Ajouter un commentaire
- getComments(id) // Récupérer les commentaires
- getTimeline(id) // Récupérer la timeline
- uploadDocument(id, file) // Upload document
- getDocuments(id) // Récupérer les documents
- exportData(filter, format) // Exporter
```

#### 2. **absencesApiService** (à créer)

```typescript
interface AbsencesApiService {
  // CRUD
  getAll(filter?, sort?, page?, pageSize?): Promise<PaginatedResponse<Absence>>;
  getById(id: string): Promise<Absence>;
  create(data: AbsenceCreateData): Promise<Absence>;
  update(id: string, data: AbsenceUpdateData): Promise<Absence>;
  delete(id: string): Promise<void>;
  
  // Calendrier
  getCalendar(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  getConflicts(employeeId: string, startDate: Date, endDate: Date): Promise<Conflict[]>;
  
  // Stats
  getStats(filter?: AbsenceFilter): Promise<AbsenceStats>;
  getTrends(period: string): Promise<TrendData[]>;
}
```

#### 3. **delegationsApiService** (à créer)

```typescript
interface DelegationsApiService {
  // CRUD
  getAll(filter?, sort?, page?, pageSize?): Promise<PaginatedResponse<Delegation>>;
  getById(id: string): Promise<Delegation>;
  create(data: DelegationCreateData): Promise<Delegation>;
  update(id: string, data: DelegationUpdateData): Promise<Delegation>;
  delete(id: string): Promise<void>;
  revoke(id: string): Promise<void>;
  
  // Règles
  getRules(): Promise<DelegationRule[]>;
  createRule(rule: DelegationRule): Promise<DelegationRule>;
  updateRule(id: string, rule: DelegationRule): Promise<DelegationRule>;
  deleteRule(id: string): Promise<void>;
  
  // Vérifications
  canDelegate(fromUserId: string, toUserId: string, permissions: string[]): Promise<boolean>;
  getAvailableDelegates(userId: string): Promise<User[]>;
}
```

#### 4. **employeesApiService** (à créer)

```typescript
interface EmployeesApiService {
  // Recherche
  searchEmployees(query: string): Promise<Employee[]>;
  getById(id: string): Promise<Employee>;
  getByBureau(bureau: string): Promise<Employee[]>;
  
  // Disponibilité
  getAvailability(employeeId: string, date?: Date): Promise<AvailabilityStatus>;
  getWorkload(employeeId: string): Promise<WorkloadData>;
  
  // Substituts
  findSubstitutes(criteria: SubstituteCriteria): Promise<SubstituteCandidate[]>;
  getSubstituteScore(employeeId: string, substitutionId: string): Promise<number>;
}
```

#### 5. **documentsApiService** (à créer)

```typescript
interface DocumentsApiService {
  // Upload
  upload(file: File, metadata: DocumentMetadata): Promise<Document>;
  uploadMultiple(files: File[], metadata: DocumentMetadata): Promise<Document[]>;
  
  // Download
  download(documentId: string): Promise<Blob>;
  getPreviewUrl(documentId: string): Promise<string>;
  
  // Gestion
  delete(documentId: string): Promise<void>;
  getByEntity(entityType: string, entityId: string): Promise<Document[]>;
  updateMetadata(documentId: string, metadata: Partial<DocumentMetadata>): Promise<Document>;
}
```

#### 6. **notificationsApiService** (partiellement existant)

```typescript
// À ajouter:
- markAsRead(notificationId)
- markAllAsRead()
- deleteNotification(notificationId)
- getPreferences()
- updatePreferences(preferences)
- subscribe(userId, topic)
- unsubscribe(userId, topic)
```

#### 7. **analyticsApiService** (à créer)

```typescript
interface AnalyticsApiService {
  // Dashboard
  getDashboardData(period: string): Promise<DashboardData>;
  getKPIs(filter?: AnalyticsFilter): Promise<KPIData[]>;
  
  // Trends
  getTrends(metric: string, period: string): Promise<TrendData[]>;
  getComparison(metric: string, compareWith: string): Promise<ComparisonData>;
  
  // Rapports
  generateReport(type: string, filter?: ReportFilter): Promise<Report>;
  scheduleReport(config: ReportConfig): Promise<ScheduledReport>;
  getReports(): Promise<Report[]>;
}
```

---

## 📊 Structure des données manquantes

### Types à définir

```typescript
// Absence
interface Absence {
  id: string;
  employeeId: string;
  employee: Employee;
  type: 'maladie' | 'conge' | 'formation' | 'autre';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  documents?: Document[];
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Delegation
interface Delegation {
  id: string;
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  type: 'temporary' | 'permanent';
  permissions: string[];
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'revoked';
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

// Comment
interface Comment {
  id: string;
  entityType: 'substitution' | 'absence' | 'delegation';
  entityId: string;
  userId: string;
  user: User;
  content: string;
  mentions: string[];
  attachments?: Document[];
  parentId?: string; // Pour les réponses
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// TimelineEvent
interface TimelineEvent {
  id: string;
  entityType: string;
  entityId: string;
  type: 'created' | 'updated' | 'assigned' | 'escalated' | 'completed' | 'commented';
  userId: string;
  user: User;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Document
interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  entityType: string;
  entityId: string;
  uploadedBy: string;
  uploadedAt: Date;
}
```

---

## 🎯 Recommandations

### Priorité 1 (Urgent)
1. ✅ **Compléter substitutionApiService** avec toutes les méthodes
2. ✅ **Créer les modales essentielles** (Création, Assignation)
3. ✅ **Développer l'onglet Détail** (le plus utilisé)
4. ✅ **Ajouter les filtres niveau 3** (améliore la navigation)

### Priorité 2 (Important)
5. ✅ **Créer absencesApiService** et son onglet
6. ✅ **Créer delegationsApiService** et son onglet
7. ✅ **Développer le panneau de pilotage**
8. ✅ **Enrichir la palette de commandes**

### Priorité 3 (Souhaitable)
9. ✅ **Créer analyticsApiService** et son onglet
10. ✅ **Ajouter documentsApiService**
11. ✅ **Développer l'onglet Historique**
12. ✅ **Créer les modales secondaires** (Export, Commentaires, Escalade)

---

## 📁 Fichiers de mock data à créer

```
src/lib/data/
├── substitution-mock-data.ts     ✅ (existe partiellement)
├── absences-mock-data.ts         ❌ (à créer)
├── delegations-mock-data.ts      ❌ (à créer)
├── employees-mock-data.ts        ❌ (à créer)
├── comments-mock-data.ts         ❌ (à créer)
├── timeline-mock-data.ts         ❌ (à créer)
├── documents-mock-data.ts        ❌ (à créer)
├── analytics-mock-data.ts        ❌ (à créer)
└── notifications-mock-data.ts    ✅ (existe)
```

---

**Prochaine étape : Créer tous les fichiers de mock data et les services API complets ! 🚀**

