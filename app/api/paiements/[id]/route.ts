// API Route: DELETE /api/paiements/[id]
// Supprime/Annule un paiement (soft delete)

import { NextRequest, NextResponse } from 'next/server';

export interface DeletePaiementBody {
  reason: 'cancelled' | 'duplicate' | 'error' | 'autre';
  comment: string;
  hardDelete?: boolean; // Admin only
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    let body: DeletePaiementBody | null = null;
    try {
      body = await request.json();
    } catch {
      // Body optionnel
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Paiement ID is required' },
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

    // TODO: Récupérer paiement
    const existingPaiement = {
      id,
      status: 'pending',
      montant: 10000000,
      scheduled: false,
    };

    if (!existingPaiement) {
      return NextResponse.json(
        { error: 'Paiement not found' },
        { status: 404 }
      );
    }

    // Vérifier si peut être supprimé
    if (existingPaiement.status === 'executed') {
      return NextResponse.json(
        { error: 'Cannot delete executed payment. Contact administrator for reversal.' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permissions
    // - Demandeur peut supprimer si pending
    // - Admin peut supprimer n'importe quand

    // Hard delete (admin only)
    if (body?.hardDelete) {
      // TODO: Vérifier admin
      // TODO: Supprimer définitivement
      // await prisma.paiement.delete({ where: { id } });

      console.log(`[paiements/${id}] HARD DELETE by admin`);

      return NextResponse.json({
        success: true,
        message: 'Paiement supprimé définitivement',
        deletionType: 'hard',
      });
    }

    // Soft delete (par défaut)
    const deleteReason = body?.reason || 'cancelled';
    const deleteComment = body?.comment || 'Annulation sans commentaire';
    const deletedAt = new Date().toISOString();

    // TODO: Soft delete en DB
    // await prisma.paiement.update({
    //   where: { id },
    //   data: {
    //     status: 'cancelled',
    //     deletedAt,
    //     deleteReason,
    //     deleteComment,
    //   }
    // });

    // TODO: Annuler planification si scheduled
    // TODO: Créer timeline entry
    // TODO: Notifier validateurs
    // TODO: Annuler rappels planifiés

    const deletedPaiement = {
      id,
      status: 'cancelled',
      deletedAt,
      deleteReason,
      deleteComment,
      deletedBy: {
        id: 'user-123',
        name: 'Current User',
      },
    };

    console.log(`[paiements/${id}] Soft delete:`, {
      id,
      reason: deleteReason,
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement annulé avec succès',
      deletionType: 'soft',
      paiement: deletedPaiement,
      note: 'Le paiement est archivé et peut être restauré par un administrateur',
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[paiements/${id}] Delete error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete paiement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET pour récupérer paiements supprimés (ADMIN)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeCancelled = searchParams.get('includeCancelled') === 'true';

    if (!includeCancelled) {
      return NextResponse.json(
        { error: 'Use includeCancelled=true query param to access cancelled payments' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permission admin
    // TODO: Récupérer paiement annulé

    const cancelledPaiement = {
      id,
      status: 'cancelled',
      deletedAt: '2024-01-18T10:00:00.000Z',
      deleteReason: 'error',
      deleteComment: 'Erreur de saisie montant',
      canRestore: true,
    };

    return NextResponse.json(cancelledPaiement);
  } catch (error) {
    const { id } = await params;
    console.error(`[paiements/${id}] Get cancelled error:`, error);
    return NextResponse.json(
      { error: 'Failed to retrieve cancelled paiement' },
      { status: 500 }
    );
  }
}

// PUT pour restaurer un paiement annulé (ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.restore) {
      return NextResponse.json(
        { error: 'Use { "restore": true } to restore cancelled paiement' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permission admin
    // TODO: Restaurer paiement
    // await prisma.paiement.update({
    //   where: { id },
    //   data: {
    //     status: 'pending',
    //     deletedAt: null,
    //     deleteReason: null,
    //     deleteComment: null,
    //   }
    // });

    console.log(`[paiements/${id}] Paiement restauré par admin`);

    return NextResponse.json({
      success: true,
      message: 'Paiement restauré avec succès',
      paiement: {
        id,
        status: 'pending',
        restoredAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[paiements/${id}] Restore error:`, error);
    return NextResponse.json(
      { error: 'Failed to restore paiement' },
      { status: 500 }
    );
  }
}

