import { NextRequest, NextResponse } from 'next/server';

// Mock events pour la timeline
const mockEvents = [
  {
    id: 'evt-1',
    demandeId: 'DEM-RH-001',
    action: 'created',
    actor: 'B. TRAORE',
    actorRole: 'Agent',
    details: 'Demande de congé créée',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-2',
    demandeId: 'DEM-RH-001',
    action: 'submitted',
    actor: 'B. TRAORE',
    actorRole: 'Agent',
    details: 'Demande soumise pour validation',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-3',
    demandeId: 'DEM-RH-002',
    action: 'validated',
    actor: 'A. DIALLO',
    actorRole: 'Directeur Général',
    details: 'Dépense validée',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-4',
    demandeId: 'DEM-RH-003',
    action: 'rejected',
    actor: 'C. KONE',
    actorRole: 'Chef de bureau',
    details: 'Déplacement rejeté - budget insuffisant',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-5',
    demandeId: 'DEM-RH-004',
    action: 'created',
    actor: 'D. SAMAKE',
    actorRole: 'Agent',
    details: 'Nouvelle demande de maladie',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// GET /api/demandes-rh/timeline - Timeline globale
export async function GET(request: NextRequest) {
  try {
    // En production: récupérer depuis la base de données
    // const events = await db.rhEvents.findMany({ ... });
    
    return NextResponse.json({
      events: mockEvents,
      total: mockEvents.length,
    });
  } catch (error) {
    console.error('Erreur GET /api/demandes-rh/timeline:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la timeline' },
      { status: 500 }
    );
  }
}

