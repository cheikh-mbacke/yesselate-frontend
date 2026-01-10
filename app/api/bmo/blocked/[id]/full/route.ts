// API Route: GET /api/bmo/blocked/[id]/full
// Récupère détails complets enrichis d'un dossier bloqué

import { NextRequest, NextResponse } from 'next/server';
import { blockedMockData } from '@/lib/mocks/blockedMockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Dossier ID is required' },
        { status: 400 }
      );
    }

    // TODO: Récupérer dossier depuis DB avec toutes relations
    // const dossier = await prisma.blockedDossier.findUnique({
    //   where: { id },
    //   include: {
    //     workflow: true,
    //     documents: true,
    //     comments: { include: { author: true } },
    //     timeline: true,
    //     parties: true,
    //     substitution: true,
    //     arbitrage: true,
    //   }
    // });

    // Mock: Trouver dossier dans mock data
    const baseDossier = blockedMockData.dossiers.find(d => d.id === id);

    if (!baseDossier) {
      return NextResponse.json(
        { error: 'Dossier not found' },
        { status: 404 }
      );
    }

    // Enrichir avec toutes les données
    const enrichedDossier = blockedMockData.createEnrichedDossier(baseDossier);

    // Ajouter données supplémentaires pour modal
    const fullDossier = {
      ...enrichedDossier,
      // Métadonnées
      metadata: {
        createdAt: baseDossier.blockedSince,
        createdBy: blockedMockData.users.chef1.name,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: blockedMockData.users.bmo1.name,
        viewCount: 45,
        commentCount: blockedMockData.comments.length,
        documentCount: blockedMockData.documents.length,
      },
      // Permissions utilisateur actuel
      permissions: {
        canEdit: true,
        canDelete: false,
        canResolve: true,
        canEscalate: true,
        canSubstitute: true, // BMO only
        canArbitrate: true, // BMO only
        canComment: true,
        canUploadDocuments: true,
      },
      // Historique résolutions précédentes (si échecs)
      resolutionHistory: [
        {
          id: 'res-001',
          type: 'escalation',
          attemptedAt: '2026-01-08T16:00:00.000Z',
          attemptedBy: blockedMockData.users.chef1.name,
          status: 'failed',
          reason: 'DAF indisponible',
        },
      ],
      // Métriques
      metrics: {
        daysBlocked: baseDossier.delayDays,
        slaProgress: Math.min(100, (baseDossier.delayDays / 7) * 100),
        escalationLevel: baseDossier.status === 'escalated' ? 2 : 1,
        urgencyScore: 85,
      },
      // Liens connexes
      relatedDossiers: [
        {
          id: 'blocked-002',
          reference: 'BLOCK-2026-002',
          relation: 'same_fournisseur',
          status: 'pending',
        },
      ],
    };

    console.log(`[blocked/${id}/full] Dossier enrichi récupéré`);

    return NextResponse.json(fullDossier);
  } catch (error) {
    console.error(`[blocked/${params.id}/full] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to get full dossier', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

