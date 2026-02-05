# Données Mockées - Module Demandes

## ✅ Données Mockées Créées

### Fichier: `src/modules/demandes/data/demandesMock.ts`

#### Contenu Mocké

1. **Demandes Mockées** (~40+ demandes):
   - ✅ En attente (Achats, Finance, Juridique)
   - ✅ Urgentes (Achats, Finance, Juridique)
   - ✅ En retard (Achats, Finance)
   - ✅ Validées (tous services)
   - ✅ Rejetées (tous services)
   - ✅ Avec références réalistes (BC-2024-XXXX, FAC-2024-XXXX, AVE-2024-XXXX)
   - ✅ Montants en XOF
   - ✅ Dates cohérentes
   - ✅ Priorités variées

2. **Statistiques Mockées**:
   - ✅ `mockStats`: Stats globales (total: 453, pending: 45, urgent: 12, etc.)
   - ✅ `mockServiceStats`: Stats par service (Achats, Finance, Juridique, RH)
   - ✅ `mockTrends`: Tendances 30 jours avec dates et statuts

3. **Fonctions Helper**:
   - ✅ `getDemandesByStatus(status)` - Filtre par statut
   - ✅ `getDemandesByService(service)` - Filtre par service
   - ✅ `getDemandesByStatusAndService(status, service)` - Filtre combiné
   - ✅ `getDemandeById(id)` - Trouve une demande par ID

## 🔄 Intégration dans l'API

### Fallback Automatique

Toutes les fonctions API utilisent automatiquement les mock data si:
- `NODE_ENV === 'development'` OU
- `NEXT_PUBLIC_API_URL` n'est pas défini

### Fonctions API avec Fallback

```typescript
// Exemple: getDemandes()
try {
  const response = await axios.get(API_BASE_URL, { params: filters });
  return response.data;
} catch (error) {
  // Fallback automatique sur mock data
  if (process.env.NODE_ENV === 'development') {
    const { mockDemandes } = await import('../data/demandesMock');
    // Filtre les mock data selon les filtres
    return filteredMockData;
  }
  throw error;
}
```

## 📊 Structure des Données Mockées

### Exemple de Demande Mockée

```typescript
{
  id: 'BC-2024-0892',
  reference: 'BC-2024-0892',
  title: 'BC Fournitures Bureau',
  description: 'Demande d\'achat de fournitures...',
  status: 'pending',
  priority: 'high',
  service: 'achats',
  montant: 12500000,
  createdBy: 'Mohamed Fall',
  createdAt: new Date(2024, 0, 15),
  updatedAt: new Date(2024, 0, 16),
  dueDate: new Date(2024, 1, 15),
}
```

### Statistiques

```typescript
mockStats = {
  total: 453,
  pending: 45,
  urgent: 12,
  validated: 378,
  rejected: 15,
  overdue: 8,
  avgResponseTime: 2.3, // heures
  approvalRate: 83, // %
  completionRate: 87, // %
  satisfactionScore: 4.2, // /5
}
```

### Stats par Service

```typescript
mockServiceStats = [
  { service: 'achats', total: 156, pending: 25, urgent: 6, ... },
  { service: 'finance', total: 198, pending: 15, urgent: 4, ... },
  { service: 'juridique', total: 45, pending: 5, urgent: 2, ... },
  { service: 'rh', total: 54, pending: 0, urgent: 0, ... },
]
```

## ✅ Avantages

1. **Développement**: Fonctionne sans backend
2. **Tests**: Données réalistes pour tester
3. **Fallback automatique**: Pas de modification nécessaire dans les hooks
4. **Type-safe**: Types TypeScript complets
5. **Cohérent**: Les stats correspondent aux données

## 🔧 Utilisation

Les données mockées sont utilisées automatiquement si l'API n'est pas disponible. Aucune modification nécessaire dans les composants ou hooks !

Les hooks React Query utiliseront les mock data en développement.

## 📝 Ajout de Données

Pour ajouter plus de données mockées, éditez `demandesMock.ts` :

```typescript
export const mockDemandes: Demande[] = [
  // Vos nouvelles demandes ici
  {
    id: generateId('BC'),
    reference: 'BC-2024-XXXX',
    // ...
  },
];
```

Tout est automatiquement disponible via les hooks et l'API !

