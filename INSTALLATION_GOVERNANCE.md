# Guide d'Installation - Module Gouvernance

Ce guide vous accompagne dans l'installation et la configuration du module Gouvernance Command Center.

## 📋 Prérequis

- Node.js 18.x ou supérieur
- npm ou yarn ou pnpm
- Next.js 14.x
- TypeScript 5.x

## 🚀 Installation

### 1. Dépendances déjà installées

Le module utilise les dépendances existantes du projet :

```bash
# Vérifiez que ces packages sont installés
npm list lucide-react zustand recharts
```

Si besoin, installez-les :

```bash
npm install lucide-react zustand recharts
```

### 2. Configuration de l'environnement

Copiez le fichier d'exemple de configuration :

```bash
cp .env.governance.example .env.local
```

Éditez `.env.local` selon vos besoins :

```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
NEXT_PUBLIC_AUTO_REFRESH_INTERVAL=30000
```

### 3. Structure des fichiers

Vérifiez que tous les fichiers sont bien présents :

```
src/
├── components/features/bmo/governance/command-center/
│   ├── views/
│   ├── modals/
│   ├── *.tsx (composants)
│   ├── config.ts
│   ├── types.ts
│   └── README.md
├── lib/
│   ├── stores/governanceCommandCenterStore.ts
│   ├── services/governanceService.ts
│   ├── mocks/governanceMockData.ts
│   ├── utils/governanceHelpers.ts
│   └── constants/governanceConstants.ts
└── app/(portals)/maitre-ouvrage/governance/page.tsx
```

## 🔧 Configuration

### Mode Mock vs Mode Production

#### Mode Mock (Développement)

Parfait pour le développement sans backend :

```env
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
```

Les données mockées sont chargées depuis `src/lib/mocks/governanceMockData.ts`.

#### Mode Production

Connectez-vous à votre API réelle :

```env
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=https://votre-api.com/api
```

### Configuration de l'API

Le service API attend les endpoints suivants :

```
GET    /api/governance/projects
GET    /api/governance/projects/:id
PATCH  /api/governance/projects/:id

GET    /api/governance/risks
POST   /api/governance/risks
GET    /api/governance/risks/:id
PATCH  /api/governance/risks/:id

GET    /api/governance/alerts
POST   /api/governance/alerts/:id/read
POST   /api/governance/alerts/read-all
POST   /api/governance/alerts/:id/resolve

GET    /api/governance/decisions
POST   /api/governance/decisions
POST   /api/governance/decisions/:id/approve
POST   /api/governance/decisions/:id/reject

GET    /api/governance/escalations
POST   /api/governance/escalations
POST   /api/governance/escalations/:id/resolve

GET    /api/governance/kpis

POST   /api/governance/export
```

Consultez `src/lib/services/governanceService.ts` pour les détails des schémas.

## 🎨 Personnalisation

### Couleurs et Thème

Le module utilise le design system de votre application. Pour personnaliser :

1. **Couleurs sémantiques** : Modifiez `src/lib/constants/governanceConstants.ts`

```typescript
export const STATUS_COLORS = {
  success: { /* vos couleurs */ },
  warning: { /* vos couleurs */ },
  // ...
}
```

2. **Styles globaux** : Ajustez dans vos fichiers Tailwind

### Navigation

Personnalisez la structure de navigation dans `config.ts` :

```typescript
export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'pilotage',
    label: 'Pilotage',
    icon: LayoutDashboard,
    path: ['pilotage'],
    children: [
      // Ajoutez vos propres onglets
    ]
  }
]
```

### KPIs

Ajoutez ou modifiez les KPIs dans le mock ou votre API :

```typescript
// src/lib/mocks/governanceMockData.ts
export const mockKPIs: KPI[] = [
  {
    id: 'mon-kpi',
    label: 'Mon Indicateur',
    value: 42,
    trend: 'up',
    // ...
  }
]
```

## 🧪 Tests

### Tests unitaires

Lancez les tests :

```bash
npm test src/lib/utils/__tests__/governanceHelpers.test.ts
```

### Tests d'intégration

À venir : tests Cypress/Playwright pour les workflows complets.

## 📊 Intégration React Query (Optionnelle)

Pour améliorer la gestion du cache et des données temps réel :

### 1. Installation

```bash
npm install @tanstack/react-query
```

### 2. Configuration

Ajoutez le QueryClientProvider dans votre layout :

```typescript
// app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 secondes
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 3. Utilisation des hooks

Les hooks sont déjà préparés dans `src/lib/hooks/useGovernanceData.ts` :

```typescript
import { useProjects, useKPIs } from '@/lib/hooks/useGovernanceData';

function MyComponent() {
  const { data, isLoading, error } = useProjects({ status: 'active' });
  // ...
}
```

## 🔒 Sécurité

### Authentification

Le module s'attend à ce que l'authentification soit gérée au niveau application.

Pour ajouter l'authentification aux appels API :

```typescript
// src/lib/services/governanceService.ts
async function fetchApi<T>(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken(); // Votre fonction d'obtention du token
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });
}
```

### Permissions

Les constantes de permissions sont définies dans `governanceConstants.ts`.

Implémentez votre logique de contrôle d'accès :

```typescript
import { PERMISSIONS } from '@/lib/constants/governanceConstants';

function canApproveDecision(user: User) {
  return user.permissions.includes(PERMISSIONS.APPROVE_DECISIONS);
}
```

## 🚦 Démarrage

### Mode Développement

```bash
npm run dev
```

Accédez à : `http://localhost:3000/maitre-ouvrage/governance`

### Mode Production

```bash
npm run build
npm start
```

## 📈 Monitoring

### Logs

Activez le mode debug :

```env
NEXT_PUBLIC_DEBUG_MODE=true
```

Les logs seront visibles dans la console du navigateur.

### Performance

Utilisez React DevTools Profiler pour identifier les goulots d'étranglement.

### Erreurs

Intégrez Sentry pour le monitoring des erreurs :

```env
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 🔄 Mises à jour

### Version du module

Consultez le fichier `README.md` pour connaître la version actuelle.

### Migration

Lors des mises à jour majeures, consultez le CHANGELOG.md (à créer) pour les breaking changes.

## 🆘 Dépannage

### Problème : "Store is undefined"

Vérifiez que le store est bien importé :

```typescript
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
```

### Problème : "API calls fail in production"

1. Vérifiez la variable `NEXT_PUBLIC_API_URL`
2. Assurez-vous que le mode mock est désactivé
3. Vérifiez les CORS côté API

### Problème : "Data not refreshing"

1. Vérifiez `NEXT_PUBLIC_AUTO_REFRESH_INTERVAL`
2. Assurez-vous que React Query est correctement configuré
3. Consultez les logs réseau dans DevTools

### Problème : "Module not found"

Vérifiez votre configuration d'alias dans `tsconfig.json` :

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Support

Pour toute question ou problème :

1. Consultez d'abord la documentation dans `README.md`
2. Vérifiez les types TypeScript pour l'usage des composants
3. Examinez les exemples dans les fichiers mock

---

**Bon développement ! 🚀**

