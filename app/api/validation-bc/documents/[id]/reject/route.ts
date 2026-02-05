// API Route: POST /api/validation-bc/documents/[id]/reject
// Rejette un document avec motifs détaillés

import { NextRequest, NextResponse } from 'next/server';

interface RejectDocumentBody {
  comment: string;
  reason: string;
  reasonCategory: string;
  reassignTo?: string;
  attachments?: string[]; // URLs des fichiers uploadés
}

const REJECTION_CATEGORIES = [
  'budget',
  'pieces',
  'montant',
  'fournisseur',
  'procedure',
  'autre',
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: RejectDocumentBody = await request.json();

    // Validation des champs
    if (!body.comment || !body.reason || !body.reasonCategory) {
      return NextResponse.json(
        { error: 'Comment, reason, and reasonCategory are required' },
        { status: 400 }
      );
    }

    if (!REJECTION_CATEGORIES.includes(body.reasonCategory)) {
      return NextResponse.json(
        { error: 'Invalid rejection category' },
        { status: 400 }
      );
    }

    // TODO: Récupérer l'utilisateur courant
    // TODO: Vérifier les permissions
    // TODO: Mettre à jour le document en DB
    // TODO: Créer l'entrée dans la timeline
    // TODO: Notifier le demandeur
    // TODO: Si reassignTo, notifier la personne
    // TODO: Envoyer email

    // Mapper les catégories
    const categoryLabels: Record<string, string> = {
      budget: 'Budget insuffisant',
      pieces: 'Pièces justificatives manquantes',
      montant: 'Montant incorrect ou incohérent',
      fournisseur: 'Fournisseur non agréé',
      procedure: 'Non-respect de la procédure',
      autre: 'Autre motif',
    };

    // Mock response
    const rejectedDocument = {
      id,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: {
        id: 'val-2',
        name: 'M. KANE',
        fonction: 'DAF',
      },
      rejection: {
        category: body.reasonCategory,
        categoryLabel: categoryLabels[body.reasonCategory],
        reason: body.reason,
        comment: body.comment,
        attachments: body.attachments || [],
      },
      reassignedTo: body.reassignTo ? {
        id: body.reassignTo,
        name: 'Amadou DIALLO',
        fonction: 'Chef de Service',
      } : null,
      workflow: {
        status: 'rejected',
        canResubmit: true,
        mustFixIssues: [
          categoryLabels[body.reasonCategory],
        ],
      },
    };

    // Log de l'action
    console.log(`[validation-bc/documents/${id}/reject] Document rejected`, {
      rejectedBy: 'M. KANE',
      category: body.reasonCategory,
      reason: body.reason,
      reassignTo: body.reassignTo,
    });

    // Créer notifications
    // await createNotification({
    //   type: 'document_rejected',
    //   documentId: id,
    //   userId: demandeurId,
    //   message: `Document ${id} rejeté : ${categoryLabels[body.reasonCategory]}`,
    //   priority: 'high',
    // });

    // Si réassignation
    // if (body.reassignTo) {
    //   await createNotification({
    //     type: 'document_reassigned',
    //     documentId: id,
    //     userId: body.reassignTo,
    //     message: `Document ${id} vous a été réassigné`,
    //   });
    // }

    return NextResponse.json({
      success: true,
      message: 'Document rejeté avec succès',
      document: rejectedDocument,
      nextSteps: [
        'Le demandeur sera notifié du rejet',
        'Les corrections nécessaires doivent être apportées',
        body.reassignTo 
          ? 'Le document a été réassigné pour correction' 
          : 'Le document retourne au demandeur initial',
      ],
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[validation-bc/documents/[id]/reject] Error:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to reject document',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
