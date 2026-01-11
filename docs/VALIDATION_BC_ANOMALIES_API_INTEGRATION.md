# 🔌 INTÉGRATION API - Anomalies & Annotations Validation BC

**Date**: Documentation d'intégration  
**APIs**: `validationBCAnomaliesAPI`, React Query Hooks  
**Status**: ✅ Service API créé | ✅ Hooks React Query créés | ✅ Routes API créées

---

## 📦 FICHIERS CRÉÉS

### **1. Service API**
- **Fichier**: `src/lib/services/validation-bc-anomalies.service.ts`
- **Exports**: `validationBCAnomaliesAPI`, types (CreateAnnotationDto, UpdateAnnotationDto, ResolveAnomalyDto)

### **2. Hooks React Query**
- **Fichier**: `src/lib/api/hooks/useValidationBCAnomalies.ts`
- **Exports**: 
  - `useAnomalies(documentId, options?)`
  - `useAnnotations(documentId, options?)`
  - `useResolveAnomaly()`
  - `useCreateAnnotation()`
  - `useUpdateAnnotation()`
  - `useDeleteAnnotation()`
  - `validationBCAnomaliesKeys` (query keys)

### **3. Routes API**
- **GET** `/api/validation-bc/documents/[documentId]/anomalies` - Récupère les anomalies
- **GET** `/api/validation-bc/documents/[documentId]/annotations` - Récupère les annotations
- **POST** `/api/validation-bc/anomalies/[anomalyId]/resolve` - Résout une anomalie
- **POST** `/api/validation-bc/annotations` - Crée une annotation
- **PATCH** `/api/validation-bc/annotations/[id]` - Met à jour une annotation
- **DELETE** `/api/validation-bc/annotations/[id]` - Supprime une annotation

---

## 🚀 UTILISATION

### **Option 1: Utilisation avec React Query (Recommandé)**

```typescript
import {
  useAnomalies,
  useAnnotations,
  useResolveAnomaly,
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
} from '@/lib/api/hooks/useValidationBCAnomalies';
import { useBMOStore } from '@/lib/stores';

function MyComponent({ documentId }: { documentId: string }) {
  const { addToast } = useBMOStore();

  // Récupérer les anomalies
  const { data: anomalies = [], isLoading: anomaliesLoading, error: anomaliesError } = useAnomalies(documentId);

  // Récupérer les annotations
  const { data: annotations = [], isLoading: annotationsLoading } = useAnnotations(documentId);

  // Mutations
  const resolveAnomaly = useResolveAnomaly();
  const createAnnotation = useCreateAnnotation();
  const updateAnnotation = useUpdateAnnotation();
  const deleteAnnotation = useDeleteAnnotation();

  // Résoudre une anomalie
  const handleResolveAnomaly = async (anomalyId: string, comment?: string) => {
    try {
      await resolveAnomaly.mutateAsync({ anomalyId, comment });
      addToast('Anomalie résolue avec succès', 'success');
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de la résolution', 'error');
    }
  };

  // Créer une annotation
  const handleCreateAnnotation = async (data: CreateAnnotationDto) => {
    try {
      await createAnnotation.mutateAsync(data);
      addToast('Annotation créée avec succès', 'success');
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de la création', 'error');
    }
  };

  // Mettre à jour une annotation
  const handleUpdateAnnotation = async (id: string, comment: string) => {
    try {
      await updateAnnotation.mutateAsync({ id, comment });
      addToast('Annotation mise à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de la mise à jour', 'error');
    }
  };

  // Supprimer une annotation
  const handleDeleteAnnotation = async (id: string, documentId: string) => {
    try {
      await deleteAnnotation.mutateAsync({ id, documentId });
      addToast('Annotation supprimée avec succès', 'success');
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  if (anomaliesLoading || annotationsLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      {/* Votre UI ici */}
    </div>
  );
}
```

### **Option 2: Utilisation avec Props (Compatibilité existante)**

Le composant `AnomalyAnnotationPanel` accepte toujours les props pour compatibilité:

```typescript
<AnomalyAnnotationPanel
  documentId={documentId}
  documentType={documentType}
  anomalies={anomalies}
  annotations={annotations}
  onAddAnnotation={(annotation) => {
    // Utiliser createAnnotation.mutateAsync(annotation)
  }}
  onResolveAnomaly={(anomalyId) => {
    // Utiliser resolveAnomaly.mutateAsync({ anomalyId })
  }}
  onUpdateAnnotation={(id, comment) => {
    // Utiliser updateAnnotation.mutateAsync({ id, comment })
  }}
  onDeleteAnnotation={(id) => {
    // Utiliser deleteAnnotation.mutateAsync({ id, documentId })
  }}
/>
```

---

## 🔧 MIGRATION PROGRESSIVE

### **Étape 1: Intégrer les hooks dans le parent**

```typescript
// Dans EnhancedDocumentDetailsModal ou le parent
import {
  useAnomalies,
  useAnnotations,
  useResolveAnomaly,
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
} from '@/lib/api/hooks/useValidationBCAnomalies';

function EnhancedDocumentDetailsModal({ document }: Props) {
  // Utiliser React Query pour charger les données
  const { data: anomalies = [] } = useAnomalies(document.id);
  const { data: annotations = [] } = useAnnotations(document.id);

  // Mutations
  const resolveAnomaly = useResolveAnomaly();
  const createAnnotation = useCreateAnnotation();
  const updateAnnotation = useUpdateAnnotation();
  const deleteAnnotation = useDeleteAnnotation();

  // Passer les données et handlers au composant
  return (
    <AnomalyAnnotationPanel
      documentId={document.id}
      documentType={documentType}
      anomalies={anomalies}
      annotations={annotations}
      onAddAnnotation={async (annotation) => {
        await createAnnotation.mutateAsync(annotation);
      }}
      onResolveAnomaly={async (anomalyId) => {
        await resolveAnomaly.mutateAsync({ anomalyId });
      }}
      onUpdateAnnotation={async (id, comment) => {
        await updateAnnotation.mutateAsync({ id, comment });
      }}
      onDeleteAnnotation={async (id) => {
        await deleteAnnotation.mutateAsync({ id, documentId: document.id });
      }}
    />
  );
}
```

### **Étape 2: Intégrer directement dans AnomalyAnnotationPanel (Futur)**

Pour une intégration complète, modifier `AnomalyAnnotationPanel` pour utiliser React Query directement:

```typescript
// Dans AnomalyAnnotationPanel.tsx
import {
  useAnomalies,
  useAnnotations,
  useResolveAnomaly,
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
} from '@/lib/api/hooks/useValidationBCAnomalies';

export function AnomalyAnnotationPanel({
  documentId,
  documentType,
  // Props optionnelles pour compatibilité
  anomalies: propsAnomalies,
  annotations: propsAnnotations,
  onAddAnnotation: propsOnAddAnnotation,
  onResolveAnomaly: propsOnResolveAnomaly,
  onUpdateAnnotation: propsOnUpdateAnnotation,
  onDeleteAnnotation: propsOnDeleteAnnotation,
}: AnomalyAnnotationPanelProps) {
  // Utiliser React Query si documentId est fourni
  const useReactQuery = !!documentId && !propsAnomalies && !propsAnnotations;

  const { data: queryAnomalies = [] } = useAnomalies(documentId, {
    enabled: useReactQuery,
  });
  const { data: queryAnnotations = [] } = useAnnotations(documentId, {
    enabled: useReactQuery,
  });

  // Utiliser les données de React Query ou les props
  const anomalies = useReactQuery ? queryAnomalies : (propsAnomalies || []);
  const annotations = useReactQuery ? queryAnnotations : (propsAnnotations || []);

  // Mutations
  const resolveAnomaly = useResolveAnomaly();
  const createAnnotation = useCreateAnnotation();
  const updateAnnotation = useUpdateAnnotation();
  const deleteAnnotation = useDeleteAnnotation();

  // Handlers qui utilisent React Query ou les callbacks
  const handleResolveAnomaly = async (anomalyId: string) => {
    if (useReactQuery) {
      await resolveAnomaly.mutateAsync({ anomalyId });
    } else if (propsOnResolveAnomaly) {
      await propsOnResolveAnomaly(anomalyId);
    }
  };

  // ... autres handlers similaires
}
```

---

## 📝 TYPES

```typescript
import type {
  CreateAnnotationDto,
  UpdateAnnotationDto,
  ResolveAnomalyDto,
} from '@/lib/services/validation-bc-anomalies.service';

import type {
  DocumentAnomaly,
  DocumentAnnotation,
} from '@/lib/types/document-validation.types';
```

---

## 🎯 QUERY KEYS

Les query keys sont exportées pour invalidation manuelle si nécessaire:

```typescript
import { validationBCAnomaliesKeys } from '@/lib/api/hooks/useValidationBCAnomalies';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalider toutes les anomalies d'un document
queryClient.invalidateQueries({
  queryKey: validationBCAnomaliesKeys.list(documentId),
});

// Invalider toutes les annotations d'un document
queryClient.invalidateQueries({
  queryKey: validationBCAnomaliesKeys.annotations.list(documentId),
});
```

---

## ⚠️ NOTES IMPORTANTES

1. **Cache**: React Query gère automatiquement le cache (staleTime: 30s)
2. **Invalidation**: Les mutations invalident automatiquement les queries concernées
3. **Loading States**: Les hooks retournent `isLoading`, `isError`, `error`
4. **Optimistic Updates**: Non implémentés pour l'instant (peuvent être ajoutés plus tard)
5. **Mock Data**: Les routes API retournent des mock data pour développement

---

## 🔄 PROCHAINES ÉTAPES

1. ✅ Service API créé
2. ✅ Hooks React Query créés
3. ✅ Routes API créées
4. ⚠️ Intégrer dans `EnhancedDocumentDetailsModal` (recommandé)
5. ⚠️ Ajouter gestion d'erreurs réseau (retry, fallback)
6. ⚠️ Ajouter optimistic updates (optionnel)
7. ⚠️ Remplacer mock data par vraies requêtes DB

---

*Documentation créée le: [Date]*  
*Prochaine mise à jour: Après intégration dans composants*

