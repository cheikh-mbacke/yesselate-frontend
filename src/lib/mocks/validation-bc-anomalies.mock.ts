/**
 * Mock Data pour Anomalies et Annotations - Validation BC
 * 
 * Fichier centralisé contenant des données réalistes et complètes
 * pour le développement et les tests.
 * 
 * Ces mocks peuvent être facilement remplacés par de vraies API calls
 * en modifiant les routes API dans app/api/validation-bc/documents/[id]/
 */

import type {
  DocumentAnomaly,
  DocumentAnnotation,
  DocumentType,
  AnomalyType,
  AnomalySeverity,
} from '@/lib/types/document-validation.types';

/**
 * Génère des mock anomalies pour un document
 * 
 * @param documentId - ID du document
 * @param documentType - Type de document (bc, facture, avenant)
 * @param options - Options pour personnaliser les anomalies générées
 * @returns Tableau d'anomalies
 */
export function generateMockAnomalies(
  documentId: string,
  documentType: DocumentType = 'bc',
  options?: {
    count?: number;
    includeResolved?: boolean;
    severityFilter?: AnomalySeverity[];
  }
): DocumentAnomaly[] {
  const count = options?.count ?? 5;
  const includeResolved = options?.includeResolved ?? true;
  const severityFilter = options?.severityFilter;

  const baseAnomalies: Array<{
    field: string;
    type: AnomalyType;
    severity: AnomalySeverity;
    message: string;
    hoursAgo: number;
    resolved?: boolean;
  }> = [
    {
      field: 'montant_ttc',
      type: 'montant_ttc_incorrect',
      severity: 'critical',
      message: 'Le montant TTC (15 450 €) ne correspond pas à HT + TVA (15 230 €). Différence: 220 €',
      hoursAgo: 2,
      resolved: false,
    },
    {
      field: 'date_limite',
      type: 'date_invalide',
      severity: 'warning',
      message: 'Date limite de paiement (15/01/2024) inférieure à la date d\'émission (20/01/2024)',
      hoursAgo: 5,
      resolved: false,
    },
    {
      field: 'tva',
      type: 'tva_incorrecte',
      severity: 'warning',
      message: 'Taux de TVA (20%) ne correspond pas au taux standard (18%)',
      hoursAgo: 12,
      resolved: true,
    },
    {
      field: 'fournisseur',
      type: 'fournisseur_incorrect',
      severity: 'error',
      message: 'Fournisseur "ACME Corp" non trouvé dans la base de données',
      hoursAgo: 24,
      resolved: false,
    },
    {
      field: 'projet',
      type: 'depassement_budget',
      severity: 'critical',
      message: 'Montant du BC (250 000 €) dépasse le budget restant du projet (180 000 €)',
      hoursAgo: 3,
      resolved: false,
    },
    {
      field: 'reference',
      type: 'reference_manquante',
      severity: 'warning',
      message: 'Référence du document manquante ou incomplète',
      hoursAgo: 8,
      resolved: false,
    },
    {
      field: 'montant_ht',
      type: 'montant_ht_incorrect',
      severity: 'error',
      message: 'Montant HT incohérent avec les lignes de détail',
      hoursAgo: 6,
      resolved: false,
    },
    {
      field: 'quantite',
      type: 'quantite_incorrecte',
      severity: 'warning',
      message: 'Quantité totale (150) ne correspond pas à la somme des lignes (148)',
      hoursAgo: 4,
      resolved: false,
    },
  ];

  // Filtrer selon les options
  let filtered = baseAnomalies.slice(0, count);
  
  if (severityFilter) {
    filtered = filtered.filter(a => severityFilter.includes(a.severity));
  }
  
  if (!includeResolved) {
    filtered = filtered.filter(a => !a.resolved);
  }

  // Générer les anomalies avec IDs et timestamps
  return filtered.map((base, index) => {
    const detectedAt = new Date(Date.now() - base.hoursAgo * 60 * 60 * 1000);
    const resolved = base.resolved ?? false;
    
    return {
      id: `ANO-${documentId}-${String(index + 1).padStart(3, '0')}`,
      field: base.field,
      type: base.type,
      severity: base.severity,
      message: base.message,
      detectedAt: detectedAt.toISOString(),
      detectedBy: 'BMO-AUDIT-SYSTEM',
      resolved,
      ...(resolved && {
        resolvedAt: new Date(detectedAt.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        resolvedBy: 'Jean Dupont',
      }),
    };
  });
}

/**
 * Génère des mock annotations pour un document
 * 
 * @param documentId - ID du document
 * @param documentType - Type de document (bc, facture, avenant)
 * @param anomalyIds - IDs des anomalies existantes pour lier les annotations
 * @param options - Options pour personnaliser les annotations générées
 * @returns Tableau d'annotations
 */
export function generateMockAnnotations(
  documentId: string,
  documentType: DocumentType = 'bc',
  anomalyIds: string[] = [],
  options?: {
    count?: number;
    includeTypes?: Array<'comment' | 'correction' | 'approval' | 'rejection'>;
  }
): DocumentAnnotation[] {
  const count = options?.count ?? 3;
  const includeTypes = options?.includeTypes ?? ['comment', 'correction', 'approval'];

  const baseAnnotations: Array<{
    field?: string;
    comment: string;
    type: 'comment' | 'correction' | 'approval' | 'rejection';
    hoursAgo: number;
    createdBy: string;
    linkToAnomaly?: boolean;
  }> = [
    {
      field: 'montant_ttc',
      comment: 'Montant corrigé après vérification avec le fournisseur. Le montant TTC correct est 15 230 €',
      type: 'correction',
      hoursAgo: 1,
      createdBy: 'Jean Dupont',
      linkToAnomaly: true,
    },
    {
      field: 'date_limite',
      comment: 'Date limite corrigée. Nouvelle date: 25/01/2024',
      type: 'correction',
      hoursAgo: 4,
      createdBy: 'Marie Martin',
      linkToAnomaly: true,
    },
    {
      comment: 'Document validé après correction des anomalies critiques',
      type: 'approval',
      hoursAgo: 0.5,
      createdBy: 'Jean Dupont',
      linkToAnomaly: false,
    },
    {
      field: 'tva',
      comment: 'Le taux de TVA de 20% est justifié par une exception contractuelle. Voir clause 5.2 du contrat.',
      type: 'comment',
      hoursAgo: 10,
      createdBy: 'Pierre Durand',
      linkToAnomaly: true,
    },
    {
      field: 'projet',
      comment: 'Budget supplémentaire accordé par le DG. Décision D-2024-015',
      type: 'comment',
      hoursAgo: 2,
      createdBy: 'Amadou Diallo',
      linkToAnomaly: true,
    },
    {
      comment: 'Document refusé en raison de multiples anomalies non corrigées',
      type: 'rejection',
      hoursAgo: 1,
      createdBy: 'Sophie Bernard',
      linkToAnomaly: false,
    },
  ];

  // Filtrer selon les types demandés
  const filtered = baseAnnotations
    .filter(a => includeTypes.includes(a.type))
    .slice(0, count);

  // Générer les annotations avec IDs et timestamps
  return filtered.map((base, index) => {
    const createdAt = new Date(Date.now() - base.hoursAgo * 60 * 60 * 1000);
    const anomalyId = base.linkToAnomaly && anomalyIds.length > 0
      ? anomalyIds[index % anomalyIds.length]
      : undefined;

    return {
      id: `ANN-${documentId}-${String(index + 1).padStart(3, '0')}`,
      documentId,
      documentType,
      field: base.field,
      comment: base.comment,
      anomalyId,
      createdBy: base.createdBy,
      createdAt: createdAt.toISOString(),
      type: base.type,
    };
  });
}

/**
 * Mock data par défaut pour un document
 * Combine anomalies et annotations avec des IDs cohérents
 * 
 * @param documentId - ID du document
 * @param documentType - Type de document
 * @returns Objet contenant anomalies et annotations
 */
export function getMockDataForDocument(
  documentId: string,
  documentType: DocumentType = 'bc'
): {
  anomalies: DocumentAnomaly[];
  annotations: DocumentAnnotation[];
} {
  const anomalies = generateMockAnomalies(documentId, documentType, {
    count: 5,
    includeResolved: true,
  });

  const anomalyIds = anomalies.map(a => a.id);
  const annotations = generateMockAnnotations(documentId, documentType, anomalyIds, {
    count: 3,
    includeTypes: ['comment', 'correction', 'approval'],
  });

  return {
    anomalies,
    annotations,
  };
}

/**
 * Exports de données statiques pour utilisation directe
 * (pour backward compatibility avec les routes API existantes)
 */

/**
 * Anomalies mock statiques
 * Utilisez generateMockAnomalies() pour des données dynamiques
 */
export const mockAnomalies: DocumentAnomaly[] = [
  {
    id: 'ANO-STATIC-001',
    field: 'montant_ttc',
    type: 'montant_ttc_incorrect',
    severity: 'critical',
    message: 'Le montant TTC (15 450 €) ne correspond pas à HT + TVA (15 230 €). Différence: 220 €',
    detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    detectedBy: 'BMO-AUDIT-SYSTEM',
    resolved: false,
  },
  {
    id: 'ANO-STATIC-002',
    field: 'date_limite',
    type: 'date_invalide',
    severity: 'warning',
    message: 'Date limite de paiement (15/01/2024) inférieure à la date d\'émission (20/01/2024)',
    detectedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    detectedBy: 'BMO-AUDIT-SYSTEM',
    resolved: false,
  },
  {
    id: 'ANO-STATIC-003',
    field: 'tva',
    type: 'tva_incorrecte',
    severity: 'warning',
    message: 'Taux de TVA (20%) ne correspond pas au taux standard (18%)',
    detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    detectedBy: 'BMO-AUDIT-SYSTEM',
    resolved: true,
    resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    resolvedBy: 'Jean Dupont',
  },
  {
    id: 'ANO-STATIC-004',
    field: 'fournisseur',
    type: 'fournisseur_incorrect',
    severity: 'error',
    message: 'Fournisseur "ACME Corp" non trouvé dans la base de données',
    detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    detectedBy: 'BMO-AUDIT-SYSTEM',
    resolved: false,
  },
  {
    id: 'ANO-STATIC-005',
    field: 'projet',
    type: 'depassement_budget',
    severity: 'critical',
    message: 'Montant du BC (250 000 €) dépasse le budget restant du projet (180 000 €)',
    detectedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    detectedBy: 'BMO-AUDIT-SYSTEM',
    resolved: false,
  },
];

/**
 * Annotations mock statiques
 * Utilisez generateMockAnnotations() pour des données dynamiques
 */
export const mockAnnotations: DocumentAnnotation[] = [
  {
    id: 'ANN-STATIC-001',
    documentId: 'BC-STATIC-001',
    documentType: 'bc',
    field: 'montant_ttc',
    comment: 'Montant corrigé après vérification avec le fournisseur. Le montant TTC correct est 15 230 €',
    anomalyId: 'ANO-STATIC-001',
    createdBy: 'Jean Dupont',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    type: 'correction',
  },
  {
    id: 'ANN-STATIC-002',
    documentId: 'BC-STATIC-001',
    documentType: 'bc',
    field: 'date_limite',
    comment: 'Date limite corrigée. Nouvelle date: 25/01/2024',
    anomalyId: 'ANO-STATIC-002',
    createdBy: 'Marie Martin',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    type: 'correction',
  },
  {
    id: 'ANN-STATIC-003',
    documentId: 'BC-STATIC-001',
    documentType: 'bc',
    comment: 'Document validé après correction des anomalies critiques',
    createdBy: 'Jean Dupont',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    type: 'approval',
  },
];

