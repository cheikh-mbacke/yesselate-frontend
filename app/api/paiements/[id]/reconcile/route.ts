// API Route: POST /api/paiements/[id]/reconcile
// Rapprochement bancaire - Confirme l'exécution effective du paiement
// ⭐ UNIQUE à Paiements (n'existe pas dans ValidationBC)

import { NextRequest, NextResponse } from 'next/server';

export interface ReconcilePaiementBody {
  executionDate: string; // Date réelle d'exécution (du relevé bancaire)
  bankReference: string; // Référence banque/transaction
  bankStatementLine?: number; // Numéro de ligne sur relevé
  actualAmount?: number; // Montant réel (si différent du prévu, ex: frais)
  fees?: number; // Frais bancaires
  exchangeRate?: number; // Taux de change si devise étrangère
  reconciledBy: string; // ID de l'utilisateur qui fait le rapprochement
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>; // Scan relevé bancaire, etc.
  comment?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: ReconcilePaiementBody = await request.json();

    // Validations
    if (!body.executionDate || !body.bankReference) {
      return NextResponse.json(
        { error: 'executionDate and bankReference are required' },
        { status: 400 }
      );
    }

    // TODO: Récupérer paiement
    const existingPaiement = {
      id,
      status: 'executed',
      montant: 10000000,
      fournisseur: 'SENELEC',
      bankAccount: 'default',
    };

    if (!existingPaiement) {
      return NextResponse.json(
        { error: 'Paiement not found' },
        { status: 404 }
      );
    }

    // Vérifier que le paiement peut être rapproché
    if (existingPaiement.status !== 'executed') {
      return NextResponse.json(
        { error: 'Paiement must be executed before reconciliation' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permissions (comptable ou admin)

    // Vérifier cohérence montant
    const actualAmount = body.actualAmount || existingPaiement.montant;
    const difference = actualAmount - existingPaiement.montant;
    
    if (Math.abs(difference) > 1000 && !body.fees) {
      return NextResponse.json(
        { 
          error: 'Amount difference too large without fees explanation',
          difference,
          expected: existingPaiement.montant,
          actual: actualAmount,
        },
        { status: 400 }
      );
    }

    const totalWithFees = actualAmount + (body.fees || 0);
    const reconciliationDate = new Date().toISOString();

    // TODO: Mettre à jour paiement en DB
    // await prisma.paiement.update({
    //   where: { id },
    //   data: {
    //     status: 'reconciled',
    //     reconciledAt: reconciliationDate,
    //     reconciledBy: body.reconciledBy,
    //     bankReference: body.bankReference,
    //     bankStatementLine: body.bankStatementLine,
    //     actualAmount,
    //     fees: body.fees,
    //     exchangeRate: body.exchangeRate,
    //   }
    // });

    // TODO: Créer entrée comptable
    // TODO: Mettre à jour solde trésorerie
    // TODO: Créer timeline entry
    // TODO: Notifier comptabilité et trésorier
    // TODO: Uploader attachments (relevé bancaire)
    // TODO: Si différence, créer alerte pour investigation

    const reconciledPaiement = {
      id,
      status: 'reconciled',
      reconciledAt: reconciliationDate,
      reconciledBy: body.reconciledBy,
      executionDate: body.executionDate,
      bankReference: body.bankReference,
      bankStatementLine: body.bankStatementLine,
      montantPrevu: existingPaiement.montant,
      montantReel: actualAmount,
      fees: body.fees || 0,
      total: totalWithFees,
      difference,
      exchangeRate: body.exchangeRate,
      attachments: body.attachments || [],
      comment: body.comment,
      needsInvestigation: Math.abs(difference) > 100,
    };

    console.log(`[paiements/${id}/reconcile] Paiement rapproché:`, {
      id,
      bankReference: body.bankReference,
      difference,
    });

    return NextResponse.json({
      success: true,
      message: 'Rapprochement bancaire effectué avec succès',
      paiement: reconciledPaiement,
      alerts: reconciledPaiement.needsInvestigation ? [
        {
          type: 'warning',
          message: `Différence de ${difference} FCFA détectée - Investigation requise`,
        }
      ] : [],
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[paiements/${id}/reconcile] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to reconcile paiement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET pour voir l'état du rapprochement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Récupérer données rapprochement
    const reconciliationData = {
      paiementId: id,
      status: 'reconciled',
      reconciledAt: '2024-01-20T14:30:00.000Z',
      reconciledBy: 'Jean Dupont',
      bankReference: 'TRX-2024-001234',
      bankStatementLine: 45,
      montantPrevu: 10000000,
      montantReel: 9995000,
      fees: 5000,
      difference: -5000,
      needsInvestigation: false,
      attachments: [
        {
          id: 'att-1',
          name: 'releve_bancaire_janvier.pdf',
          type: 'application/pdf',
          url: '/documents/releve_janvier.pdf',
          uploadedAt: '2024-01-20T14:30:00.000Z',
        }
      ],
    };

    return NextResponse.json(reconciliationData);
  } catch (error) {
    const { id } = await params;
    console.error(`[paiements/${id}/reconcile] Get error:`, error);
    return NextResponse.json(
      { error: 'Failed to get reconciliation data' },
      { status: 500 }
    );
  }
}

