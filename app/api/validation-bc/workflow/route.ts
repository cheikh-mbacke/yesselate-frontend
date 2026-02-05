import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/validation-bc/workflow
 * 
 * Récupère la configuration du workflow de validation
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentType = searchParams.get('type') || 'bc';

    // Configuration des workflows par type de document
    const workflows = {
      bc: {
        name: 'Workflow Bon de Commande',
        description: 'Validation des bons de commande selon le montant',
        steps: [
          {
            order: 1,
            name: 'Vérification technique',
            role: 'technical_reviewer',
            required: true,
            slaHours: 24,
            conditions: [],
          },
          {
            order: 2,
            name: 'Validation chef de service',
            role: 'service_manager',
            required: true,
            slaHours: 24,
            conditions: [],
          },
          {
            order: 3,
            name: 'Visa DAF',
            role: 'daf',
            required: false,
            slaHours: 48,
            conditions: [{ type: 'amount_gte', value: 15000000 }],
          },
          {
            order: 4,
            name: 'Approbation DG',
            role: 'dg',
            required: false,
            slaHours: 72,
            conditions: [{ type: 'amount_gte', value: 50000000 }],
          },
          {
            order: 5,
            name: 'Visa contrôleur financier',
            role: 'financial_controller',
            required: true,
            slaHours: 24,
            conditions: [],
          },
        ],
        thresholds: [
          { maxAmount: 5000000, requiredSteps: [1, 2, 5] },
          { maxAmount: 15000000, requiredSteps: [1, 2, 5] },
          { maxAmount: 50000000, requiredSteps: [1, 2, 3, 5] },
          { maxAmount: null, requiredSteps: [1, 2, 3, 4, 5] },
        ],
      },
      facture: {
        name: 'Workflow Facture',
        description: 'Validation des factures fournisseurs',
        steps: [
          {
            order: 1,
            name: 'Rapprochement BC',
            role: 'accountant',
            required: true,
            slaHours: 24,
            conditions: [],
          },
          {
            order: 2,
            name: 'Validation service réception',
            role: 'reception_service',
            required: true,
            slaHours: 24,
            conditions: [],
          },
          {
            order: 3,
            name: 'Visa comptabilité',
            role: 'accounting_manager',
            required: true,
            slaHours: 24,
            conditions: [],
          },
          {
            order: 4,
            name: 'Mise en paiement',
            role: 'payment_officer',
            required: true,
            slaHours: 48,
            conditions: [],
          },
        ],
        thresholds: [],
      },
      avenant: {
        name: 'Workflow Avenant',
        description: 'Validation des avenants de marché',
        steps: [
          {
            order: 1,
            name: 'Analyse technique',
            role: 'technical_reviewer',
            required: true,
            slaHours: 48,
            conditions: [],
          },
          {
            order: 2,
            name: 'Validation juridique',
            role: 'legal',
            required: true,
            slaHours: 48,
            conditions: [],
          },
          {
            order: 3,
            name: 'Visa DAF',
            role: 'daf',
            required: true,
            slaHours: 48,
            conditions: [],
          },
          {
            order: 4,
            name: 'Approbation autorité contractante',
            role: 'contracting_authority',
            required: true,
            slaHours: 72,
            conditions: [],
          },
        ],
        thresholds: [],
      },
    };

    const workflow = workflows[documentType as keyof typeof workflows] || workflows.bc;

    return NextResponse.json({
      success: true,
      data: {
        documentType,
        ...workflow,
      },
    });
  } catch (error) {
    console.error('Erreur récupération workflow:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/validation-bc/workflow
 * 
 * Avance un document dans le workflow
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, action, stepId, comment, decision } = body;

    if (!documentId || !action) {
      return NextResponse.json(
        { error: 'documentId et action sont requis' },
        { status: 400 }
      );
    }

    // Simuler l'avancement du workflow
    const result = {
      documentId,
      action,
      stepId,
      decision,
      previousStep: stepId,
      nextStep: decision === 'approved' ? (stepId || 0) + 1 : null,
      status: decision === 'approved' ? 'in_progress' : 'rejected',
      processedAt: new Date().toISOString(),
      processedBy: 'current_user', // TODO: Récupérer depuis session
      comment,
      notifications: [
        {
          type: 'email',
          recipient: 'next_validator@example.com',
          sent: true,
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Erreur workflow:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

