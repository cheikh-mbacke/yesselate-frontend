# 🚀 Guide de Démarrage Rapide - Nouvelles Fonctionnalités BMO

Ce guide vous aide à utiliser les nouvelles fonctionnalités implémentées dans le système BMO.

---

## 📚 Table des Matières

1. [Services](#services)
2. [Composants UI](#composants-ui)
3. [Hooks](#hooks)
4. [Stores](#stores)
5. [Exemples d'Utilisation](#exemples-dutilisation)

---

## 🔧 Services

### Import
```typescript
import {
  // Services API
  projetsApiService,
  clientsApiService,
  employesApiService,
  financesApiService,
  
  // Services fonctionnels
  exportService,
  documentService,
  auditService,
  notificationService,
  searchService,
  analyticsService,
  workflowService,
  alertingService,
  commentsService
} from '@/lib/services';
```

### Notifications
```typescript
// Envoyer une notification
await notificationService.sendNotification({
  type: 'success',
  priority: 'high',
  titre: 'Action réussie',
  message: 'Votre opération a été effectuée avec succès',
  module: 'projets',
  actionUrl: '/maitre-ouvrage/projets-en-cours',
  actionLabel: 'Voir les projets'
});

// Récupérer les notifications
const notifications = await notificationService.getNotifications({
  userId: 'user-123',
  status: 'unread'
});

// Marquer comme lu
await notificationService.markAsRead('notif-id');
```

### Export de Données
```typescript
// Export Excel
await exportService.exportToExcel(
  data,
  ['nom', 'prenom', 'email'],
  'employes-2026'
);

// Export PDF
await exportService.exportToPDF(
  data,
  ['nom', 'prenom', 'email'],
  'employes-2026'
);

// Export CSV
await exportService.exportToCSV(
  data,
  ['nom', 'prenom', 'email'],
  'employes-2026'
);
```

### Gestion de Documents
```typescript
// Upload document
const doc = await documentService.uploadDocument(
  file,
  'bc',
  'BC-2026-001',
  { category: 'technique', tags: ['plans', 'validation'] }
);

// Rechercher documents
const docs = await documentService.searchDocuments('plans', {
  category: 'technique',
  entityType: 'bc'
});

// Prévisualiser document
const preview = await documentService.previewDocument('doc-id');
```

### Audit Trail
```typescript
// Logger un événement
await auditService.logEvent({
  type: 'update',
  entityType: 'projet',
  entityId: 'PRJ-001',
  userId: 'user-123',
  userName: 'Jean Dupont',
  description: 'Modification du budget',
  details: {
    before: { budget: 100000000 },
    after: { budget: 120000000 }
  }
});

// Récupérer l'historique
const history = await auditService.getHistory('projet', 'PRJ-001');

// Générer rapport
const report = await auditService.generateReport(
  'user-123',
  '2026-01-01',
  '2026-12-31'
);
```

### Recherche Globale
```typescript
// Rechercher
const results = await searchService.search('route nationale', {
  modules: ['projets', 'bcs'],
  dateDebut: '2026-01-01',
  dateFin: '2026-12-31'
});

// Obtenir suggestions
const suggestions = await searchService.getSuggestions('rou');

// Historique
const history = await searchService.getSearchHistory('user-123');
```

### Workflow
```typescript
// Démarrer workflow
const instance = await workflowService.startWorkflow(
  'bc',
  'BC-2026-001',
  { montant: 8000000, type: 'travaux' },
  'user-123'
);

// Approuver étape
await workflowService.approveStep(
  instance.id,
  instance.etapes[0].id,
  'user-456',
  'Marie Martin',
  'Validé techniquement'
);

// Rejeter
await workflowService.rejectStep(
  instance.id,
  instance.etapes[0].id,
  'user-456',
  'Marie Martin',
  'Dossier incomplet'
);

// Récupérer workflows en attente
const pending = await workflowService.getPendingForUser('user-123', 'manager');
```

### Alertes
```typescript
// Démarrer monitoring
alertingService.startMonitoring(60000); // Vérifier toutes les minutes

// Récupérer alertes actives
const alerts = await alertingService.getActiveAlerts({
  severity: ['critical', 'high']
});

// Accuser réception
await alertingService.acknowledgeAlert('alert-id', 'user-123');

// Résoudre
await alertingService.resolveAlert('alert-id', 'user-123');

// Ajouter règle custom
alertingService.addRule({
  id: 'custom_rule',
  name: 'Ma Règle',
  module: 'projets',
  severity: 'high',
  enabled: true,
  condition: (data) => data.budgetConsomme > data.budget * 0.9,
  generateAlert: (data) => ({
    type: 'warning',
    severity: 'high',
    module: 'projets',
    titre: 'Budget bientôt épuisé',
    description: `Le projet ${data.titre} a consommé 90% de son budget`,
    entityId: data.id,
    entityType: 'projet',
    actionRequired: true
  })
});
```

### Commentaires
```typescript
// Ajouter commentaire
await commentsService.addComment({
  entityType: 'projet',
  entityId: 'PRJ-001',
  contenu: 'Le chantier avance bien. @user-123 peux-tu vérifier les plans ?',
  mentions: ['user-123']
});

// Récupérer commentaires
const comments = await commentsService.getComments('projet', 'PRJ-001');

// Récupérer threads
const threads = await commentsService.getThreads('projet', 'PRJ-001');

// Ajouter réaction
await commentsService.addReaction('comment-id', '👍');

// Éditer
await commentsService.editComment('comment-id', 'Nouveau contenu');
```

### Analytics
```typescript
// Récupérer analytics projets
const projetsAnalytics = await analyticsService.getProjetsAnalytics(
  '2026-01-01',
  '2026-12-31'
);

// Récupérer KPIs globaux
const kpis = await analyticsService.getGlobalKPIs();

// Exporter analytics
await analyticsService.exportToCSV(projetsAnalytics, 'analytics-projets-2026');
await analyticsService.exportToPDF(projetsAnalytics, 'analytics-projets-2026');
```

---

## 🎨 Composants UI

### Import
```typescript
import {
  NotificationCenter,
  CommentSection,
  AlertsPanel,
  WorkflowViewer,
  AnalyticsDashboard
} from '@/src/components/features/bmo';
```

### NotificationCenter
```tsx
<NotificationCenter 
  userId="user-123" 
  showBadge={true}
  maxItems={5}
/>
```

### CommentSection
```tsx
<CommentSection 
  entityType="projet"
  entityId="PRJ-001"
/>
```

### AlertsPanel
```tsx
<AlertsPanel 
  module="projets"
  showStats={true}
  maxItems={10}
/>
```

### WorkflowViewer
```tsx
<WorkflowViewer 
  instanceId="WF-123456"
  onComplete={() => console.log('Workflow terminé')}
/>
```

### AnalyticsDashboard
```tsx
<AnalyticsDashboard 
  type="projets" // 'projets' | 'finances' | 'rh' | 'clients'
/>
```

---

## 🪝 Hooks

### usePermissions
```typescript
import { usePermissions } from '@/lib/hooks/usePermissions';

function MyComponent() {
  const { hasPermission, hasRole, currentUserRole } = usePermissions();
  
  if (!hasPermission({ module: 'projets', action: 'write', scope: 'own' })) {
    return <div>Accès refusé</div>;
  }
  
  return (
    <div>
      {hasRole('admin') && <AdminPanel />}
      {hasRole('manager') && <ManagerPanel />}
    </div>
  );
}
```

---

## 📦 Stores

### Import
```typescript
import { 
  useClientsWorkspaceStore,
  useFinancesWorkspaceStore,
  useProjetsWorkspaceStore,
  // ... autres stores
} from '@/lib/stores';
```

### Utilisation
```typescript
function MyComponent() {
  const { tabs, activeTabId, openTab, closeTab } = useFinancesWorkspaceStore();
  
  const handleOpenDetail = (id: string) => {
    openTab({
      id: `detail-${id}`,
      type: 'detail',
      title: 'Détails Finance',
      icon: '💰',
      data: { financeId: id },
      closable: true
    });
  };
  
  return (
    <div>
      {tabs.map(tab => (
        <TabComponent 
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onClose={() => closeTab(tab.id)}
        />
      ))}
    </div>
  );
}
```

---

## 💡 Exemples d'Utilisation Complets

### Exemple 1: Validation BC avec Workflow
```typescript
'use client';
import { useState } from 'react';
import { workflowService, notificationService } from '@/lib/services';
import { WorkflowViewer } from '@/src/components/features/bmo';

export function BCValidationPage({ bcId }: { bcId: string }) {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  
  const handleStartValidation = async () => {
    try {
      // Récupérer les données du BC
      const bcData = await getBCData(bcId);
      
      // Démarrer le workflow
      const instance = await workflowService.startWorkflow(
        'bc',
        bcId,
        bcData,
        'current-user-id'
      );
      
      setWorkflowId(instance.id);
      
      // Notifier
      await notificationService.sendNotification({
        type: 'info',
        priority: 'medium',
        titre: 'Workflow de validation démarré',
        message: `Le BC ${bcId} est en cours de validation`,
        module: 'validation-bc'
      });
    } catch (e) {
      console.error('Erreur démarrage workflow:', e);
    }
  };
  
  return (
    <div>
      {!workflowId ? (
        <button onClick={handleStartValidation}>
          Démarrer la validation
        </button>
      ) : (
        <WorkflowViewer 
          instanceId={workflowId}
          onComplete={() => {
            notificationService.sendNotification({
              type: 'success',
              priority: 'high',
              titre: 'BC Validé',
              message: `Le BC ${bcId} a été validé avec succès`,
              module: 'validation-bc'
            });
          }}
        />
      )}
    </div>
  );
}
```

### Exemple 2: Dashboard avec Analytics et Alertes
```typescript
'use client';
import { AnalyticsDashboard, AlertsPanel } from '@/src/components/features/bmo';

export function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Alertes en haut */}
      <AlertsPanel 
        showStats={true}
        maxItems={5}
      />
      
      {/* Analytics */}
      <AnalyticsDashboard type="projets" />
    </div>
  );
}
```

### Exemple 3: Page Projet avec Commentaires et Documents
```typescript
'use client';
import { useState, useEffect } from 'react';
import { CommentSection } from '@/src/components/features/bmo';
import { documentService } from '@/lib/services';

export function ProjetDetailPage({ projetId }: { projetId: string }) {
  const [documents, setDocuments] = useState([]);
  
  useEffect(() => {
    loadDocuments();
  }, [projetId]);
  
  const loadDocuments = async () => {
    const docs = await documentService.getByEntity('projet', projetId);
    setDocuments(docs);
  };
  
  const handleUpload = async (file: File) => {
    await documentService.uploadDocument(
      file,
      'projet',
      projetId,
      { category: 'technique' }
    );
    await loadDocuments();
  };
  
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Colonne gauche: Infos projet + Documents */}
      <div>
        <h2>Projet {projetId}</h2>
        {/* ... infos projet ... */}
        
        <div className="mt-6">
          <h3>Documents</h3>
          {/* Liste documents */}
          <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
        </div>
      </div>
      
      {/* Colonne droite: Commentaires */}
      <div>
        <CommentSection 
          entityType="projet"
          entityId={projetId}
        />
      </div>
    </div>
  );
}
```

---

## 🔐 Permissions

Les permissions sont gérées par rôle :

| Rôle | Permissions |
|------|------------|
| **admin** | Accès complet à tous les modules |
| **manager** | Lecture tous projets, écriture projets propres, validation budgets bureau |
| **employee** | Lecture projets propres, écriture missions propres |
| **guest** | Lecture données publiques uniquement |

---

## 📝 Notes Importantes

1. **Mock Data**: Tous les services utilisent actuellement des données mock. Remplacez par de vraies API calls en production.

2. **WebSockets**: Le service de notifications est prêt pour WebSocket. Connectez-le à votre backend.

3. **Permissions**: Adaptez les rôles et permissions selon vos besoins métier.

4. **Monitoring**: Le service d'alertes peut être démarré au niveau application :
   ```typescript
   // Dans votre layout ou _app
   useEffect(() => {
     alertingService.startMonitoring(60000);
     return () => alertingService.stopMonitoring();
   }, []);
   ```

5. **Performance**: Les graphiques utilisent Recharts. Pour de grandes quantités de données, considérez la pagination ou le sampling.

---

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation complète dans `IMPLEMENTATION_COMPLETE_FINAL.md`
2. Vérifiez les types TypeScript pour l'autocomplétion
3. Regardez les exemples d'utilisation ci-dessus

---

**Bonne utilisation ! 🚀**

