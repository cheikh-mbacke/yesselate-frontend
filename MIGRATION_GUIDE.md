# 🔄 Guide de Migration

Ce guide vous aide à migrer votre code existant pour utiliser les nouvelles fonctionnalités.

---

## 📋 Checklist de Migration

### Phase 1: Préparation (30 min)
- [ ] Lire `IMPLEMENTATION_COMPLETE_FINAL.md`
- [ ] Lire `GUIDE_UTILISATION.md`
- [ ] Installer la dépendance recharts: `npm install recharts`
- [ ] Vérifier que Zustand est installé: `npm install zustand`

### Phase 2: Migration Backend (Priorité Haute)
- [ ] Remplacer les mocks dans les services API
- [ ] Configurer les endpoints dans les services
- [ ] Tester les appels API
- [ ] Gérer l'authentification/tokens

### Phase 3: Intégration UI (Priorité Moyenne)
- [ ] Ajouter `NotificationCenter` dans le layout principal
- [ ] Intégrer `CommentSection` dans les pages de détail
- [ ] Ajouter `AlertsPanel` dans les dashboards
- [ ] Utiliser `WorkflowViewer` pour les validations

### Phase 4: Optimisations (Priorité Basse)
- [ ] Configurer WebSocket pour notifications temps réel
- [ ] Ajouter tests unitaires
- [ ] Optimiser le chargement des graphiques
- [ ] Ajouter pagination pour grandes listes

---

## 🔧 Migrations Spécifiques

### 1. Migration des Notifications

#### Avant
```typescript
// Code ancien
alert('Opération réussie !');
```

#### Après
```typescript
// Code nouveau
import { notificationService } from '@/lib/services';

await notificationService.sendNotification({
  type: 'success',
  priority: 'high',
  titre: 'Opération réussie',
  message: 'Votre action a été effectuée avec succès',
  module: 'projets'
});
```

### 2. Migration des Exports

#### Avant
```typescript
// Code ancien - export manuel
const csvContent = data.map(row => row.join(',')).join('\n');
const blob = new Blob([csvContent], { type: 'text/csv' });
// ... téléchargement manuel
```

#### Après
```typescript
// Code nouveau - service centralisé
import { exportService } from '@/lib/services';

await exportService.exportToExcel(
  data,
  ['nom', 'prenom', 'email'],
  'employes-2026'
);
```

### 3. Migration des Workflows

#### Avant
```typescript
// Code ancien - validation manuelle
const [etape, setEtape] = useState(1);

const handleValidate = async () => {
  if (etape === 1) {
    // Validation technique
    setEtape(2);
  } else if (etape === 2) {
    // Validation budgétaire
    setEtape(3);
  }
  // ... logique complexe
};
```

#### Après
```typescript
// Code nouveau - workflow service
import { workflowService } from '@/lib/services';
import { WorkflowViewer } from '@/src/components/features/bmo';

// Démarrer le workflow
const instance = await workflowService.startWorkflow(
  'bc',
  bcId,
  bcData,
  userId
);

// Utiliser le composant UI
<WorkflowViewer instanceId={instance.id} />
```

### 4. Migration des Commentaires

#### Avant
```typescript
// Code ancien - commentaires intégrés dans la base
const [comments, setComments] = useState([]);

const addComment = async (text) => {
  const response = await fetch('/api/comments', {
    method: 'POST',
    body: JSON.stringify({ text, entityId })
  });
  // ... gestion manuelle
};
```

#### Après
```typescript
// Code nouveau - service centralisé
import { CommentSection } from '@/src/components/features/bmo';

// Un seul composant gère tout
<CommentSection 
  entityType="projet"
  entityId={projetId}
/>
```

### 5. Migration des Analytics

#### Avant
```typescript
// Code ancien - graphiques manuels
const [data, setData] = useState([]);

useEffect(() => {
  fetch('/api/stats')
    .then(res => res.json())
    .then(setData);
}, []);

// Rendu manuel avec chart.js ou autre
<canvas ref={chartRef} />
```

#### Après
```typescript
// Code nouveau - dashboard tout-en-un
import { AnalyticsDashboard } from '@/src/components/features/bmo';

<AnalyticsDashboard type="projets" />
```

### 6. Migration des Permissions

#### Avant
```typescript
// Code ancien - vérifications dispersées
if (user.role === 'admin' || user.role === 'manager') {
  // Autoriser
}
```

#### Après
```typescript
// Code nouveau - hook centralisé
import { usePermissions } from '@/lib/hooks/usePermissions';

const { hasPermission, hasRole } = usePermissions();

if (hasPermission({ module: 'projets', action: 'write', scope: 'own' })) {
  // Autoriser
}

// Ou plus simple
{hasRole('admin') && <AdminPanel />}
```

---

## 🔄 Migration Page par Page

### Exemple: Migration d'une Page de Liste

#### Avant
```typescript
// app/projets/page.tsx (ancien)
'use client';
import { useState, useEffect } from 'react';

export default function ProjetsPage() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/projets')
      .then(res => res.json())
      .then(data => {
        setProjets(data);
        setLoading(false);
      });
  }, []);
  
  return (
    <div>
      {loading ? 'Chargement...' : (
        <ul>
          {projets.map(p => <li key={p.id}>{p.titre}</li>)}
        </ul>
      )}
    </div>
  );
}
```

#### Après
```typescript
// app/projets/page.tsx (nouveau)
'use client';
import { useState, useEffect } from 'react';
import { projetsApiService } from '@/lib/services';
import { useProjetsWorkspaceStore } from '@/lib/stores';
import { NotificationCenter, AlertsPanel } from '@/src/components/features/bmo';

export default function ProjetsPage() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openTab } = useProjetsWorkspaceStore();
  
  useEffect(() => {
    loadProjets();
  }, []);
  
  const loadProjets = async () => {
    try {
      setLoading(true);
      const data = await projetsApiService.getQueue();
      setProjets(data);
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDetail = (projet) => {
    openTab({
      id: `detail-${projet.id}`,
      type: 'detail',
      title: projet.titre,
      icon: '📊',
      data: { projetId: projet.id },
      closable: true
    });
  };
  
  return (
    <div className="space-y-6 p-6">
      {/* Notifications */}
      <NotificationCenter userId="current-user-id" />
      
      {/* Alertes */}
      <AlertsPanel module="projets" showStats={true} />
      
      {/* Liste des projets */}
      {loading ? (
        <div className="animate-pulse">Chargement...</div>
      ) : (
        <div className="grid gap-4">
          {projets.map(p => (
            <div 
              key={p.id} 
              onClick={() => handleOpenDetail(p)}
              className="p-4 rounded-xl bg-slate-800/30 cursor-pointer hover:bg-slate-800/50"
            >
              <h3 className="font-semibold">{p.titre}</h3>
              <p className="text-sm text-slate-400">{p.client}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Points d'Attention

### 1. Imports
Utilisez les imports centralisés :
```typescript
// ✅ BON
import { notificationService, workflowService } from '@/lib/services';

// ❌ ÉVITER
import { notificationService } from '@/lib/services/notificationService';
```

### 2. Types TypeScript
Importez les types pour bénéficier de l'autocomplétion :
```typescript
import { 
  type Notification, 
  type WorkflowInstance 
} from '@/lib/services';
```

### 3. Mock Data
En développement, les services retournent des mocks. En production :
```typescript
// Configurer l'URL de base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class MyService {
  private baseUrl = `${API_BASE_URL}/my-endpoint`;
  
  async getData() {
    // En dev: return mock
    if (process.env.NODE_ENV === 'development') {
      return mockData;
    }
    
    // En prod: vraie API
    const response = await fetch(this.baseUrl);
    return response.json();
  }
}
```

### 4. Gestion d'Erreurs
Ajoutez toujours un try/catch :
```typescript
try {
  await notificationService.sendNotification({...});
} catch (error) {
  console.error('Erreur notification:', error);
  // Fallback ou message d'erreur
}
```

---

## 🚀 Déploiement

### Variables d'Environnement à Ajouter

```env
# .env.local ou .env.production

# API Backend
NEXT_PUBLIC_API_URL=https://api.yesselate.com

# WebSocket (pour notifications temps réel)
NEXT_PUBLIC_WS_URL=wss://ws.yesselate.com

# Upload de fichiers
NEXT_PUBLIC_UPLOAD_MAX_SIZE=10485760 # 10MB

# Features flags (optionnel)
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_WORKFLOWS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Build et Déploiement

```bash
# 1. Installer les dépendances
npm install

# 2. Build production
npm run build

# 3. Vérifier qu'il n'y a pas d'erreurs
npm run lint

# 4. Lancer en production
npm start
```

---

## 📊 Monitoring Post-Migration

### Vérifier que tout fonctionne

1. **Notifications**
   ```typescript
   // Tester dans la console
   import { notificationService } from '@/lib/services';
   await notificationService.sendNotification({
     type: 'info',
     titre: 'Test',
     message: 'Notification de test'
   });
   ```

2. **Workflow**
   - Créer un BC de test
   - Démarrer un workflow
   - Vérifier les étapes de validation

3. **Analytics**
   - Ouvrir un dashboard
   - Vérifier que les graphiques s'affichent
   - Tester l'export PDF/CSV

4. **Alertes**
   - Vérifier le monitoring automatique
   - Créer une alerte de test
   - Tester l'accusé de réception

5. **Commentaires**
   - Ajouter un commentaire sur une entité
   - Tester les mentions
   - Tester les réactions

---

## 🆘 Résolution de Problèmes

### Problème: "Module not found"
```bash
# Solution: Vérifier les imports
npm install zustand recharts
```

### Problème: "Type error in ..."
```typescript
// Solution: Importer les types
import { type MyType } from '@/lib/services';
```

### Problème: "Les graphiques ne s'affichent pas"
```bash
# Solution: Vérifier Recharts
npm install recharts
# Redémarrer le serveur
npm run dev
```

### Problème: "Les stores ne persistent pas"
```typescript
// Solution: Vérifier que le middleware persist est bien configuré
// Dans le store
export const useMyStore = create<State>()(
  persist(
    (set, get) => ({...}),
    { name: 'my-store' } // ← Important
  )
);
```

---

## ✅ Validation de la Migration

- [ ] Toutes les pages compilent sans erreur
- [ ] Les notifications s'affichent correctement
- [ ] Les workflows fonctionnent end-to-end
- [ ] Les exports génèrent des fichiers valides
- [ ] Les graphiques affichent des données
- [ ] Les commentaires peuvent être ajoutés/modifiés
- [ ] Les alertes sont détectées et affichées
- [ ] Les permissions limitent correctement l'accès
- [ ] Les stores persistent entre les rechargements
- [ ] La recherche globale retourne des résultats

---

**Bonne migration ! 🚀**

En cas de problème, consultez `GUIDE_UTILISATION.md` ou `IMPLEMENTATION_COMPLETE_FINAL.md`.
