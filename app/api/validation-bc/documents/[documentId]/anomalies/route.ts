import { NextRequest, NextResponse } from 'next/server';
import type { DocumentAnomaly } from '@/lib/types/document-validation.types';

/**
 * GET /api/validation-bc/documents/[documentId]/anomalies
 * Récupère toutes les anomalies d'un document
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;

    // TODO: Remplacer par une vraie requête à la base de données
    // Mock data pour développement
    const mockAnomalies: DocumentAnomaly[] = [
      {
        id: `ANO-${documentId}-001`,
        field: 'montant_ttc',
        type: 'amount_mismatch',
        severity: 'critical',
        message: 'Le montant TTC (15 450 €) ne correspond pas à HT + TVA (15 230 €). Différence: 220 €',
        detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        detectedBy: 'BMO-AUDIT-SYSTEM',
        resolved: false,
      },
      {
        id: `ANO-${documentId}-002`,
        field: 'date_limite',
        type: 'date_invalid',
        severity: 'warning',
        message: 'Date limite de paiement (15/01/2024) inférieure à la date d\'émission (20/01/2024)',
        detectedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        detectedBy: 'BMO-AUDIT-SYSTEM',
        resolved: false,
      },
      {
        id: `ANO-${documentId}-003`,
        field: 'tva',
        type: 'vat_rate_invalid',
        severity: 'warning',
        message: 'Taux de TVA (20%) ne correspond pas au taux standard (18%)',
        detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        detectedBy: 'BMO-AUDIT-SYSTEM',
        resolved: true,
        resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        resolvedBy: 'Jean Dupont',
      },
    ];

    return NextResponse.json(mockAnomalies);
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anomalies' },
      { status: 500 }
    );
  }
}

