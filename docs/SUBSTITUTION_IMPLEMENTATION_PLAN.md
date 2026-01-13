# 🚀 Plan d'implémentation - Mock Data & Services Complets

## ✅ Ce qui est déjà créé

### Types
- ✅ `src/lib/types/substitution.types.ts` (tous les types nécessaires)

### Mock Data
- ✅ `src/lib/data/employees-mock-data.ts` (12 employés réalistes)
- ⏳ `src/lib/services/substitutionApiService.ts` (partiellement existant)

---

## 📦 Fichiers à créer (par priorité)

### Priorité 1 - Fonctionnalités essentielles

#### 1. Mock Data - Absences
**Fichier**: `src/lib/data/absences-mock-data.ts`
```typescript
- 20 absences réalistes
- Types: maladie, congé, formation, autre
- Statuts: pending, approved, rejected
- Liées aux employés existants
- Conflits simulés
```

#### 2. Mock Data - Délégations
**Fichier**: `src/lib/data/delegations-mock-data.ts`
```typescript
- 15 délégations réalistes
- Temporaires et permanentes
- Permissions variées
- Règles de délégation (5 règles)
- Liées aux employés existants
```

#### 3. Mock Data - Commentaires
**Fichier**: `src/lib/data/comments-mock-data.ts`
```typescript
- 30 commentaires
- Sur substitutions, absences, délégations
- Avec mentions
- Threads de réponses
- Pièces jointes
```

#### 4. Mock Data - Timeline
**Fichier**: `src/lib/data/timeline-mock-data.ts`
```typescript
- 50 événements
- Tous les types d'actions
- Métadonnées riches
- Tri chronologique
```

#### 5. Mock Data - Documents
**Fichier**: `src/lib/data/documents-mock-data.ts`
```typescript
- 25 documents
- PDF, Word, Excel
- Thumbnails simulés
- Métadonnées complètes
```

### Priorité 2 - Services API

#### 6. Service complet - Substitutions
**Fichier**: `src/lib/services/substitutionApiService.ts` (compléter)
```typescript
Ajouter:
- getById(id)
- create(data)
- update(id, data)
- delete(id)
- assign(id, substitutId)
- escalate(id, data)
- complete(id)
- addComment(id, comment)
- getComments(id)
- getTimeline(id)
- uploadDocument(id, file)
- getDocuments(id)
- exportData(filter, format)
- getStats(filter)
```

#### 7. Service - Absences
**Fichier**: `src/lib/services/absencesApiService.ts`
```typescript
- CRUD complet
- Calendrier
- Conflits
- Stats
- Approbation/Rejet
```

#### 8. Service - Délégations
**Fichier**: `src/lib/services/delegationsApiService.ts`
```typescript
- CRUD complet
- Règles
- Vérifications
- Révocation
- Permissions
```

#### 9. Service - Employés
**Fichier**: `src/lib/services/employeesApiService.ts`
```typescript
- Recherche
- Disponibilité
- Charge de travail
- Meilleurs substituts
- Score de compatibilité
```

#### 10. Service - Documents
**Fichier**: `src/lib/services/documentsApiService.ts`
```typescript
- Upload/Download
- Prévisualisation
- Gestion
- Métadonnées
```

### Priorité 3 - Composants UI

#### 11. Modal - Création de substitution
**Fichier**: `src/components/features/bmo/substitution/modals/CreateSubstitutionModal.tsx`
```typescript
- Formulaire complet
- Validation
- Upload documents
- Recherche employé
- Prévisualisation
```

#### 12. Modal - Assignation de substitut
**Fichier**: `src/components/features/bmo/substitution/modals/AssignSubstitutModal.tsx`
```typescript
- Liste des candidats
- Scores et disponibilité
- Comparaison
- Affectation automatique
- Notifications
```

#### 13. Modal - Escalade
**Fichier**: `src/components/features/bmo/substitution/modals/EscalateModal.tsx`
```typescript
- Niveaux d'escalade
- Justification
- Documents
- Deadlines
```

#### 14. Modal - Commentaires
**Fichier**: `src/components/features/bmo/substitution/modals/CommentsModal.tsx`
```typescript
- Thread de commentaires
- Mentions @
- Pièces jointes
- Résolution
```

#### 15. Modal - Export
**Fichier**: `src/components/features/bmo/substitution/modals/ExportModal.tsx`
```typescript
- Format (PDF, Excel, CSV)
- Période
- Champs à exporter
- Prévisualisation
```

### Priorité 4 - Onglets détaillés

#### 16. Onglet - Détail Substitution
**Fichier**: `src/components/features/bmo/substitution/tabs/SubstitutionDetailTab.tsx`
```typescript
- Informations complètes
- Timeline
- Documents
- Commentaires
- Actions
```

#### 17. Onglet - Absences
**Fichier**: `src/components/features/bmo/substitution/tabs/AbsencesTab.tsx`
```typescript
- Calendrier visuel
- Liste filtrable
- Conflits
- Actions rapides
```

#### 18. Onglet - Délégations
**Fichier**: `src/components/features/bmo/substitution/tabs/DelegationsTab.tsx`
```typescript
- Liste des délégations
- Règles actives
- Gestion des permissions
- Révocation
```

#### 19. Onglet - Historique
**Fichier**: `src/components/features/bmo/substitution/tabs/HistoriqueTab.tsx`
```typescript
- Timeline complète
- Filtres avancés
- Recherche
- Export
```

#### 20. Onglet - Analytics
**Fichier**: `src/components/features/bmo/substitution/tabs/AnalyticsTab.tsx`
```typescript
- Dashboard
- KPIs détaillés
- Graphiques
- Rapports
```

---

## 📋 Contenu détaillé des fichiers

### Fichiers Mock Data (exemples)

#### absences-mock-data.ts
```typescript
export const mockAbsences: Absence[] = [
  {
    id: 'ABS-001',
    employeeId: 'EMP-004', // Aminata Touré
    employee: mockEmployees[3],
    type: 'maladie',
    startDate: new Date('2026-01-08'),
    endDate: new Date('2026-01-15'),
    status: 'approved',
    reason: 'Grippe saisonnière',
    description: 'Certificat médical fourni - 7 jours de repos',
    documents: [
      { id: 'DOC-001', name: 'certificat_medical.pdf', ... }
    ],
    approvedBy: 'EMP-001',
    approvedAt: new Date('2026-01-07'),
    substitutionId: 'SUB-012',
    createdAt: new Date('2026-01-07'),
    updatedAt: new Date('2026-01-07'),
  },
  // ... 19 autres absences
];
```

#### delegations-mock-data.ts
```typescript
export const mockDelegations: Delegation[] = [
  {
    id: 'DEL-001',
    fromUserId: 'EMP-007', // Ibrahim Sanogo
    fromUser: mockEmployees[6],
    toUserId: 'EMP-001', // Jean Kouassi
    toUser: mockEmployees[0],
    type: 'temporary',
    permissions: [
      'validate_documents',
      'approve_expenses',
      'sign_contracts'
    ],
    startDate: new Date('2026-01-10'),
    endDate: new Date('2026-01-17'),
    status: 'active',
    reason: 'Formation à l\'étranger',
    createdAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-01-08'),
  },
  // ... 14 autres délégations
];

export const mockDelegationRules: DelegationRule[] = [
  {
    id: 'RULE-001',
    name: 'Chef de Projet → Chef de Projet',
    description: 'Délégation automatique entre chefs de projet du même bureau',
    fromRole: 'Chef de Projet',
    toRole: 'Chef de Projet',
    permissions: ['validate_documents', 'approve_expenses'],
    conditions: { sameBureau: true, maxDuration: 30 },
    autoApprove: true,
    active: true,
    createdAt: new Date('2025-12-01'),
  },
  // ... 4 autres règles
];
```

#### comments-mock-data.ts
```typescript
export const mockComments: Comment[] = [
  {
    id: 'COM-001',
    entityType: 'substitution',
    entityId: 'SUB-001',
    userId: 'EMP-001',
    user: mockEmployees[0],
    content: '@EMP-003 Peux-tu prendre en charge ce dossier urgent ? Le client attend une réponse aujourd\'hui.',
    mentions: ['EMP-003'],
    attachments: [],
    createdAt: new Date('2026-01-10T09:30:00'),
    updatedAt: new Date('2026-01-10T09:30:00'),
  },
  {
    id: 'COM-002',
    entityType: 'substitution',
    entityId: 'SUB-001',
    userId: 'EMP-003',
    user: mockEmployees[2],
    content: 'OK @EMP-001, je m\'en occupe immédiatement. J\'aurai besoin du dossier complet.',
    mentions: ['EMP-001'],
    parentId: 'COM-001',
    createdAt: new Date('2026-01-10T10:15:00'),
    updatedAt: new Date('2026-01-10T10:15:00'),
  },
  // ... 28 autres commentaires
];
```

---

## 🔧 Implémentation des Services

### Exemple: absencesApiService.ts

```typescript
class AbsencesApiService {
  private baseUrl = '/api/bmo/absences';

  async getAll(
    filter?: AbsenceFilter,
    sort?: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Absence>> {
    await this.delay(300);
    
    const { mockAbsences } = await import('@/lib/data/absences-mock-data');
    let data = [...mockAbsences];

    // Filtres
    if (filter) {
      if (filter.type) data = data.filter(a => a.type === filter.type);
      if (filter.status) data = data.filter(a => a.status === filter.status);
      if (filter.bureau) data = data.filter(a => a.employee.bureau === filter.bureau);
      // ... autres filtres
    }

    // Pagination
    const start = (page - 1) * pageSize;
    const paginatedData = data.slice(start, start + pageSize);

    return {
      data: paginatedData,
      total: data.length,
      page,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize),
    };
  }

  async getById(id: string): Promise<Absence> {
    await this.delay(200);
    const { mockAbsences } = await import('@/lib/data/absences-mock-data');
    const absence = mockAbsences.find(a => a.id === id);
    if (!absence) throw new Error('Absence not found');
    return absence;
  }

  async create(data: AbsenceCreateData): Promise<Absence> {
    await this.delay(500);
    // Simulation création
    const newAbsence: Absence = {
      id: `ABS-${Date.now()}`,
      employeeId: data.employeeId,
      employee: await this.getEmployee(data.employeeId),
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'pending',
      reason: data.reason,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newAbsence;
  }

  async approve(id: string, approverId: string): Promise<Absence> {
    await this.delay(400);
    const absence = await this.getById(id);
    return {
      ...absence,
      status: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async reject(id: string, reason: string): Promise<Absence> {
    await this.delay(400);
    const absence = await this.getById(id);
    return {
      ...absence,
      status: 'rejected',
      updatedAt: new Date(),
    };
  }

  async getCalendar(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    await this.delay(300);
    const { mockAbsences } = await import('@/lib/data/absences-mock-data');
    
    return mockAbsences
      .filter(a => {
        const absStart = new Date(a.startDate);
        const absEnd = new Date(a.endDate);
        return absStart <= endDate && absEnd >= startDate;
      })
      .map(a => ({
        id: a.id,
        type: 'absence' as const,
        title: `${a.employee.name} - ${a.type}`,
        start: a.startDate,
        end: a.endDate,
        employee: a.employee,
        color: this.getColorForType(a.type),
        allDay: true,
        data: a,
      }));
  }

  async getConflicts(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Conflict[]> {
    await this.delay(200);
    // Logique de détection des conflits
    return [];
  }

  async getStats(filter?: AbsenceFilter): Promise<AbsenceStats> {
    await this.delay(300);
    const { mockAbsences } = await import('@/lib/data/absences-mock-data');
    
    let data = [...mockAbsences];
    if (filter) {
      // Appliquer filtres...
    }

    const byType = data.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = data.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const durations = data.map(a => 
      Math.ceil((a.endDate.getTime() - a.startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    return {
      total: data.length,
      byType,
      byStatus,
      averageDuration,
      currentAbsences: data.filter(a => a.status === 'approved' && new Date(a.endDate) >= new Date()).length,
      upcomingAbsences: data.filter(a => new Date(a.startDate) > new Date()).length,
    };
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getEmployee(id: string): Promise<Employee> {
    const { mockEmployees } = await import('@/lib/data/employees-mock-data');
    return mockEmployees.find(e => e.id === id)!;
  }

  private getColorForType(type: string): string {
    const colors = {
      maladie: '#ef4444',
      conge: '#3b82f6',
      formation: '#8b5cf6',
      autre: '#64748b',
    };
    return colors[type as keyof typeof colors] || colors.autre;
  }
}

export const absencesApiService = new AbsencesApiService();
```

---

## 📊 Statistiques du plan

```
Types définis:           30+
Fichiers mock data:      5 (à créer)
Services API:            6 (à créer/compléter)
Modales:                 5 (à créer)
Onglets:                 5 (à créer/compléter)

Total estimé:            21 fichiers
Lignes de code:          ~8,000 lignes
Temps d'implémentation:  8-12 heures
```

---

## 🚀 Ordre d'implémentation recommandé

1. ✅ Types (déjà fait)
2. ✅ Employees mock data (déjà fait)
3. 📝 **Absences mock data** (priorité haute)
4. 📝 **Délégations mock data** (priorité haute)
5. 📝 **Comments & Timeline mock data** (priorité moyenne)
6. 📝 **Documents mock data** (priorité moyenne)
7. 🔧 **Services API** (tous en parallèle)
8. 🎨 **Modales** (par ordre d'importance)
9. 📑 **Onglets détaillés** (dernière étape)

---

**Prochaine étape : Créer les 5 fichiers de mock data restants ! 🎯**

