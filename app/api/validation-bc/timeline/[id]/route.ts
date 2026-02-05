// API Route: GET /api/validation-bc/timeline/[id]
// Timeline d'audit d'un document ou globale

import { NextRequest, NextResponse } from 'next/server';

const mockTimelines: Record<string, any[]> = {
  'BC-2024-001': [
    {
      id: 'TL-1',
      action: 'Document créé',
      actorName: 'Jean DUPONT',
      actorRole: 'Chef de service',
      timestamp: '2024-01-15T10:00:00Z',
      details: 'Création du bon de commande',
      type: 'created',
    },
    {
      id: 'TL-2',
      action: 'Documents joints ajoutés',
      actorName: 'Jean DUPONT',
      actorRole: 'Chef de service',
      timestamp: '2024-01-15T10:15:00Z',
      details: 'Devis fournisseur et BC signé',
      type: 'modified',
    },
    {
      id: 'TL-3',
      action: 'Soumis pour validation',
      actorName: 'Jean DUPONT',
      actorRole: 'Chef de service',
      timestamp: '2024-01-15T10:30:00Z',
      details: 'Document envoyé au BMO pour validation',
      type: 'modified',
    },
    {
      id: 'TL-4',
      action: 'Commentaire ajouté',
      actorName: 'A. DIALLO',
      actorRole: 'Directeur BMO',
      timestamp: '2024-01-16T09:00:00Z',
      details: 'Vérification en cours - montant conforme au budget',
      type: 'comment',
    },
  ],
  'BC-2024-002': [
    {
      id: 'TL-1',
      action: 'Document créé',
      actorName: 'Marie KANE',
      actorRole: 'Directrice DAAF',
      timestamp: '2024-01-14T09:00:00Z',
      type: 'created',
    },
    {
      id: 'TL-2',
      action: 'Soumis pour validation',
      actorName: 'Marie KANE',
      actorRole: 'Directrice DAAF',
      timestamp: '2024-01-14T09:30:00Z',
      type: 'modified',
    },
    {
      id: 'TL-3',
      action: 'Validé par le BMO',
      actorName: 'A. DIALLO',
      actorRole: 'Directeur BMO',
      timestamp: '2024-01-16T14:30:00Z',
      details: 'BC validé - Matériel conforme aux spécifications',
      type: 'validated',
    },
  ],
};

// Timeline globale (50 dernières actions)
const globalTimeline = [
  {
    id: 'GL-1',
    documentId: 'BC-2024-002',
    action: 'Validé',
    actorName: 'A. DIALLO',
    actorRole: 'Directeur BMO',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'validated',
  },
  {
    id: 'GL-2',
    documentId: 'FC-2024-001',
    action: 'Soumis',
    actorName: 'Amadou SOW',
    actorRole: 'DSI',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: 'modified',
  },
  {
    id: 'GL-3',
    documentId: 'AV-2024-001',
    action: 'Rejeté',
    actorName: 'B. SOW',
    actorRole: 'Validateur',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    type: 'rejected',
  },
  {
    id: 'GL-4',
    documentId: 'BC-2024-003',
    action: 'Créé',
    actorName: 'Ibrahima FALL',
    actorRole: 'Directeur DRE',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    type: 'created',
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Si id === 'global', retourner la timeline globale
    if (id === 'global') {
      console.log('[validation-bc/timeline/global] Loaded global timeline');
      return NextResponse.json({ events: globalTimeline });
    }

    // Sinon, timeline spécifique au document
    const events = mockTimelines[id] || [];

    if (events.length === 0) {
      return NextResponse.json(
        { error: 'Timeline not found' },
        { status: 404 }
      );
    }

    console.log(`[validation-bc/timeline/${id}] Loaded ${events.length} events`);

    return NextResponse.json({ events });
  } catch (error) {
    console.error('[validation-bc/timeline] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load timeline' },
      { status: 500 }
    );
  }
}
