// API Route: POST /api/bmo/blocked/[id]/assign
// Réassigne un dossier bloqué à un nouveau responsable

import { NextRequest, NextResponse } from 'next/server';

export interface AssignBody {
  assignToId: string;
  reason: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  deadline?: string; // ISO date
  notifyOldResponsable?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: AssignBody = await request.json();

    // Validations
    if (!body.assignToId || !body.reason) {
      return NextResponse.json(
        { error: 'assignToId and reason are required' },
        { status: 400 }
      );
    }

    if (body.reason.length < 20) {
      return NextResponse.json(
        { error: 'Reason must be at least 20 characters' },
        { status: 400 }
      );
    }

    // TODO: Récupérer dossier
    const existingDossier = {
      id,
      status: 'pending',
      reference: 'BLOCK-2026-001',
      currentAssignee: 'user-chef-001',
    };

    if (!existingDossier) {
      return NextResponse.json(
        { error: 'Dossier not found' },
        { status: 404 }
      );
    }

    // TODO: Vérifier que le nouveau responsable existe
    // TODO: Vérifier que le nouveau responsable a les permissions
    // TODO: Vérifier permissions utilisateur actuel (BMO, admin, ou ancien responsable)

    const oldAssignee = existingDossier.currentAssignee;

    // TODO: Mettre à jour assignation
    // await prisma.blockedDossier.update({
    //   where: { id },
    //   data: {
    //     assignedTo: body.assignToId,
    //     priority: body.priority || 'normal',
    //     deadline: body.deadline,
    //     reassignedAt: new Date(),
    //     reassignedBy: currentUserId,
    //     reassignReason: body.reason,
    //   }
    // });

    // TODO: Créer timeline entry
    // await prisma.timelineEvent.create({
    //   data: {
    //     dossierId: id,
    //     type: 'assignment',
    //     title: 'Dossier réassigné',
    //     description: `De ${oldAssignee} vers ${body.assignToId}`,
    //     actor: currentUserId,
    //     metadata: { reason: body.reason },
    //   }
    // });

    // TODO: Notifier nouveau responsable
    // TODO: Notifier ancien responsable si demandé
    // TODO: Notifier observateurs

    const assignment = {
      id: `assign-${Date.now()}`,
      dossierId: id,
      oldAssignee,
      newAssignee: body.assignToId,
      reason: body.reason,
      priority: body.priority || 'normal',
      deadline: body.deadline,
      assignedAt: new Date().toISOString(),
      assignedBy: 'current-user-id',
    };

    console.log(`[blocked/${id}/assign] Dossier réassigné:`, {
      id,
      from: oldAssignee,
      to: body.assignToId,
    });

    return NextResponse.json({
      success: true,
      message: 'Dossier réassigné avec succès',
      assignment,
      notifications: {
        newAssignee: true,
        oldAssignee: body.notifyOldResponsable !== false,
        observers: true,
      },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[blocked/${id}/assign] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to assign dossier', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET pour voir historique assignations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Récupérer historique assignations
    const assignmentHistory = [
      {
        id: 'assign-001',
        assignedTo: 'user-chef-001',
        assignedToName: 'Jean DIOP',
        assignedAt: '2026-01-08T10:05:00.000Z',
        assignedBy: 'Système',
        reason: 'Assignment automatique selon bureau',
      },
      {
        id: 'assign-002',
        assignedTo: 'user-bmo-001',
        assignedToName: 'Amadou SECK',
        assignedAt: '2026-01-09T10:00:00.000Z',
        assignedBy: 'Jean DIOP',
        reason: 'Escalade BMO pour substitution urgente',
      },
    ];

    return NextResponse.json({
      dossierId: id,
      currentAssignee: assignmentHistory[assignmentHistory.length - 1].assignedTo,
      history: assignmentHistory,
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[blocked/${id}/assign] Get error:`, error);
    return NextResponse.json(
      { error: 'Failed to get assignment history' },
      { status: 500 }
    );
  }
}

