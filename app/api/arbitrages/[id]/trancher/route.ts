import { NextRequest, NextResponse } from 'next/server';
import { arbitragesVivants, arbitrages } from '@/lib/data';

/**
 * POST /api/arbitrages/[id]/trancher
 * ==================================
 * Trancher un arbitrage (prendre une décision)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { optionId, motif, decidedBy } = body;

    // Chercher l'arbitrage
    const vivant = arbitragesVivants.find((a: any) => a.id === id);
    const simple = arbitrages.find((a: any) => a.id === id);
    const arbitrage = vivant || simple;

    if (!arbitrage) {
      return NextResponse.json(
        { error: 'Arbitrage not found' },
        { status: 404 }
      );
    }

    // Générer un hash de décision (simulé)
    const decisionId = `DEC-${Date.now()}`;
    const hash = `sha3-256-${Math.random().toString(36).substring(2, 15)}`;

    const decision = {
      decisionId,
      decidedAt: new Date().toISOString(),
      decidedBy: decidedBy || 'A. DIALLO',
      optionId,
      motif: motif || 'Décision prise après analyse',
      hash,
      previousHash: vivant?.hash || null,
    };

    // TODO: Sauvegarder la décision dans la base de données
    
    return NextResponse.json({
      success: true,
      decision,
      message: 'Arbitrage tranché avec succès',
    });
  } catch (error) {
    console.error('Error trancher arbitrage:', error);
    return NextResponse.json(
      { error: 'Failed to trancher arbitrage' },
      { status: 500 }
    );
  }
}
