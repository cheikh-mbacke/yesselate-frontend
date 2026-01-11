# 📊 MOCK DATA - Validation BC Anomalies & Annotations

**Fichier**: `src/lib/mocks/validation-bc-anomalies.mock.ts`  
**Status**: ✅ Créé

---

## 📋 Vue d'ensemble

Ce fichier centralise tous les mock data pour les anomalies et annotations de la validation BC. Il fournit des fonctions pour générer des données réalistes et complètes, ainsi que des données statiques pour une utilisation directe.

---

## 🎯 Fonctions Principales

### **1. `generateMockAnomalies()`**

Génère des anomalies mock pour un document donné.

```typescript
const anomalies = generateMockAnomalies('BC-2024-001', 'bc', {
  count: 5,                    // Nombre d'anomalies
  includeResolved: true,       // Inclure les anomalies résolues
  severityFilter: ['critical', 'error'],  // Filtrer par sévérité
});
```

**Paramètres:**
- `documentId`: ID du document (string)
- `documentType`: Type de document (`'bc' | 'facture' | 'avenant'`)
- `options` (optionnel):
  - `count`: Nombre d'anomalies à générer (défaut: 5)
  - `includeResolved`: Inclure les anomalies résolues (défaut: true)
  - `severityFilter`: Filtrer par sévérité (défaut: toutes)

**Retourne:** `DocumentAnomaly[]`

### **2. `generateMockAnnotations()`**

Génère des annotations mock pour un document donné.

```typescript
const annotations = generateMockAnnotations('BC-2024-001', 'bc', ['ANO-001', 'ANO-002'], {
  count: 3,
  includeTypes: ['comment', 'correction', 'approval'],
});
```

**Paramètres:**
- `documentId`: ID du document (string)
- `documentType`: Type de document (`'bc' | 'facture' | 'avenant'`)
- `anomalyIds`: IDs des anomalies existantes pour lier les annotations (string[])
- `options` (optionnel):
  - `count`: Nombre d'annotations à générer (défaut: 3)
  - `includeTypes`: Types d'annotations à inclure (défaut: tous)

**Retourne:** `DocumentAnnotation[]`

### **3. `getMockDataForDocument()`**

Combine anomalies et annotations avec des IDs cohérents.

```typescript
const { anomalies, annotations } = getMockDataForDocument('BC-2024-001', 'bc');
```

**Paramètres:**
- `documentId`: ID du document (string)
- `documentType`: Type de document (défaut: 'bc')

**Retourne:** `{ anomalies: DocumentAnomaly[], annotations: DocumentAnnotation[] }`

---

## 📦 Exports Statiques

### **`mockAnomalies`**

Anomalies mock statiques (5 exemples).

```typescript
import { mockAnomalies } from '@/lib/mocks/validation-bc-anomalies.mock';
```

### **`mockAnnotations`**

Annotations mock statiques (3 exemples).

```typescript
import { mockAnnotations } from '@/lib/mocks/validation-bc-anomalies.mock';
```

---

## 🔧 Utilisation dans les Routes API

### **Exemple 1: Route GET /api/validation-bc/documents/[id]/anomalies**

```typescript
import { generateMockAnomalies } from '@/lib/mocks/validation-bc-anomalies.mock';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await params;
  
  // Générer des anomalies dynamiques
  const anomalies = generateMockAnomalies(documentId, 'bc', {
    count: 5,
    includeResolved: true,
  });
  
  return NextResponse.json(anomalies);
}
```

### **Exemple 2: Route GET /api/validation-bc/documents/[id]/annotations**

```typescript
import { generateMockAnnotations, generateMockAnomalies } from '@/lib/mocks/validation-bc-anomalies.mock';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await params;
  
  // Générer des annotations avec liens vers anomalies
  const anomalies = generateMockAnomalies(documentId);
  const anomalyIds = anomalies.map(a => a.id);
  const annotations = generateMockAnnotations(documentId, 'bc', anomalyIds);
  
  return NextResponse.json(annotations);
}
```

### **Exemple 3: Utiliser getMockDataForDocument()**

```typescript
import { getMockDataForDocument } from '@/lib/mocks/validation-bc-anomalies.mock';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await params;
  
  // Récupérer anomalies et annotations avec IDs cohérents
  const { anomalies, annotations } = getMockDataForDocument(documentId, 'bc');
  
  // Utiliser les données...
  return NextResponse.json({ anomalies, annotations });
}
```

---

## 📊 Types d'Anomalies Disponibles

Le fichier utilise les types définis dans `AnomalyType`:

- `montant_ttc_incorrect` - Montant TTC incorrect
- `date_invalide` - Date invalide
- `tva_incorrecte` - TVA incorrecte
- `fournisseur_incorrect` - Fournisseur incorrect
- `depassement_budget` - Dépassement de budget
- `reference_manquante` - Référence manquante
- `montant_ht_incorrect` - Montant HT incorrect
- `quantite_incorrecte` - Quantité incorrecte
- Et autres types définis dans `document-validation.types.ts`

---

## 📊 Types d'Annotations Disponibles

- `comment` - Commentaire simple
- `correction` - Correction d'anomalie
- `approval` - Approbation
- `rejection` - Rejet

---

## 🎯 Avantages

1. **Centralisé**: Tous les mock data au même endroit
2. **Réaliste**: Données cohérentes avec dates, IDs, et relations
3. **Flexible**: Fonctions paramétrables pour différents cas d'usage
4. **Maintenable**: Facile à modifier et étendre
5. **Type-safe**: Utilise les types TypeScript existants
6. **Facilement remplaçable**: Les routes API peuvent facilement utiliser de vraies API calls

---

## 🔄 Migration vers de Vraies API

Pour remplacer les mocks par de vraies API calls:

1. **Dans les routes API**, remplacer:
   ```typescript
   const anomalies = generateMockAnomalies(documentId);
   ```
   
   Par:
   ```typescript
   const anomalies = await prisma.anomaly.findMany({
     where: { documentId },
   });
   ```

2. **Les types restent identiques**, donc pas de changement dans les composants

3. **Les fonctions mock peuvent être conservées** pour les tests

---

## 📝 Exemples d'Utilisation

### **Générer des anomalies non résolues uniquement**

```typescript
const unresolvedAnomalies = generateMockAnomalies('BC-001', 'bc', {
  includeResolved: false,
});
```

### **Générer uniquement des anomalies critiques**

```typescript
const criticalAnomalies = generateMockAnomalies('BC-001', 'bc', {
  severityFilter: ['critical'],
});
```

### **Générer des annotations de correction uniquement**

```typescript
const corrections = generateMockAnnotations('BC-001', 'bc', ['ANO-001'], {
  includeTypes: ['correction'],
});
```

---

*Fichier créé le: [Date]*  
*Dernière mise à jour: [Date]*

