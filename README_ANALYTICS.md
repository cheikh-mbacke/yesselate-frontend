# 📊 Module Analytics - README

> Centre de commandement pour le pilotage et l'analyse des KPIs  
> Version 2.0 - Production Ready

---

## 🎯 Vue d'Ensemble

Le module Analytics est une plateforme complète de Business Intelligence pour les Maîtres d'Ouvrage, offrant:

- 📊 **Tableaux de bord interactifs** en temps réel
- 🔔 **Notifications instantanées** via SSE (Server-Sent Events)
- 📈 **Graphiques avancés** avec Recharts
- 🔍 **Recherche globale** intelligente
- 📥 **Export multi-format** (Excel, CSV, PDF, JSON)
- 🔐 **Sécurité RBAC** avec 5 rôles et 30 permissions
- 📝 **Audit logging** complet de toutes les actions
- ⭐ **Gestion des favoris** avec tags et groupes
- ⚡ **Performance optimisée** avec React Query

---

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- React 19+
- Next.js 16+

### Dépendances Principales

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.90.12",
    "recharts": "^3.6.0",
    "axios": "^1.13.2",
    "zustand": "^5.0.9",
    "lucide-react": "^0.562.0"
  }
}
```

Toutes les dépendances sont déjà installées dans le projet.

---

## 🚀 Démarrage

### 1. Développement

```bash
npm run dev
```

Accédez au module: `http://localhost:4001/maitre-ouvrage/analytics`

### 2. Build Production

```bash
npm run build
npm start
```

### 3. Linting

```bash
npm run lint
```

---

## 📁 Structure du Projet

```
src/components/features/bmo/analytics/
├── command-center/          # Navigation & Layout principal
│   ├── AnalyticsCommandSidebar.tsx
│   ├── AnalyticsSubNavigation.tsx
│   ├── AnalyticsKPIBar.tsx
│   ├── AnalyticsContentRouter.tsx
│   ├── AnalyticsFiltersPanel.tsx
│   └── index.ts
│
├── workspace/               # Modals & Fonctionnalités avancées
│   ├── AnalyticsCommandPalette.tsx
│   ├── AnalyticsStatsModal.tsx
│   ├── AnalyticsExportModal.tsx
│   ├── AnalyticsAlertConfigModal.tsx
│   ├── AnalyticsReportModal.tsx
│   └── AnalyticsToast.tsx
│
├── charts/                  # Graphiques interactifs
│   ├── InteractiveChart.tsx
│   ├── ChartGrid.tsx
│   └── index.ts
│
├── search/                  # Recherche globale
│   ├── GlobalSearch.tsx
│   └── index.ts
│
└── hooks/                   # React Hooks personnalisés
    └── useRealtimeAnalytics.tsx

src/lib/
├── api/
│   ├── pilotage/
│   │   └── analyticsClient.ts      # Client API Axios
│   └── hooks/
│       └── useAnalytics.ts         # React Query hooks
│
├── services/
│   ├── analyticsPermissions.ts     # RBAC
│   ├── analyticsAudit.ts          # Audit logging
│   ├── analyticsFavorites.ts      # Gestion favoris
│   └── analyticsRealtime.ts       # SSE temps réel
│
└── stores/
    └── analyticsWorkspaceStore.ts  # Zustand store

app/(portals)/maitre-ouvrage/analytics/
└── page.tsx                        # Page principale

docs/
├── API_ANALYTICS_BACKEND.md        # Spécification API
├── ANALYTICS_RECAP_COMPLET.md      # Documentation technique
└── ANALYTICS_GUIDE_UTILISATEUR.md  # Guide utilisateur
```

---

## 🔧 Configuration

### 1. Variables d'Environnement

Créez un fichier `.env.local`:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Analytics
NEXT_PUBLIC_ANALYTICS_REALTIME_URL=/api/analytics/realtime
NEXT_PUBLIC_ANALYTICS_REFRESH_INTERVAL=300000

# Features
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_ENABLE_EXPORT=true
```

### 2. API Backend

Le backend doit implémenter les endpoints décrits dans `docs/API_ANALYTICS_BACKEND.md`.

**Base URL**: `/api/analytics`

**Endpoints requis**:
- GET `/dashboard` - Dashboard principal
- GET `/kpis` - Liste des KPIs
- GET `/alerts` - Alertes
- GET `/reports` - Rapports
- GET `/trends` - Tendances
- GET `/bureaux/performance` - Performance bureaux
- POST `/export` - Export de données
- GET `/realtime` - SSE pour temps réel

### 3. Authentification

Le module utilise JWT pour l'authentification. Assurez-vous que:

```typescript
// Headers requis pour toutes les requêtes API
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 💻 Utilisation

### Composants Principaux

#### 1. Page Analytics

```tsx
import AnalyticsPage from '@/app/(portals)/maitre-ouvrage/analytics/page';

// La page est un Server Component qui wrap AnalyticsPageContent
// avec AnalyticsToastProvider
```

#### 2. Graphiques Interactifs

```tsx
import { InteractiveChart, ChartGrid } from '@/components/features/bmo/analytics/charts';

// Graphique simple
<InteractiveChart
  title="Performance"
  data={[
    { name: 'Jan', value: 85 },
    { name: 'Fév', value: 92 },
  ]}
  type="line"
  showTrend={true}
  enableExport={true}
/>

// Grille de graphiques
<ChartGrid
  columns={2}
  charts={[
    {
      id: 'chart1',
      title: 'Graphique 1',
      chartProps: { data: [...], type: 'bar' }
    }
  ]}
/>
```

#### 3. Recherche Globale

```tsx
import { GlobalSearch } from '@/components/features/bmo/analytics/search';

<GlobalSearch
  placeholder="Rechercher..."
  onSearch={async (query, filters) => {
    // Recherche personnalisée
    const results = await searchAPI(query, filters);
    return results;
  }}
  onSelectResult={(result) => {
    // Action lors de la sélection
    console.log('Selected:', result);
  }}
  showFilters={true}
/>
```

#### 4. Notifications Temps Réel

```tsx
import { useRealtimeAnalytics } from '@/components/features/bmo/analytics/hooks/useRealtimeAnalytics';

function MyComponent() {
  const { isConnected, subscriptionsCount } = useRealtimeAnalytics({
    autoConnect: true,
    showToasts: true,
    autoInvalidateQueries: true,
  });

  return (
    <div>
      Connexion: {isConnected ? '✅' : '❌'}
      Abonnements: {subscriptionsCount}
    </div>
  );
}
```

#### 5. Système de Toast

```tsx
import { useAnalyticsToast } from '@/components/features/bmo/analytics/workspace/AnalyticsToast';

function MyComponent() {
  const toast = useAnalyticsToast();

  const handleAction = () => {
    toast.success('Action réussie !');
    toast.dataRefreshed();
    toast.exportReady('rapport.xlsx', '/downloads/rapport.xlsx');
  };

  return <button onClick={handleAction}>Action</button>;
}
```

#### 6. React Query Hooks

```tsx
import {
  useKpis,
  useAlerts,
  useTrends,
  useAnalyticsDashboard,
} from '@/lib/api/hooks/useAnalytics';

function MyComponent() {
  // Récupérer les KPIs
  const { data, isLoading, error } = useKpis();

  // Récupérer les alertes avec filtres
  const { data: alerts } = useAlerts({
    status: ['critical', 'warning'],
    bureauId: 'bureau123',
  });

  // Dashboard complet
  const { data: dashboard } = useAnalyticsDashboard();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return <div>{/* Afficher les données */}</div>;
}
```

---

## 🔐 Permissions

### Rôles Disponibles

```typescript
type Role = 'admin' | 'manager' | 'analyst' | 'viewer' | 'guest';
```

### Vérifier les Permissions

```tsx
import { useAnalyticsPermissions } from '@/lib/services/analyticsPermissions';

function MyComponent() {
  const permissions = useAnalyticsPermissions();

  if (permissions.canExportData()) {
    return <ExportButton />;
  }

  return null;
}
```

### Matrice de Permissions

| Action | Admin | Manager | Analyst | Viewer | Guest |
|--------|-------|---------|---------|--------|-------|
| Voir KPIs | ✅ | ✅ | ✅ | ✅ | 🔒 |
| Créer KPIs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Exporter | ✅ | ✅ | 🔒 | ❌ | ❌ |
| Config Alertes | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gérer Users | ✅ | ❌ | ❌ | ❌ | ❌ |

🔒 = Accès limité

---

## 📊 Graphiques Disponibles

### Types de Graphiques

1. **Line Chart** - Évolution temporelle
2. **Bar Chart** - Comparaisons
3. **Area Chart** - Tendances cumulées
4. **Pie Chart** - Distribution

### Configuration

```tsx
<InteractiveChart
  title="Mon Graphique"
  data={chartData}
  type="line"                    // Type de graphique
  height={300}                   // Hauteur en px
  colors={['#3b82f6', '#10b981']} // Couleurs personnalisées
  dataKeys={['value', 'target']} // Clés des données
  showLegend={true}              // Afficher légende
  showGrid={true}                // Afficher grille
  enableZoom={false}             // Activer zoom
  enableExport={true}            // Activer export
  showTrend={true}               // Afficher tendances
  onDataPointClick={(point) => {
    console.log('Clicked:', point);
  }}
/>
```

---

## 🎨 Personnalisation

### Thème

Le module utilise Tailwind CSS avec une palette de couleurs personnalisée:

```css
/* Couleurs principales */
--analytics-primary: #3b82f6;    /* blue-500 */
--analytics-success: #10b981;    /* green-500 */
--analytics-warning: #f59e0b;    /* amber-500 */
--analytics-critical: #ef4444;   /* red-500 */
--analytics-bg: #0f172a;         /* slate-950 */
```

### Ajouter une Nouvelle Catégorie

Dans `analyticsCategories` (command-center/index.ts):

```tsx
{
  id: 'nouvelle-categorie',
  label: 'Nouvelle Catégorie',
  icon: MonIcone,
  badge: 5,
  description: 'Description',
}
```

---

## 🧪 Tests

### Tests Unitaires

```bash
npm test
```

### Tests avec Coverage

```bash
npm run test:coverage
```

### Tests Recommandés

- ✅ Hooks React Query
- ✅ Services (permissions, audit, favoris)
- ✅ Composants UI critiques
- ✅ Recherche globale
- ✅ Système de notifications

---

## 📈 Performance

### Optimisations Implémentées

1. **React.memo** sur tous les composants lourds
2. **Debounce** sur la recherche (300ms)
3. **React Query** avec cache intelligent
4. **Lazy loading** des modals
5. **Virtual scrolling** pour les grandes listes
6. **Code splitting** automatique par Next.js

### Métriques Cibles

- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TTI** (Time to Interactive): < 3.5s
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 🐛 Débogage

### Mode Debug

```typescript
// Activer les logs détaillés
localStorage.setItem('analytics:debug', 'true');

// Désactiver
localStorage.removeItem('analytics:debug');
```

### Outils de Développement

- **React DevTools** - Inspecter composants
- **React Query DevTools** - Inspecter cache et queries
- **Network Tab** - Vérifier les requêtes API
- **Console** - Logs SSE et erreurs

---

## 🚨 Problèmes Connus

### 1. SSE ne se connecte pas

**Solution**: Vérifiez que le backend supporte SSE et que l'URL est correcte.

```typescript
// Dans .env.local
NEXT_PUBLIC_ANALYTICS_REALTIME_URL=http://localhost:3000/api/analytics/realtime
```

### 2. Graphiques ne s'affichent pas

**Solution**: Vérifiez que `recharts` est installé et que les données sont au bon format.

### 3. Export échoue

**Solution**: Vérifiez les permissions utilisateur et la taille des données.

---

## 📚 Documentation

- 📖 [Guide Utilisateur](./docs/ANALYTICS_GUIDE_UTILISATEUR.md)
- 🔧 [Documentation API Backend](./docs/API_ANALYTICS_BACKEND.md)
- 📊 [Récapitulatif Technique](./docs/ANALYTICS_RECAP_COMPLET.md)
- 🔍 [Analyse des Fonctionnalités](./docs/ANALYTICS_ANALYSE_FINALE_ERREURS_MANQUES.md)

---

## 🤝 Contribution

### Standards de Code

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Conventional Commits
- ✅ Tests unitaires pour nouvelles features
- ✅ Documentation JSDoc

### Workflow

1. Créer une branche: `git checkout -b feature/ma-feature`
2. Coder avec tests
3. Linter: `npm run lint`
4. Commit: `git commit -m "feat: ma nouvelle feature"`
5. Push: `git push origin feature/ma-feature`
6. Créer une Pull Request

---

## 📞 Support

### Contacts

- 📧 **Email**: dev@yesselate.com
- 💬 **Slack**: #analytics-support
- 📖 **Wiki**: https://wiki.yesselate.com/analytics

### Rapporter un Bug

Utilisez le template GitHub Issues:

```markdown
**Description**: [Description claire du bug]
**Étapes**: [Comment reproduire]
**Attendu**: [Comportement attendu]
**Obtenu**: [Comportement obtenu]
**Environnement**: [OS, Browser, Version]
**Screenshots**: [Si applicable]
```

---

## 📝 Changelog

### Version 2.0 (2026-01-10)

**✨ Nouvelles Fonctionnalités**
- Notifications temps réel via SSE
- Graphiques interactifs avec Recharts
- Recherche globale avancée
- Export multi-format
- Système de permissions RBAC
- Audit logging complet
- Gestion des favoris

**🔧 Améliorations**
- Performance optimisée avec React.memo
- Cache React Query intelligent
- UI/UX améliorée
- Responsive design

**🐛 Corrections**
- Corrections de bugs divers
- Optimisations mémoire

---

## 📜 Licence

Propriétaire - Yesselate © 2026

---

## 🙏 Remerciements

- **React Team** - Framework génial
- **Vercel** - Next.js et déploiement
- **TanStack** - React Query
- **Recharts** - Graphiques magnifiques
- **Lucide** - Icônes superbes

---

**🎉 Bon développement avec le module Analytics !**

Pour toute question, consultez la documentation ou contactez l'équipe de support.

