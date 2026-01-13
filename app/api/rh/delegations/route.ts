import { NextRequest, NextResponse } from 'next/server';

export interface Delegation {
  id: string;
  delegatorName: string;
  delegatorId: string;
  delegatorRole: string;
  delegateName: string;
  delegateId: string;
  delegateRole: string;
  startDate: string;
  endDate: string;
  permissions: string[];
  reason: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  requestsHandled: number;
  createdAt: string;
  updatedAt: string;
}

let delegations: Delegation[] = [
  {
    id: 'del-1',
    delegatorName: 'Sarah Martin',
    delegatorId: 'USR-001',
    delegatorRole: 'Responsable RH',
    delegateName: 'Thomas Dubois',
    delegateId: 'USR-002',
    delegateRole: 'RH Adjoint',
    startDate: '2026-01-08',
    endDate: '2026-01-15',
    permissions: ['validate_leave', 'validate_expenses', 'view_reports'],
    reason: 'Congés annuels',
    status: 'active',
    requestsHandled: 23,
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-10T14:00:00Z',
  },
];

// GET /api/rh/delegations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const delegatorId = searchParams.get('delegatorId');
    const delegateId = searchParams.get('delegateId');
    const id = searchParams.get('id');

    let filtered = [...delegations];

    if (id) {
      const delegation = filtered.find((d) => d.id === id);
      if (!delegation) {
        return NextResponse.json(
          { error: 'Délégation non trouvée' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: delegation, success: true });
    }

    if (status) {
      filtered = filtered.filter((d) => d.status === status);
    }
    if (delegatorId) {
      filtered = filtered.filter((d) => d.delegatorId === delegatorId);
    }
    if (delegateId) {
      filtered = filtered.filter((d) => d.delegateId === delegateId);
    }

    // Mettre à jour automatiquement le statut des délégations expirées
    const now = new Date();
    filtered = filtered.map((d) => {
      if (d.status === 'active' && new Date(d.endDate) < now) {
        return { ...d, status: 'expired' as const };
      }
      return d;
    });

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/delegations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/delegations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.delegatorId || !body.delegateId || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    const newDelegation: Delegation = {
      id: `del-${Date.now()}`,
      delegatorName: body.delegatorName,
      delegatorId: body.delegatorId,
      delegatorRole: body.delegatorRole,
      delegateName: body.delegateName,
      delegateId: body.delegateId,
      delegateRole: body.delegateRole,
      startDate: body.startDate,
      endDate: body.endDate,
      permissions: body.permissions || [],
      reason: body.reason || '',
      status: new Date(body.startDate) > new Date() ? 'pending' : 'active',
      requestsHandled: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    delegations.push(newDelegation);

    return NextResponse.json(
      {
        data: newDelegation,
        message: 'Délégation créée avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/delegations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/delegations
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la délégation requis', success: false },
        { status: 400 }
      );
    }

    const index = delegations.findIndex((d) => d.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Délégation non trouvée', success: false },
        { status: 404 }
      );
    }

    delegations[index] = {
      ...delegations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      data: delegations[index],
      message: 'Délégation mise à jour avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/delegations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/delegations?id=del-1
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la délégation requis', success: false },
        { status: 400 }
      );
    }

    const index = delegations.findIndex((d) => d.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Délégation non trouvée', success: false },
        { status: 404 }
      );
    }

    delegations.splice(index, 1);

    return NextResponse.json({
      message: 'Délégation supprimée avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/delegations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

