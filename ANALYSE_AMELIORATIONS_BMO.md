# Analyse des Améliorations - Portail Maître d'Ouvrage (BMO)

**Date**: 10 janvier 2026  
**Contexte**: Analyse post-harmonisation UI des 30 pages du portail BMO

---

## ✅ État Actuel

### UI/UX - Thème Sombre Unifié
- ✅ **30 pages harmonisées** avec le thème sombre Gouvernance
- ✅ Gradient de fond cohérent: `from-slate-950 via-slate-900 to-slate-950`
- ✅ Headers avec backdrop blur et transparence
- ✅ Palette de couleurs réservée aux icônes et graphiques
- ✅ Composants workspace (tabs, command palette, direction panels)
- ✅ Aucune erreur de lint

---

## 🔍 Analyse des Fonctionnalités Manquantes

### 1. **STORES ZUSTAND MANQUANTS** ⚠️ CRITIQUE

#### Stores Existants
```typescript
✅ validationBCWorkspaceStore.ts
✅ validationContratsWorkspaceStore.ts  
✅ paymentValidationWorkspaceStore.ts
✅ projectWorkspaceStore.ts (projetsWorkspaceStore)
✅ ticketsClientWorkspaceStore.ts
```

#### Stores Manquants (Identifiés dans le code)
```typescript
❌ auditWorkspaceStore.ts
❌ decisionsWorkspaceStore.ts
❌ logsWorkspaceStore.ts
❌ echangesWorkspaceStore.ts
❌ employesWorkspaceStore.ts
❌ parametresWorkspaceStore.ts
❌ clientsWorkspaceStore.ts
❌ financesWorkspaceStore.ts
❌ recouvrementsWorkspaceStore.ts
❌ litigesWorkspaceStore.ts
❌ missionsWorkspaceStore.ts
❌ delegationWorkspaceStore.ts
❌ rhWorkspaceStore.ts (demandes-rh)
❌ alertWorkspaceStore.ts
❌ analyticsWorkspaceStore.ts
❌ paiementsWorkspaceStore.ts (validation-paiements)
❌ contratsWorkspaceStore.ts (validation-contrats)
```

**Impact**: Les pages utilisent ces stores mais ils n'existent pas encore dans `lib/stores/`. Cela causera des erreurs au runtime.

---

### 2. **API SERVICES MANQUANTS** ⚠️ CRITIQUE

#### Services Existants
```typescript
✅ ticketsClientAPI.ts (complet avec types et filtres)
✅ contractsBusinessService.ts
```

#### Services Manquants (Référencés dans les pages)
```typescript
❌ projetsApiService.ts
❌ clientsApiService.ts
❌ financesApiService.ts
❌ recouvrementsApiService.ts
❌ litigesApiService.ts
❌ employesApiService.ts (référencé dans EmployesDirectionPanel)
❌ missionsApiService.ts
❌ decisionsApiService.ts
❌ auditApiService.ts
❌ logsApiService.ts
```

**Impact**: Les pages ne peuvent pas charger de données. Les composants LiveCounters, DirectionPanels et Stats sont non fonctionnels.

---

### 3. **COMPOSANTS WORKSPACE MANQUANTS** 🟡 IMPORTANT

#### Structure Standard d'un Module Workspace
```
workspace/{module}/
  ├── {Module}WorkspaceTabs.tsx       ✅ Tous créés
  ├── {Module}WorkspaceContent.tsx    ✅ Tous créés
  ├── {Module}LiveCounters.tsx        ✅ Tous créés
  ├── {Module}CommandPalette.tsx      ✅ Tous créés
  ├── {Module}StatsModal.tsx          ⚠️ Manquant pour certains
  ├── {Module}DirectionPanel.tsx      ⚠️ Manquant pour certains
  └── index.ts                        ✅ Tous créés
```

#### Composants Manquants Identifiés

**Finances Module**:
```typescript
❌ FinancesStatsModal.tsx (référencé dans finances/page.tsx)
❌ FinancesDirectionPanel.tsx (optionnel, mais cohérence)
```

**Recouvrements Module**:
```typescript
❌ RecouvrementsStatsModal.tsx (référencé dans recouvrements/page.tsx)
❌ RecouvrementsDirectionPanel.tsx (optionnel)
```

**Litiges Module**:
```typescript
❌ LitigesStatsModal.tsx (référencé dans litiges/page.tsx)
❌ LitigesDirectionPanel.tsx (optionnel)
```

**Missions Module**:
```typescript
❌ MissionsStatsModal.tsx (référencé dans missions/page.tsx)
❌ MissionsDirectionPanel.tsx (optionnel)
```

---

### 4. **FONCTIONNALITÉS MÉTIER MANQUANTES** 🔵 AMÉLIORATION

#### A. Gestion des Permissions et Rôles
**Actuellement**: Pas de vérification de permissions visibles dans le code.

**Recommandé**:
```typescript
// lib/hooks/usePermissions.ts
export function usePermissions() {
  const { currentUser } = useBMOStore();
  
  return {
    canValidateBC: currentUser.role === 'chef_service' || currentUser.role === 'direction',
    canManageProjects: ['chef_service', 'direction'].includes(currentUser.role),
    canViewFinances: ['comptable', 'chef_service', 'direction'].includes(currentUser.role),
    canResolveTickets: ['support', 'chef_service'].includes(currentUser.role),
    // ... etc
  };
}
```

**Usage dans les pages**:
```typescript
const { canValidateBC } = usePermissions();

return (
  <button 
    disabled={!canValidateBC}
    onClick={handleValidate}
  >
    Valider BC
  </button>
);
```

---

#### B. Système de Notifications en Temps Réel

**Manque**: WebSocket ou Server-Sent Events pour notifications live.

**Recommandé**:
```typescript
// lib/services/notificationService.ts
class NotificationService {
  private ws: WebSocket | null = null;

  connect(userId: string) {
    this.ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/notifications/${userId}`);
    
    this.ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      // Dispatch to Zustand store
      useBMOStore.getState().addNotification(notification);
    };
  }

  disconnect() {
    this.ws?.close();
  }
}
```

**Types de notifications critiques**:
- 🚨 Nouveau projet bloqué
- ⚡ BC urgent en attente validation
- 📧 Nouvelle réclamation client critique
- 💰 Paiement nécessitant validation immédiate
- ⚖️ Nouveau litige juridique

---

#### C. Export de Données Avancé

**Actuellement**: Handlers `handleExport()` sont des stubs (alertes uniquement).

**Recommandé**:
```typescript
// lib/services/exportService.ts
interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  filters?: Record<string, unknown>;
  columns?: string[];
  dateRange?: { start: string; end: string };
}

class ExportService {
  async exportData(
    module: string, 
    data: unknown[], 
    options: ExportOptions
  ) {
    switch (options.format) {
      case 'excel':
        return this.generateExcel(data, options);
      case 'pdf':
        return this.generatePDF(data, options);
      case 'csv':
        return this.generateCSV(data, options);
    }
  }

  private async generateExcel(data: unknown[], options: ExportOptions) {
    // Utiliser xlsx ou exceljs
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return this.downloadFile(buffer, 'export.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }
}
```

---

#### D. Historique et Audit Trail

**Manque**: Traçabilité détaillée des actions utilisateur.

**Recommandé**: Enrichir `addActionLog` dans `useBMOStore`:
```typescript
interface ActionLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'create' | 'update' | 'delete' | 'validate' | 'reject' | 'export' | 'view';
  module: string;
  targetId: string;
  targetType: string;
  targetLabel: string;
  details: string;
  bureau: string;
  
  // Nouveaux champs recommandés
  ipAddress?: string;
  userAgent?: string;
  previousValue?: unknown; // Pour les updates
  newValue?: unknown;      // Pour les updates
  severity?: 'info' | 'warning' | 'critical';
  tags?: string[];
}

// Envoi au backend pour persistence
async function logAction(log: ActionLog) {
  await fetch('/api/audit-logs', {
    method: 'POST',
    body: JSON.stringify(log),
  });
}
```

---

#### E. Système de Recherche Globale Amélioré

**Actuellement**: CommandPalette basique.

**Recommandé**: Recherche multi-critères avec indexation.

```typescript
// lib/services/searchService.ts
interface SearchResult {
  id: string;
  type: 'projet' | 'client' | 'ticket' | 'bc' | 'contrat' | 'facture';
  title: string;
  subtitle: string;
  icon: string;
  module: string;
  score: number; // Pertinence
  highlights?: string[]; // Texte surligné
  metadata?: Record<string, unknown>;
}

class SearchService {
  async search(query: string, filters?: {
    modules?: string[];
    dateRange?: { start: string; end: string };
    status?: string[];
  }): Promise<SearchResult[]> {
    // Recherche full-text avec scoring
    // Intégration possible avec Algolia, Meilisearch ou Elasticsearch
    
    const response = await fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
    
    return response.json();
  }

  // Suggestions de recherche (autocomplétion)
  async getSuggestions(query: string): Promise<string[]> {
    // Basé sur l'historique de recherche et les termes fréquents
  }
}
```

---

#### F. Dashboard Analytics avec Graphiques

**Manque**: Visualisation des données dans les dashboards.

**Recommandé**: Intégrer une bibliothèque de graphiques.

**Options**:
1. **Recharts** (recommandé pour BMO)
   - Composants React déclaratifs
   - Bon pour charts financiers et KPI
   
2. **Chart.js avec react-chartjs-2**
   - Performant
   - Bon pour time-series

3. **Tremor** (Design system + charts)
   - UI professionnelle pré-construite
   - Idéal pour dashboards business

**Exemple d'implémentation**:
```tsx
// components/features/bmo/charts/TresorerieChart.tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TresorerieChart({ data }: { data: TresorerieData[] }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
      <h3 className="text-lg font-bold text-slate-200 mb-4">Évolution Trésorerie</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTreso" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="mois" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="montant" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorTreso)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

#### G. Gestion des Pièces Jointes et Documents

**Manque**: Upload, stockage et preview de fichiers.

**Recommandé**:
```typescript
// lib/services/documentService.ts
interface Document {
  id: string;
  nom: string;
  type: string; // mime type
  taille: number; // bytes
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  module: string;
  entityId: string; // ID du projet, BC, ticket, etc.
  tags?: string[];
}

class DocumentService {
  async uploadDocument(
    file: File, 
    metadata: { module: string; entityId: string; tags?: string[] }
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  }

  async getDocuments(module: string, entityId: string): Promise<Document[]> {
    // Récupérer tous les documents d'une entité
  }

  async deleteDocument(documentId: string): Promise<void> {
    // Suppression (soft delete recommandé pour audit)
  }

  async downloadDocument(documentId: string): Promise<Blob> {
    // Téléchargement sécurisé avec token
  }

  // Preview pour images et PDFs
  getPreviewUrl(documentId: string): string {
    return `/api/documents/${documentId}/preview`;
  }
}
```

**Composant UI**:
```tsx
// components/features/bmo/DocumentUploader.tsx
export function DocumentUploader({ 
  module, 
  entityId,
  onUploadComplete 
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  const handleDrop = async (files: File[]) => {
    setUploading(true);
    for (const file of files) {
      const doc = await documentService.uploadDocument(file, { module, entityId });
      setDocuments(prev => [...prev, doc]);
    }
    setUploading(false);
    onUploadComplete?.();
  };

  return (
    <div className="p-6 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30">
      {/* Drag & drop zone */}
      {/* Liste des documents uploadés */}
    </div>
  );
}
```

---

#### H. Système de Validation Multi-Niveaux

**Manque**: Workflow de validation avec étapes configurables.

**Recommandé**:
```typescript
// lib/services/validationWorkflowService.ts
interface ValidationStep {
  id: string;
  ordre: number;
  titre: string;
  validateur: 'chef_service' | 'comptable' | 'direction' | 'juridique';
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  dateValidation?: string;
  validePar?: string;
  commentaire?: string;
  obligatoire: boolean;
}

interface ValidationWorkflow {
  id: string;
  type: 'bc' | 'contrat' | 'paiement' | 'delegation';
  entityId: string;
  steps: ValidationStep[];
  currentStepIndex: number;
  status: 'en_cours' | 'valide' | 'rejete';
  createdAt: string;
  completedAt?: string;
}

class ValidationWorkflowService {
  async getWorkflow(entityId: string): Promise<ValidationWorkflow> {
    // Récupérer le workflow de validation
  }

  async validateStep(
    workflowId: string, 
    stepId: string, 
    decision: 'approve' | 'reject',
    commentaire?: string
  ): Promise<ValidationWorkflow> {
    // Valider une étape et passer à la suivante
  }

  async getMyPendingValidations(userId: string): Promise<ValidationWorkflow[]> {
    // Tous les workflows en attente de validation par cet utilisateur
  }
}
```

---

#### I. Alertes Intelligentes et Prédictives

**Manque**: Système d'alertes proactif basé sur des règles métier.

**Recommandé**:
```typescript
// lib/services/alertingService.ts
interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  module: string;
  titre: string;
  description: string;
  entityId?: string;
  entityType?: string;
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  tags?: string[];
}

// Règles d'alertes (configurables)
const alertRules = [
  {
    id: 'sla_ticket_depassement',
    condition: (ticket: Ticket) => ticket.slaDepassement,
    severity: 'critical',
    titre: 'SLA dépassé',
    description: (ticket: Ticket) => `Le ticket ${ticket.numero} a dépassé son SLA de ${ticket.slaEcoule - ticket.slaDelai}h`,
    module: 'tickets',
  },
  {
    id: 'tresorerie_faible',
    condition: (stats: FinancesStats) => stats.tresorerie < 1000000, // < 1M FCFA
    severity: 'high',
    titre: 'Trésorerie faible',
    description: (stats: FinancesStats) => `Trésorerie à ${stats.tresorerie} FCFA`,
    module: 'finances',
  },
  {
    id: 'projet_bloque_longue_duree',
    condition: (projet: Projet) => {
      const daysSinceBlock = differenceInDays(new Date(), new Date(projet.dateBlock));
      return projet.status === 'bloque' && daysSinceBlock > 7;
    },
    severity: 'critical',
    titre: 'Projet bloqué depuis 7+ jours',
    description: (projet: Projet) => `${projet.titre} est bloqué depuis ${differenceInDays(new Date(), new Date(projet.dateBlock))} jours`,
    module: 'projets',
  },
  // ... plus de règles
];

class AlertingService {
  async checkAlerts(): Promise<Alert[]> {
    // Vérifier toutes les règles et générer les alertes
  }

  async getActiveAlerts(userId?: string): Promise<Alert[]> {
    // Alertes actives, optionnellement filtrées par utilisateur
  }

  async resolveAlert(alertId: string, userId: string): Promise<void> {
    // Marquer une alerte comme résolue
  }
}
```

**Usage dans Dashboard**:
```tsx
function AlertsWidget() {
  const { data: alerts } = useQuery('alerts', () => alertingService.getActiveAlerts());
  
  const criticalAlerts = alerts?.filter(a => a.severity === 'critical') || [];

  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-200">Alertes Critiques</h3>
        {criticalAlerts.length > 0 && (
          <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
            {criticalAlerts.length}
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {criticalAlerts.map(alert => (
          <div key={alert.id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-red-400">{alert.titre}</p>
                <p className="text-sm text-slate-400">{alert.description}</p>
              </div>
              {alert.actionRequired && (
                <button className="text-xs px-2 py-1 rounded bg-red-500 text-white">
                  Agir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

#### J. Système de Commentaires et Collaboration

**Manque**: Fil de discussion sur les entités (projets, BCs, tickets, etc.).

**Recommandé**:
```typescript
// lib/services/commentsService.ts
interface Comment {
  id: string;
  entityType: string;
  entityId: string;
  auteurId: string;
  auteurNom: string;
  auteurAvatar?: string;
  contenu: string;
  mentions?: string[]; // @userId pour notifier
  piecesJointes?: Document[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  parentId?: string; // Pour les réponses
}

class CommentsService {
  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    // Récupérer tous les commentaires d'une entité
  }

  async addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    // Ajouter un commentaire
    // Si mentions, envoyer notifications
  }

  async editComment(commentId: string, newContenu: string): Promise<Comment> {
    // Éditer (garder historique)
  }

  async deleteComment(commentId: string): Promise<void> {
    // Soft delete
  }
}
```

---

## 📋 Plan d'Action Recommandé

### Phase 1: Stabilisation (Critique - 2-3 jours)
```
1. ✅ Créer tous les stores Zustand manquants (17 stores)
   - Template standard avec tabs, UI state, command palette
   - Persistence optionnelle pour préférences utilisateur

2. ✅ Créer les API services de base (10 services)
   - Structure type avec getStats(), getList(), getById()
   - Mock data pour développement front-end
   - Types TypeScript complets

3. ✅ Créer composants workspace manquants
   - StatsModal pour finances, recouvrements, litiges, missions
   - DirectionPanel optionnels (cohérence UI)
```

### Phase 2: Fonctionnalités Métier (Important - 1 semaine)
```
4. ✅ Système de permissions et rôles
   - Hook usePermissions()
   - Guards sur composants et routes

5. ✅ Export de données (Excel, PDF, CSV)
   - Service d'export générique
   - UI de sélection format et colonnes

6. ✅ Historique et audit trail enrichi
   - Persistence backend
   - UI de consultation dans page Audit

7. ✅ Upload et gestion de documents
   - Service de stockage (S3, Azure Blob, ou local)
   - Composant drag & drop
   - Preview pour images/PDFs
```

### Phase 3: Expérience Utilisateur (Amélioration - 1 semaine)
```
8. ✅ Notifications temps réel (WebSocket/SSE)
   - Service de connexion
   - NotificationCenter UI
   - Badge de compteur

9. ✅ Recherche globale améliorée
   - Indexation full-text
   - Scoring de pertinence
   - Filtres avancés

10. ✅ Dashboard analytics avec graphiques
    - Intégration Recharts
    - Charts réutilisables
    - Export graphiques en image
```

### Phase 4: Intelligence et Automatisation (Avancé - 2 semaines)
```
11. ✅ Workflow de validation multi-niveaux
    - Configuration dynamique
    - État persisté
    - Notifications aux validateurs

12. ✅ Alertes intelligentes
    - Règles configurables
    - Vérification périodique (cron job)
    - Actions rapides

13. ✅ Système de commentaires
    - Mentions d'utilisateurs
    - Notifications
    - Fil de discussion hiérarchique

14. ✅ Prédictions et suggestions IA (optionnel)
    - Délais de projet
    - Risques de contentieux
    - Recommandations budgétaires
```

---

## 💡 Recommandations Techniques

### Architecture Backend (API)

**Option 1: REST API classique**
```
/api/bmo/projets
  GET    /                 -> Liste projets
  GET    /:id              -> Détails projet
  POST   /                 -> Créer projet
  PUT    /:id              -> Modifier projet
  DELETE /:id              -> Supprimer projet
  GET    /stats            -> Statistiques
  GET    /:id/documents    -> Documents du projet
  POST   /:id/comments     -> Ajouter commentaire
```

**Option 2: GraphQL (recommandé pour apps complexes)**
```graphql
query GetProjet($id: ID!) {
  projet(id: $id) {
    id
    titre
    status
    budget
    documents {
      id
      nom
      url
    }
    comments {
      id
      contenu
      auteur {
        id
        nom
      }
    }
    workflow {
      steps {
        titre
        status
      }
    }
  }
}
```

### Base de Données

**Tables principales recommandées**:
```sql
-- Projets
CREATE TABLE projets (
  id UUID PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  budget DECIMAL(15,2),
  date_debut DATE,
  date_fin_prevue DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Documents (générique pour tous modules)
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  taille BIGINT NOT NULL,
  url TEXT NOT NULL,
  module VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Commentaires (générique)
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  auteur_id UUID NOT NULL REFERENCES users(id),
  contenu TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workflows de validation
CREATE TABLE validation_workflows (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  current_step_index INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE validation_steps (
  id UUID PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES validation_workflows(id),
  ordre INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  validateur_role VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  valide_par UUID REFERENCES users(id),
  date_validation TIMESTAMP,
  commentaire TEXT,
  obligatoire BOOLEAN DEFAULT true
);

-- Alertes
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  entity_id UUID,
  entity_type VARCHAR(50),
  action_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id)
);
```

### Sécurité et Performance

**1. Authentication & Authorization**:
```typescript
// middleware/auth.ts
export async function requireAuth(req: NextRequest) {
  const token = req.cookies.get('auth_token');
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const user = await verifyToken(token);
  if (!user) {
    return new Response('Invalid token', { status: 401 });
  }
  
  return user;
}

export function requireRole(allowedRoles: string[]) {
  return async (req: NextRequest) => {
    const user = await requireAuth(req);
    if (!allowedRoles.includes(user.role)) {
      return new Response('Forbidden', { status: 403 });
    }
    return user;
  };
}
```

**2. Rate Limiting**:
```typescript
// middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function rateLimit(req: NextRequest) {
  const identifier = req.ip ?? 'anonymous';
  const { success } = await ratelimit.limit(identifier);
  
  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }
}
```

**3. Caching Strategy**:
```typescript
// lib/cache/cacheService.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCached<T>(
  key: string, 
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes
): Promise<T> {
  const cached = await redis.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  
  return data;
}

// Usage
const stats = await getCached(
  'projets:stats',
  () => projetsApiService.getStats(),
  600 // 10 minutes
);
```

**4. Pagination & Lazy Loading**:
```typescript
// lib/hooks/useInfiniteScroll.ts
export function useInfiniteScroll<T>(
  fetchFn: (page: number) => Promise<{ items: T[]; hasMore: boolean }>
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const { items: newItems, hasMore: more } = await fetchFn(page);
    setItems(prev => [...prev, ...newItems]);
    setHasMore(more);
    setPage(p => p + 1);
    setLoading(false);
  };

  return { items, loadMore, hasMore, loading };
}
```

---

## 📊 Métriques de Succès

### KPIs Techniques
- ✅ 0 erreurs TypeScript
- ✅ 0 erreurs de lint
- ⏱️ Temps de chargement initial < 2s
- ⏱️ Temps de réponse API < 500ms (P95)
- 📈 Lighthouse Score > 90
- 🔒 Aucune vulnérabilité critique (npm audit)

### KPIs Métier
- 📊 Taux d'adoption > 80% des utilisateurs
- ⚡ Réduction de 50% du temps de validation des BCs
- 📉 Réduction de 40% des projets bloqués
- 🎯 Satisfaction utilisateur > 4/5
- 📱 Utilisation mobile > 30%

---

## 🚀 Technologies Recommandées

### Front-end
- ✅ **Next.js 14+** (App Router)
- ✅ **TypeScript** (strict mode)
- ✅ **Tailwind CSS** (design system)
- ✅ **Zustand** (state management)
- 📊 **Recharts** (visualisation)
- 🔍 **React Query** (data fetching)
- 📝 **React Hook Form** (formulaires)
- ✅ **Lucide React** (icônes)

### Back-end
- **Node.js + Express** ou **Next.js API Routes**
- **PostgreSQL** (base principale)
- **Redis** (cache et sessions)
- **S3/Azure Blob** (stockage fichiers)
- **Socket.io** ou **Pusher** (WebSocket)

### DevOps
- **Docker** (containerisation)
- **GitHub Actions** (CI/CD)
- **Vercel** ou **AWS** (hosting)
- **Sentry** (error tracking)
- **Datadog** ou **New Relic** (monitoring)

---

## 📝 Conclusion

L'harmonisation UI est terminée avec succès. Les prochaines étapes critiques sont:

1. **Créer les 17 stores Zustand manquants** → Sans eux, les pages crashent au runtime
2. **Créer les 10 API services** → Sans eux, pas de données
3. **Enrichir les fonctionnalités métier** → Permissions, exports, notifications

Le code actuel est une **excellente base architecturale**. La structure workspace est cohérente et scalable. L'ajout des stores et services permettra de rendre l'application pleinement fonctionnelle.

---

**Auteur**: Assistant IA  
**Date**: 2026-01-10  
**Version**: 1.0

