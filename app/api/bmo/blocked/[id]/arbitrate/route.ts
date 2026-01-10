// API Route: POST /api/bmo/blocked/[id]/arbitrate
// Arbitrage BMO - Décision définitive (pouvoir suprême)

import { NextRequest, NextResponse } from 'next/server';

export interface ArbitrateBody {
  analyse: string;
  parties: string[]; // IDs des parties impliquées
  decision: string;
  justification: string;
  execution: string;
  signature?: {
    password: string;
    certificat?: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: ArbitrateBody = await request.json();

    // Validations
    if (!body.analyse || !body.decision || !body.justification || !body.execution) {
      return NextResponse.json(
        { error: 'analyse, decision, justification, and execution are required' },
        { status: 400 }
      );
    }

    if (body.parties.length === 0) {
      return NextResponse.json(
        { error: 'At least one party must be involved' },
        { status: 400 }
      );
    }

    if (body.decision.length < 50 || body.justification.length < 100) {
      return NextResponse.json(
        { error: 'Decision (min 50 chars) and justification (min 100 chars) must be detailed' },
        { status: 400 }
      );
    }

    // TODO: Récupérer dossier
    const existingDossier = {
      id,
      status: 'escalated',
      reference: 'BLOCK-2026-001',
    };

    if (!existingDossier) {
      return NextResponse.json(
        { error: 'Dossier not found' },
        { status: 404 }
      );
    }

    // TODO: Vérifier permissions BMO uniquement
    // TODO: Vérifier signature si fournie
    // TODO: Vérifier que les parties existent

    // TODO: Créer arbitrage en DB
    // await prisma.arbitrage.create({
    //   data: {
    //     dossierId: id,
    //     analyse: body.analyse,
    //     parties: body.parties,
    //     decision: body.decision,
    //     justification: body.justification,
    //     execution: body.execution,
    //     status: 'definitive',
    //     createdBy: currentUserId,
    //     signatureHash: body.signature ? hashSignature(body.signature.password) : null,
    //   }
    // });

    // TODO: Mettre à jour statut dossier en 'resolved'
    // await prisma.blockedDossier.update({
    //   where: { id },
    //   data: {
    //     status: 'resolved',
    //     resolvedAt: new Date(),
    //     resolutionType: 'arbitration',
    //   }
    // });

    // TODO: Créer timeline entry
    // TODO: Notifier TOUTES les parties de la décision
    // TODO: Envoyer email formel avec décision
    // TODO: Enregistrer audit trail (décision BMO définitive)
    // TODO: Créer rapport PDF arbitrage

    const arbitrage = {
      id: `arb-${Date.now()}`,
      dossierId: id,
      reference: `ARB-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      analyse: body.analyse,
      parties: body.parties,
      decision: body.decision,
      justification: body.justification,
      execution: body.execution,
      status: 'definitive',
      createdAt: new Date().toISOString(),
      createdBy: 'BMO',
      isFinal: true,
      auditTrail: {
        action: 'arbitrage_bmo',
        timestamp: new Date().toISOString(),
        signature: body.signature ? 'SHA256_HASH' : null,
        enforceable: true,
      },
    };

    console.log(`[blocked/${id}/arbitrate] Arbitrage BMO créé:`, {
      id,
      reference: arbitrage.reference,
      parties: body.parties.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Arbitrage BMO effectué avec succès',
      arbitrage,
      notifications: {
        sent: body.parties,
        emailSent: true,
        pdfGenerated: true,
      },
      note: 'Cette décision est définitive et s\'impose à toutes les parties',
    });
  } catch (error) {
    console.error(`[blocked/${params.id}/arbitrate] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to create arbitrage', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET pour voir arbitrage
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Récupérer arbitrage
    const arbitrage = {
      id: 'arb-123',
      dossierId: id,
      reference: 'ARB-2026-1234',
      analyse: 'Conflit entre DAF et Chef Service concernant priorité validation...',
      parties: ['user-daf-001', 'user-chef-001', 'fournisseur-senelec'],
      decision: 'Déblocage immédiat autorisé avec validation DAF en parallèle',
      justification: 'Impact financier critique (15M FCFA) et risque coupure électricité...',
      execution: 'Validation immédiate par DAF. Paiement sous 48h maximum.',
      status: 'definitive',
      createdAt: '2026-01-09T15:00:00.000Z',
      createdBy: 'Amadou SECK (BMO)',
      isFinal: true,
      pdfReport: '/reports/arbitrage/ARB-2026-1234.pdf',
    };

    return NextResponse.json(arbitrage);
  } catch (error) {
    console.error(`[blocked/${params.id}/arbitrate] Get error:`, error);
    return NextResponse.json(
      { error: 'Failed to get arbitrage' },
      { status: 500 }
    );
  }
}

