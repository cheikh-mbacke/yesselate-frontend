import { NextRequest, NextResponse } from 'next/server';

export interface Absence {
  id: string;
  agentId: string;
  agentName: string;
  bureau: string;
  type: 'congé' | 'maladie' | 'formation' | 'mission' | 'récupération' | 'exceptionnel';
  dateDebut: string;
  dateFin: string;
  joursOuvrables: number;
  motif: string;
  status: 'pending' | 'approved' | 'rejected';
  validatedBy?: string;
  validatedAt?: string;
  demandeId?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// Données simulées
let absences: Absence[] = [
  {
    id: 'ABS-001',
    agentId: 'AGT-001',
    agentName: 'Ahmed Kaci',
    bureau: 'Alger',
    type: 'congé',
    dateDebut: '2026-01-15',
    dateFin: '2026-01-22',
    joursOuvrables: 5,
    motif: 'Congé annuel',
    status: 'approved',
    validatedBy: 'Sarah Martin',
    validatedAt: '2026-01-08T10:00:00Z',
    demandeId: 'RH-2026-001',
    color: '#3b82f6',
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'ABS-002',
    agentId: 'AGT-002',
    agentName: 'Farid Benali',
    bureau: 'Oran',
    type: 'mission',
    dateDebut: '2026-01-20',
    dateFin: '2026-01-24',
    joursOuvrables: 4,
    motif: 'Mission Constantine',
    status: 'approved',
    validatedBy: 'Thomas Dubois',
    validatedAt: '2026-01-09T14:00:00Z',
    color: '#8b5cf6',
    createdAt: '2026-01-07T11:00:00Z',
    updatedAt: '2026-01-09T14:00:00Z',
  },
  {
    id: 'ABS-003',
    agentId: 'AGT-003',
    agentName: 'Yasmine Larbi',
    bureau: 'Alger',
    type: 'formation',
    dateDebut: '2026-01-27',
    dateFin: '2026-01-31',
    joursOuvrables: 5,
    motif: 'Formation management',
    status: 'pending',
    color: '#10b981',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'ABS-004',
    agentId: 'AGT-004',
    agentName: 'Karim Meziani',
    bureau: 'Constantine',
    type: 'maladie',
    dateDebut: '2026-01-12',
    dateFin: '2026-01-14',
    joursOuvrables: 2,
    motif: 'Arrêt maladie',
    status: 'approved',
    validatedBy: 'Sarah Martin',
    validatedAt: '2026-01-12T09:00:00Z',
    color: '#f59e0b',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
  },
];

// GET /api/rh/absences - Récupérer les absences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bureau = searchParams.get('bureau');
    const agentId = searchParams.get('agentId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const month = searchParams.get('month'); // Format: YYYY-MM
    const id = searchParams.get('id');

    let filtered = [...absences];

    if (id) {
      const absence = filtered.find((a) => a.id === id);
      if (!absence) {
        return NextResponse.json(
          { error: 'Absence non trouvée' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: absence, success: true });
    }

    if (bureau) {
      filtered = filtered.filter((a) => a.bureau === bureau);
    }
    if (agentId) {
      filtered = filtered.filter((a) => a.agentId === agentId);
    }
    if (type) {
      filtered = filtered.filter((a) => a.type === type);
    }
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }

    // Filtrer par plage de dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((a) => {
        const absStart = new Date(a.dateDebut);
        const absEnd = new Date(a.dateFin);
        return absStart <= end && absEnd >= start;
      });
    }

    // Filtrer par mois
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0);
      filtered = filtered.filter((a) => {
        const absStart = new Date(a.dateDebut);
        const absEnd = new Date(a.dateFin);
        return absStart <= monthEnd && absEnd >= monthStart;
      });
    }

    // Trier par date de début
    filtered.sort((a, b) =>
      new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
    );

    // Statistiques par type
    const stats = {
      total: filtered.length,
      byType: {
        congé: filtered.filter((a) => a.type === 'congé').length,
        maladie: filtered.filter((a) => a.type === 'maladie').length,
        formation: filtered.filter((a) => a.type === 'formation').length,
        mission: filtered.filter((a) => a.type === 'mission').length,
        récupération: filtered.filter((a) => a.type === 'récupération').length,
        exceptionnel: filtered.filter((a) => a.type === 'exceptionnel').length,
      },
      byStatus: {
        pending: filtered.filter((a) => a.status === 'pending').length,
        approved: filtered.filter((a) => a.status === 'approved').length,
        rejected: filtered.filter((a) => a.status === 'rejected').length,
      },
      totalJours: filtered.reduce((sum, a) => sum + a.joursOuvrables, 0),
    };

    return NextResponse.json({
      data: filtered,
      stats,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/absences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/absences - Créer une absence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.agentId || !body.agentName || !body.type || !body.dateDebut || !body.dateFin) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    const typeColors: Record<string, string> = {
      congé: '#3b82f6',
      maladie: '#f59e0b',
      formation: '#10b981',
      mission: '#8b5cf6',
      récupération: '#06b6d4',
      exceptionnel: '#ec4899',
    };

    const newAbsence: Absence = {
      id: `ABS-${Date.now()}`,
      agentId: body.agentId,
      agentName: body.agentName,
      bureau: body.bureau || 'Non spécifié',
      type: body.type,
      dateDebut: body.dateDebut,
      dateFin: body.dateFin,
      joursOuvrables: body.joursOuvrables || 0,
      motif: body.motif || '',
      status: 'pending',
      demandeId: body.demandeId,
      color: typeColors[body.type] || '#6b7280',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    absences.push(newAbsence);

    return NextResponse.json(
      {
        data: newAbsence,
        message: 'Absence créée avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/absences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/absences - Mettre à jour une absence
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de l\'absence requis', success: false },
        { status: 400 }
      );
    }

    const index = absences.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Absence non trouvée', success: false },
        { status: 404 }
      );
    }

    // Si c'est une validation
    if (updates.status === 'approved' && updates.validatedBy) {
      updates.validatedAt = new Date().toISOString();
    }

    absences[index] = {
      ...absences[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      data: absences[index],
      message: 'Absence mise à jour avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/absences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/absences?id=ABS-001
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de l\'absence requis', success: false },
        { status: 400 }
      );
    }

    const index = absences.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Absence non trouvée', success: false },
        { status: 404 }
      );
    }

    absences.splice(index, 1);

    return NextResponse.json({
      message: 'Absence supprimée avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/absences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

