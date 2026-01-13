import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/validation-bc/delegations
 * 
 * Récupère les délégations de validation BC actives
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'active';

    // Mock delegations
    const delegations = [
      {
        id: 'VDEL-001',
        delegatorId: 'USER-001',
        delegatorName: 'Amadou DIOP',
        delegatorRole: 'Chef de service DRE',
        delegateId: 'USER-002',
        delegateName: 'Fatou SALL',
        delegateRole: 'Adjoint DRE',
        type: 'full', // full, limited, specific
        scope: {
          documentTypes: ['bc', 'facture'],
          bureaux: ['DRE'],
          maxAmount: 10000000,
          actions: ['validate', 'reject', 'request_info'],
        },
        startDate: '2026-01-10T00:00:00Z',
        endDate: '2026-01-17T23:59:59Z',
        reason: 'Congés annuels',
        status: 'active',
        createdAt: '2026-01-09T16:00:00Z',
        usageCount: 5,
        lastUsedAt: '2026-01-10T14:30:00Z',
      },
      {
        id: 'VDEL-002',
        delegatorId: 'USER-003',
        delegatorName: 'Pierre DURAND',
        delegatorRole: 'Responsable DAAF',
        delegateId: 'USER-004',
        delegateName: 'Marie KOUASSI',
        delegateRole: 'Agent DAAF',
        type: 'limited',
        scope: {
          documentTypes: ['bc'],
          bureaux: ['DAAF'],
          maxAmount: 5000000,
          actions: ['validate'],
        },
        startDate: '2026-01-08T00:00:00Z',
        endDate: '2026-01-12T23:59:59Z',
        reason: 'Mission terrain',
        status: 'active',
        createdAt: '2026-01-07T10:00:00Z',
        usageCount: 8,
        lastUsedAt: '2026-01-10T11:15:00Z',
      },
      {
        id: 'VDEL-003',
        delegatorId: 'USER-005',
        delegatorName: 'Jean MARTIN',
        delegatorRole: 'DAF',
        delegateId: 'USER-006',
        delegateName: 'Sophie BERNARD',
        delegateRole: 'Adjointe DAF',
        type: 'specific',
        scope: {
          documentTypes: ['bc', 'facture', 'avenant'],
          bureaux: null, // tous les bureaux
          maxAmount: 30000000,
          actions: ['validate', 'reject', 'request_info', 'escalate'],
        },
        startDate: '2026-01-10T00:00:00Z',
        endDate: '2026-01-10T23:59:59Z',
        reason: 'Réunion externe',
        status: 'active',
        createdAt: '2026-01-10T07:00:00Z',
        usageCount: 2,
        lastUsedAt: '2026-01-10T09:45:00Z',
      },
    ];

    let filtered = delegations;
    if (status !== 'all') {
      filtered = delegations.filter(d => d.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      summary: {
        total: delegations.length,
        active: delegations.filter(d => d.status === 'active').length,
        expiringSoon: delegations.filter(d => {
          const endDate = new Date(d.endDate);
          const now = new Date();
          const hoursRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          return hoursRemaining < 24 && hoursRemaining > 0;
        }).length,
      },
    });
  } catch (error) {
    console.error('Erreur récupération délégations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/validation-bc/delegations
 * 
 * Créer une nouvelle délégation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { delegateId, type, scope, startDate, endDate, reason } = body;

    if (!delegateId || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'delegateId, type, startDate et endDate sont requis' },
        { status: 400 }
      );
    }

    const newDelegation = {
      id: `VDEL-${Date.now()}`,
      delegatorId: 'current_user', // TODO: Récupérer depuis session
      delegatorName: 'Utilisateur actuel',
      delegateId,
      delegateName: 'Délégué sélectionné',
      type,
      scope: scope || {},
      startDate,
      endDate,
      reason,
      status: 'active',
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    return NextResponse.json({
      success: true,
      data: newDelegation,
    });
  } catch (error) {
    console.error('Erreur création délégation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

