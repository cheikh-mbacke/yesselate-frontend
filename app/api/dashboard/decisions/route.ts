/**
 * GET /api/dashboard/decisions
 * Décisions récentes du Dashboard
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending' | 'executed' | 'cancelled' | 'all'
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Données de démonstration
    let decisions = [
      {
        id: 'DEC-2024-001',
        type: 'substitution',
        subject: 'Substitution validation BC urgente',
        description: 'Substitution de M. Dupont par Mme Martin pour validation BC-2024-0847',
        author: 'Direction Générale',
        date: new Date(Date.now()).toISOString(),
        status: 'pending',
        priority: 'high',
        relatedItem: 'BC-2024-0847',
      },
      {
        id: 'DEC-2024-002',
        type: 'delegation',
        subject: 'Délégation pouvoir signature',
        description: 'Délégation temporaire du pouvoir de signature pour contrats < 50M FCFA',
        author: 'Mme Martin',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'executed',
        priority: 'medium',
      },
      {
        id: 'DEC-2024-003',
        type: 'arbitrage',
        subject: 'Arbitrage conflit ressources Lot 4',
        description: 'Décision sur allocation des ressources entre BOP et BF',
        author: 'Comité de pilotage',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'high',
        relatedItem: 'ARB-2024-0089',
      },
      {
        id: 'DEC-2024-004',
        type: 'validation',
        subject: 'Validation budget supplémentaire Phase 3',
        description: 'Approbation de l\'enveloppe additionnelle de 250M FCFA',
        author: 'Direction Financière',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'executed',
        priority: 'high',
      },
      {
        id: 'DEC-2024-005',
        type: 'substitution',
        subject: 'Substitution temporaire Chef de projet',
        description: 'M. Koné remplace M. Diallo pendant son absence',
        author: 'DRH',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'executed',
        priority: 'low',
      },
      {
        id: 'DEC-2024-006',
        type: 'validation',
        subject: 'Validation avenant contrat CTR-2024-0123',
        description: 'Extension de périmètre pour travaux complémentaires',
        author: 'Bureau Juridique',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'medium',
        relatedItem: 'CTR-2024-0123',
      },
    ];

    // Filtres
    if (status && status !== 'all') {
      decisions = decisions.filter((d) => d.status === status);
    }

    // Tri par date décroissante
    decisions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limiter
    decisions = decisions.slice(0, limit);

    // Stats agrégées
    const stats = {
      total: decisions.length,
      pending: decisions.filter((d) => d.status === 'pending').length,
      executed: decisions.filter((d) => d.status === 'executed').length,
      cancelled: decisions.filter((d) => d.status === 'cancelled').length,
      highPriority: decisions.filter((d) => d.priority === 'high' && d.status === 'pending').length,
    };

    return NextResponse.json({
      decisions,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching dashboard decisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard decisions' },
      { status: 500 }
    );
  }
}

