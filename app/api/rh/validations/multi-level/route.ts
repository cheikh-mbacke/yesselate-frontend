import { NextRequest, NextResponse } from 'next/server';

export interface ValidationLevel {
  id: string;
  level: number;
  name: string;
  role: string;
  validators: string[];
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  requiredConditions?: string[];
  autoApprove?: boolean;
}

export interface MultiLevelRequest {
  id: string;
  demandeId: string;
  type: string;
  agent: string;
  agentId: string;
  amount?: number;
  duration?: number;
  submittedAt: string;
  currentLevel: number;
  totalLevels: number;
  overallStatus: 'in_progress' | 'approved' | 'rejected';
  levels: ValidationLevel[];
  createdAt: string;
  updatedAt: string;
}

let multiLevelRequests: MultiLevelRequest[] = [
  {
    id: 'ml-1',
    demandeId: 'RH-2026-015',
    type: 'Dépense',
    agent: 'Ahmed Kaci',
    agentId: 'AGT-001',
    amount: 45000,
    submittedAt: '2026-01-09T10:00:00Z',
    currentLevel: 2,
    totalLevels: 4,
    overallStatus: 'in_progress',
    levels: [
      {
        id: 'l1',
        level: 1,
        name: 'Validation initiale',
        role: 'Chef d\'équipe',
        validators: ['Sarah Martin'],
        status: 'approved',
        approvedBy: 'Sarah Martin',
        approvedAt: '2026-01-09T11:30:00Z',
        comments: 'Dépense justifiée et conforme',
      },
      {
        id: 'l2',
        level: 2,
        name: 'Validation budgétaire',
        role: 'Contrôleur financier',
        validators: ['Thomas Dubois', 'Marie Lambert'],
        status: 'pending',
        requiredConditions: ['Budget disponible', 'Devis validé'],
      },
      {
        id: 'l3',
        level: 3,
        name: 'Validation RH',
        role: 'Responsable RH',
        validators: ['Jean Moreau'],
        status: 'pending',
        requiredConditions: ['Conformité règlement interne'],
      },
      {
        id: 'l4',
        level: 4,
        name: 'Approbation finale',
        role: 'Directeur Général',
        validators: ['Sophie Bernard'],
        status: 'pending',
        requiredConditions: ['Montant > 30000 DZD'],
      },
    ],
    createdAt: '2026-01-09T10:00:00Z',
    updatedAt: '2026-01-09T11:30:00Z',
  },
];

// GET /api/rh/validations/multi-level
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const demandeId = searchParams.get('demandeId');
    const id = searchParams.get('id');

    let filtered = [...multiLevelRequests];

    if (id) {
      const mlRequest = filtered.find((r) => r.id === id);
      if (!mlRequest) {
        return NextResponse.json(
          { error: 'Demande multi-niveaux non trouvée' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: mlRequest, success: true });
    }

    if (status) {
      filtered = filtered.filter((r) => r.overallStatus === status);
    }
    if (demandeId) {
      filtered = filtered.filter((r) => r.demandeId === demandeId);
    }

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/validations/multi-level:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/validations/multi-level - Créer une validation multi-niveaux
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.demandeId || !body.levels || body.levels.length === 0) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    const newRequest: MultiLevelRequest = {
      id: `ml-${Date.now()}`,
      demandeId: body.demandeId,
      type: body.type,
      agent: body.agent,
      agentId: body.agentId,
      amount: body.amount,
      duration: body.duration,
      submittedAt: body.submittedAt || new Date().toISOString(),
      currentLevel: 1,
      totalLevels: body.levels.length,
      overallStatus: 'in_progress',
      levels: body.levels,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    multiLevelRequests.push(newRequest);

    return NextResponse.json(
      {
        data: newRequest,
        message: 'Validation multi-niveaux créée avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/validations/multi-level:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/validations/multi-level - Valider un niveau
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, levelId, action, validatorId, comments } = body;

    if (!id || !levelId || !action) {
      return NextResponse.json(
        { error: 'Paramètres manquants', success: false },
        { status: 400 }
      );
    }

    const index = multiLevelRequests.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Demande non trouvée', success: false },
        { status: 404 }
      );
    }

    const mlRequest = multiLevelRequests[index];
    const levelIndex = mlRequest.levels.findIndex((l) => l.id === levelId);
    
    if (levelIndex === -1) {
      return NextResponse.json(
        { error: 'Niveau non trouvé', success: false },
        { status: 404 }
      );
    }

    // Mettre à jour le niveau
    if (action === 'approve') {
      mlRequest.levels[levelIndex].status = 'approved';
      mlRequest.levels[levelIndex].approvedBy = validatorId;
      mlRequest.levels[levelIndex].approvedAt = new Date().toISOString();
      mlRequest.levels[levelIndex].comments = comments;

      // Passer au niveau suivant
      if (levelIndex < mlRequest.levels.length - 1) {
        mlRequest.currentLevel = levelIndex + 2;
      } else {
        // Tous les niveaux validés
        mlRequest.overallStatus = 'approved';
        mlRequest.currentLevel = mlRequest.totalLevels;
      }
    } else if (action === 'reject') {
      mlRequest.levels[levelIndex].status = 'rejected';
      mlRequest.levels[levelIndex].approvedBy = validatorId;
      mlRequest.levels[levelIndex].approvedAt = new Date().toISOString();
      mlRequest.levels[levelIndex].comments = comments;
      mlRequest.overallStatus = 'rejected';
    }

    mlRequest.updatedAt = new Date().toISOString();
    multiLevelRequests[index] = mlRequest;

    return NextResponse.json({
      data: mlRequest,
      message: `Niveau ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`,
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/validations/multi-level:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/validations/multi-level?id=ml-1
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis', success: false },
        { status: 400 }
      );
    }

    const index = multiLevelRequests.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Demande non trouvée', success: false },
        { status: 404 }
      );
    }

    multiLevelRequests.splice(index, 1);

    return NextResponse.json({
      message: 'Validation multi-niveaux supprimée avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/validations/multi-level:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

