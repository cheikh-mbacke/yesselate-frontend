import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/validation-bc/alerts
 * 
 * Récupère les alertes et anomalies pour les bons de commande
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock alerts data
    const alerts = [
      {
        id: 'ALERT-001',
        type: 'anomaly',
        priority: 'critical',
        title: 'Montant anormalement élevé',
        message: 'Le BC-2026-0045 présente un montant supérieur à 150% de la moyenne',
        documentId: 'BC-2026-0045',
        documentType: 'bc',
        bureau: 'DRE',
        amount: 45000000,
        averageAmount: 28000000,
        createdAt: '2026-01-10T09:00:00Z',
        status: 'pending',
        suggestedAction: 'Vérification approfondie recommandée',
      },
      {
        id: 'ALERT-002',
        type: 'sla_warning',
        priority: 'high',
        title: 'Délai SLA dépassé',
        message: 'Le BC-2026-0042 dépasse le SLA de validation (72h)',
        documentId: 'BC-2026-0042',
        documentType: 'bc',
        bureau: 'DAAF',
        slaDueAt: '2026-01-08T17:00:00Z',
        slaHoursOverdue: 48,
        createdAt: '2026-01-10T08:30:00Z',
        status: 'pending',
        suggestedAction: 'Traitement prioritaire requis',
      },
      {
        id: 'ALERT-003',
        type: 'duplicate_warning',
        priority: 'medium',
        title: 'Possible doublon détecté',
        message: 'La facture FAC-2026-0089 ressemble à FAC-2026-0072',
        documentId: 'FAC-2026-0089',
        documentType: 'facture',
        duplicateOfId: 'FAC-2026-0072',
        similarity: 0.87,
        createdAt: '2026-01-10T07:45:00Z',
        status: 'pending',
        suggestedAction: 'Comparaison manuelle recommandée',
      },
      {
        id: 'ALERT-004',
        type: 'budget_warning',
        priority: 'high',
        title: 'Dépassement budgétaire',
        message: 'L\'engagement BC-2026-0051 dépasse le budget disponible',
        documentId: 'BC-2026-0051',
        documentType: 'bc',
        bureau: 'DSI',
        requestedAmount: 12000000,
        availableBudget: 8500000,
        createdAt: '2026-01-09T16:30:00Z',
        status: 'pending',
        suggestedAction: 'Révision budgétaire nécessaire',
      },
      {
        id: 'ALERT-005',
        type: 'compliance',
        priority: 'critical',
        title: 'Non-conformité réglementaire',
        message: 'BC-2026-0038 sans visa DAF obligatoire pour ce montant',
        documentId: 'BC-2026-0038',
        documentType: 'bc',
        bureau: 'DRE',
        complianceRule: 'VISA_DAF_15M',
        createdAt: '2026-01-09T14:00:00Z',
        status: 'pending',
        suggestedAction: 'Obtenir le visa DAF avant validation',
      },
    ];

    let filtered = alerts;
    if (priority) {
      filtered = alerts.filter(a => a.priority === priority);
    }

    return NextResponse.json({
      success: true,
      data: filtered.slice(0, limit),
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.priority === 'critical').length,
        high: alerts.filter(a => a.priority === 'high').length,
        medium: alerts.filter(a => a.priority === 'medium').length,
        byType: {
          anomaly: alerts.filter(a => a.type === 'anomaly').length,
          sla_warning: alerts.filter(a => a.type === 'sla_warning').length,
          duplicate_warning: alerts.filter(a => a.type === 'duplicate_warning').length,
          budget_warning: alerts.filter(a => a.type === 'budget_warning').length,
          compliance: alerts.filter(a => a.type === 'compliance').length,
        },
      },
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur récupération alertes BC:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/validation-bc/alerts
 * 
 * Créer une alerte manuellement
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, type, priority, message } = body;

    if (!documentId || !type || !message) {
      return NextResponse.json(
        { error: 'documentId, type et message sont requis' },
        { status: 400 }
      );
    }

    const newAlert = {
      id: `ALERT-${Date.now()}`,
      type,
      priority: priority || 'medium',
      title: `Alerte manuelle: ${type}`,
      message,
      documentId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      createdBy: 'user', // TODO: Récupérer depuis session
    };

    return NextResponse.json({
      success: true,
      data: newAlert,
    });
  } catch (error) {
    console.error('Erreur création alerte:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

