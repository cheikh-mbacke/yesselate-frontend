// API Route: DELETE /api/bmo/blocked/[id]
// Supprime/Archive un dossier bloqué (soft delete)

import { NextRequest, NextResponse } from 'next/server';

export interface DeleteBlockedBody {
  reason: 'resolved' | 'duplicate' | 'error' | 'cancelled' | 'autre';
  comment: string;
  hardDelete?: boolean; // Admin only
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    let body: DeleteBlockedBody | null = null;
    try {
      body = await request.json();
    } catch {
      // Body optionnel
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Dossier ID is required' },
        { status: 400 }
      );
    }

    // Validation body si fourni
    if (body) {
      if (!body.reason || !body.comment) {
        return NextResponse.json(
          { error: 'Reason and comment are required for deletion' },
          { status: 400 }
        );
      }

      if (body.comment.length < 10) {
        return NextResponse.json(
          { error: 'Comment must be at least 10 characters' },
          { status: 400 }
        );
      }
    }

    // TODO: Récupérer dossier
    const existingDossier = {
      id,
      status: 'pending',
      reference: 'BLOCK-2026-001',
    };

    if (!existingDossier) {
      return NextResponse.json(
        { error: 'Dossier not found' },
        { status: 404 }
      );
    }

    // TODO: Vérifier permissions
    // - Responsable peut supprimer si pending
    // - BMO/Admin peuvent supprimer n'importe quand

    // Hard delete (admin only)
    if (body?.hardDelete) {
      // TODO: Vérifier admin
      // TODO: Supprimer définitivement
      // await prisma.blockedDossier.delete({ where: { id } });

      console.log(`[blocked/${id}] HARD DELETE by admin`);

      return NextResponse.json({
        success: true,
        message: 'Dossier supprimé définitivement',
        deletionType: 'hard',
      });
    }

    // Soft delete (par défaut)
    const deleteReason = body?.reason || 'cancelled';
    const deleteComment = body?.comment || 'Archivage sans commentaire';
    const deletedAt = new Date().toISOString();

    // TODO: Soft delete en DB
    // await prisma.blockedDossier.update({
    //   where: { id },
    //   data: {
    //     status: 'archived',
    //     deletedAt,
    //     deleteReason,
    //     deleteComment,
    //   }
    // });

    // TODO: Créer timeline entry
    // TODO: Notifier parties prenantes
    // TODO: Annuler rappels planifiés

    const archivedDossier = {
      id,
      status: 'archived',
      deletedAt,
      deleteReason,
      deleteComment,
      deletedBy: {
        id: 'user-123',
        name: 'Current User',
      },
    };

    console.log(`[blocked/${id}] Soft delete:`, {
      id,
      reason: deleteReason,
    });

    return NextResponse.json({
      success: true,
      message: 'Dossier archivé avec succès',
      deletionType: 'soft',
      dossier: archivedDossier,
      note: 'Le dossier est archivé et peut être restauré par un administrateur',
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[blocked/${id}] Delete error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete dossier', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET pour récupérer dossiers archivés (ADMIN)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';

    if (!includeArchived) {
      return NextResponse.json(
        { error: 'Use includeArchived=true query param to access archived dossiers' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permission admin
    // TODO: Récupérer dossier archivé

    const archivedDossier = {
      id,
      status: 'archived',
      deletedAt: '2026-01-10T10:00:00.000Z',
      deleteReason: 'resolved',
      deleteComment: 'Dossier résolu par substitution',
      canRestore: true,
    };

    return NextResponse.json(archivedDossier);
  } catch (error) {
    const { id } = await params;
    console.error(`[blocked/${id}] Get archived error:`, error);
    return NextResponse.json(
      { error: 'Failed to retrieve archived dossier' },
      { status: 500 }
    );
  }
}

// PUT pour restaurer un dossier archivé (ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.restore) {
      return NextResponse.json(
        { error: 'Use { "restore": true } to restore archived dossier' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permission admin
    // TODO: Restaurer dossier
    // await prisma.blockedDossier.update({
    //   where: { id },
    //   data: {
    //     status: 'pending',
    //     deletedAt: null,
    //     deleteReason: null,
    //     deleteComment: null,
    //   }
    // });

    console.log(`[blocked/${id}] Dossier restauré par admin`);

    return NextResponse.json({
      success: true,
      message: 'Dossier restauré avec succès',
      dossier: {
        id,
        status: 'pending',
        restoredAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[blocked/${id}] Restore error:`, error);
    return NextResponse.json(
      { error: 'Failed to restore dossier' },
      { status: 500 }
    );
  }
}
