# 🚀 Guide de Démarrage Rapide - Portail BMO

Guide pratique pour utiliser immédiatement les nouvelles fonctionnalités implémentées.

---

## ⚡ Démarrage Rapide en 5 Minutes

### 1. Utiliser les Nouveaux Stores

```typescript
// Dans n'importe quelle page du portail BMO
import { useClientsWorkspaceStore } from '@/lib/stores/clientsWorkspaceStore';

function ClientsPage() {
  const {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    commandPaletteOpen,
    setCommandPaletteOpen,
    viewMode,
    setViewMode,
  } = useClientsWorkspaceStore();

  // Ouvrir un nouveau tab
  const handleOpenClient = (clientId: string) => {
    openTab({
      id: `client-${clientId}`,
      type: 'client',
      title: 'Client Details',
      icon: '👤',
      data: { clientId },
    });
  };

  return (
    <div>
      {/* Toggle Dashboard/Workspace */}
      <button onClick={() => setViewMode(viewMode === 'dashboard' ? 'workspace' : 'dashboard')}>
        {viewMode === 'dashboard' ? '📊 Dashboard' : '💼 Workspace'}
      </button>

      {/* Command Palette */}
      <button onClick={() => setCommandPaletteOpen(true)}>
        Search (⌘K)
      </button>
    </div>
  );
}
```

---

### 2. Charger des Données via API Services

```typescript
import { projetsApiService } from '@/lib/services/projetsApiService';
import { employesApiService } from '@/lib/services/employesApiService';

async function loadData() {
  // Statistiques
  const stats = await projetsApiService.getStats();
  console.log(`${stats.active} projets actifs sur ${stats.total}`);

  // Liste avec filtres
  const projetsActifs = await projetsApiService.getList({
    status: ['actif'],
    type: ['BTP_route'],
  });

  // Détails
  const projet = await projetsApiService.getById('PRJ-001');
  
  // Créer
  const newProjet = await projetsApiService.create({
    titre: 'Nouveau Projet',
    type: 'BTP_batiment',
    budget: 5000000,
  });

  // Formater montant
  const formatted = projetsApiService.formatMontant(4500000000);
  // => "4.50 Md"
}
```

---

### 3. Utiliser les Permissions

```typescript
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useBMOStore } from '@/lib/stores';

function ValidationPage() {
  const { currentUser } = useBMOStore();
  const permissions = usePermissions(currentUser);

  return (
    <div>
      {/* Bouton conditionnel */}
      {permissions.canValidateBC && (
        <button onClick={handleValidate}>
          Valider BC
        </button>
      )}

      {/* Menu conditionnel */}
      {permissions.canViewFinances && (
        <Link href="/maitre-ouvrage/finances">
          Finances
        </Link>
      )}

      {/* Affichage info selon permission */}
      {permissions.canViewSalaires ? (
        <p>Salaire: {employe.salaire} FCFA</p>
      ) : (
        <p>Salaire: Confidentiel</p>
      )}
    </div>
  );
}
```

---

### 4. Exporter des Données

```typescript
import { exportService } from '@/lib/services/exportService';
import { projetsApiService } from '@/lib/services/projetsApiService';

async function handleExport() {
  const projets = await projetsApiService.getList();

  // Export Excel rapide
  const result = await exportService.exportToExcelQuick(
    projets,
    'projets_2026',
    'Liste Projets'
  );

  if (result.success) {
    console.log(`✅ Exporté: ${result.recordCount} lignes, ${result.size} bytes`);
  }

  // Export CSV avec options
  await exportService.exportData(projets, {
    format: 'csv',
    filename: 'projets_actifs',
    columns: ['numero', 'titre', 'budget', 'avancement'],
    filters: { status: ['actif'] },
  });

  // Export PDF
  await exportService.exportToPDFQuick(
    projets,
    'rapport_projets',
    'landscape'
  );
}
```

---

### 5. Gérer des Documents

```typescript
import { documentService } from '@/lib/services/documentService';

async function handleUpload(file: File) {
  // Upload avec progression
  const document = await documentService.uploadDocument(
    file,
    {
      module: 'projets',
      entityId: 'PRJ-001',
      entityType: 'projet',
      tags: ['technique', 'urgent'],
    },
    (progress) => {
      console.log(`Upload: ${progress.percentage}%`);
      updateProgressBar(progress.percentage);
    }
  );

  console.log(`✅ Document uploadé: ${document.nom}`);

  // Récupérer documents d'un projet
  const documents = await documentService.getDocuments('projets', 'PRJ-001');

  // Télécharger
  const blob = await documentService.downloadDocument(document);

  // Preview
  if (documentService.isPreviewable(document.type)) {
    const previewUrl = documentService.getPreviewUrl(document.id);
    window.open(previewUrl, '_blank');
  }

  // Formater taille
  const size = documentService.formatSize(document.taille);
  // => "2.45 MB"
}
```

---

### 6. Notifications Temps Réel

```typescript
import { useEffect } from 'react';
import { notificationService } from '@/lib/services/notificationService';
import { useBMOStore } from '@/lib/stores';

function App() {
  const { currentUser, addToast } = useBMOStore();

  useEffect(() => {
    if (!currentUser) return;

    // Demander permission navigateur
    notificationService.requestPermission();

    // Connecter WebSocket
    notificationService.connectWebSocket(currentUser.id);

    // S'abonner aux notifications
    const unsubscribe = notificationService.subscribe((notification) => {
      console.log('📬 Notification:', notification);

      // Afficher dans l'UI
      addToast(notification.titre, notification.type, {
        description: notification.message,
        action: notification.actionUrl ? {
          label: notification.actionLabel || 'Voir',
          onClick: () => window.location.href = notification.actionUrl!,
        } : undefined,
      });

      // Jouer un son selon priorité
      if (notification.priority === 'critical') {
        playUrgentSound();
      }
    });

    return () => {
      unsubscribe();
      notificationService.disconnect();
    };
  }, [currentUser]);

  return <div>{/* App */}</div>;
}
```

---

### 7. Recherche Globale

```typescript
import { searchService } from '@/lib/services/searchService';
import { useState } from 'react';

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (q: string) => {
    setQuery(q);

    if (!q.trim()) {
      setResults([]);
      return;
    }

    const response = await searchService.search({
      query: q,
      filters: {
        types: ['projet', 'client', 'bc'],
        modules: ['projets', 'clients', 'validation-bc'],
      },
      limit: 20,
      sortBy: 'relevance',
    });

    setResults(response.results);
    console.log(`🔍 ${response.total} résultats en ${response.searchTime}ms`);
  };

  // Autocomplétion
  const handleQuickSearch = async (q: string) => {
    const suggestions = await searchService.quickSearch(q, 5);
    return suggestions;
  };

  // Historique
  const history = searchService.getSearchHistory();

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Rechercher..."
      />

      {/* Résultats */}
      {results.map((result) => (
        <div key={result.id}>
          <span>{result.icon}</span>
          <a href={result.url}>
            {result.titre}
            <span className="score">Score: {result.score}%</span>
          </a>
        </div>
      ))}

      {/* Historique */}
      {query === '' && history.length > 0 && (
        <div>
          <h4>Recherches récentes</h4>
          {history.map((h) => (
            <button key={h} onClick={() => handleSearch(h)}>
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🧩 Composants Prêts à l'Emploi

### Modal de Statistiques

```typescript
import { FinancesStatsModal } from '@/components/features/bmo/workspace/finances';
import { useState } from 'react';

function FinancesPage() {
  const [statsOpen, setStatsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setStatsOpen(true)}>
        📊 Voir Statistiques
      </button>

      <FinancesStatsModal
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
      />
    </div>
  );
}
```

### Direction Panel (Live Stats)

```typescript
import { EmployesDirectionPanel } from '@/components/features/bmo/workspace/employes';
import { useState } from 'react';

function EmployesPage() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setPanelOpen(!panelOpen)}>
        {panelOpen ? 'Fermer' : 'Ouvrir'} Panel
      </button>

      <EmployesDirectionPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}
```

---

## 🎨 Exemples de Pages Complètes

### Page avec Permissions

```typescript
'use client';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useBMOStore } from '@/lib/stores';
import { projetsApiService } from '@/lib/services/projetsApiService';
import { exportService } from '@/lib/services/exportService';

export default function ProjetsPage() {
  const { currentUser } = useBMOStore();
  const permissions = usePermissions(currentUser);
  const [projets, setProjets] = useState([]);

  useEffect(() => {
    if (permissions.canViewProjets) {
      loadProjets();
    }
  }, [permissions]);

  const loadProjets = async () => {
    const data = await projetsApiService.getList();
    setProjets(data);
  };

  const handleCreate = async () => {
    if (!permissions.canCreateProjet) {
      alert('Permission refusée');
      return;
    }

    const newProjet = await projetsApiService.create({
      titre: 'Nouveau Projet',
      type: 'BTP_route',
      budget: 5000000,
    });

    await loadProjets();
  };

  const handleExport = async () => {
    if (!permissions.canExportData) {
      alert('Permission refusée');
      return;
    }

    await exportService.exportToExcelQuick(projets, 'projets', 'Projets');
  };

  if (!permissions.canViewProjets) {
    return <div>Accès refusé</div>;
  }

  return (
    <div>
      <h1>Projets</h1>

      {permissions.canCreateProjet && (
        <button onClick={handleCreate}>Créer Projet</button>
      )}

      {permissions.canExportData && (
        <button onClick={handleExport}>Exporter Excel</button>
      )}

      <table>
        {projets.map((projet) => (
          <tr key={projet.id}>
            <td>{projet.numero}</td>
            <td>{projet.titre}</td>
            <td>{projetsApiService.formatMontant(projet.budget)}</td>
            
            {permissions.canEditProjet && (
              <td><button>Éditer</button></td>
            )}
            
            {permissions.canDeleteProjet && (
              <td><button>Supprimer</button></td>
            )}
          </tr>
        ))}
      </table>
    </div>
  );
}
```

---

## 🔧 Configuration Recommandée

### Variables d'Environnement

Créer `.env.local`:

```bash
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Upload
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10 MB
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/*,application/pdf,application/vnd.openxmlformats*

# Features
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

### Installation Dépendances (optionnelles)

```bash
# Pour graphiques (Phase 3)
npm install recharts

# Pour export Excel réel
npm install xlsx
# OU
npm install exceljs

# Pour export PDF réel
npm install jspdf jspdf-autotable

# Pour notifications navigateur enrichies
npm install @radix-ui/react-toast
```

---

## 📱 Responsive & Mobile

Tous les composants créés utilisent Tailwind et sont responsive par défaut:

```tsx
// Exemple: masquer sur mobile
<span className="hidden md:inline">Texte long</span>

// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

// Padding responsive
<div className="px-4 md:px-6 lg:px-8">
  {/* Content */}
</div>
```

---

## 🐛 Dépannage

### Problème: Store non persisté

**Solution**: Vérifier que le nom du store est unique dans `name: 'bmo-xxx-workspace'`

### Problème: WebSocket ne se connecte pas

**Solution**: Mode simulation activé automatiquement. Vérifier `NEXT_PUBLIC_WS_URL` ou attendre implémentation serveur.

### Problème: Export génère JSON au lieu d'Excel

**Solution**: Normal en mode mock. Installer `xlsx` et remplacer la méthode `exportToExcel()`.

### Problème: Permissions toujours fausses

**Solution**: Vérifier que `currentUser` a un `role` valide et que le type correspond à `UserRole`.

---

## 📚 Ressources

- **Documentation complète**: `ANALYSE_AMELIORATIONS_BMO.md`
- **État d'avancement**: `IMPLEMENTATION_COMPLETE.md`
- **Exemples de code**: Ce fichier
- **Types TypeScript**: Tous les services ont des interfaces complètes

---

## ✨ Prêt à Démarrer !

Tous les services sont **opérationnels** et peuvent être utilisés **immédiatement** en mode mock. 

Pour passer en production:
1. Implémenter les routes API backend correspondantes
2. Remplacer les `delay()` par des vrais `fetch()`
3. Configurer WebSocket si notifications temps réel souhaitées
4. Ajouter vraies librairies d'export si nécessaire

**Bon développement ! 🚀**

