// API Route: PATCH /api/bmo/blocked/[id]/update
// Met à jour un dossier bloqué

import { NextRequest, NextResponse } from 'next/server';

export interface UpdateBlockedBody {
  description?: string;
  impact?: 'critical' | 'high' | 'medium' | 'low';
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  assignTo?: string;
  status?: 'pending' | 'escalated' | 'resolved' | 'substituted';
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateBlockedBody = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Dossier ID is required' },
        { status: 400 }
      );
    }

    // TODO: Récupérer dossier depuis DB
    const existingDossier = {
      id,
      status: 'pending',
      createdAt: '2026-01-08',
    };

    // Vérifier que le dossier peut être modifié
    if (existingDossier.status === 'resolved') {
      return NextResponse.json(
        { error: 'Cannot update resolved dossier' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permissions utilisateur
    // Seul responsable, BMO ou admin peuvent modifier

    // Construire updates
    const updates: Partial<UpdateBlockedBody> = {};

    if (body.description !== undefined) {
      if (body.description.length < 20) {
        return NextResponse.json(
          { error: 'Description must be at least 20 characters' },
          { status: 400 }
        );
      }
      updates.description = body.description;
    }

    if (body.impact !== undefined) updates.impact = body.impact;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.status !== undefined) updates.status = body.status;

    if (body.assignTo !== undefined) {
      // TODO: Vérifier que l'utilisateur existe
      // TODO: Créer timeline entry réassignation
      // TODO: Notifier nouvel assigné
      updates.assignTo = body.assignTo;
    }

    // TODO: Mettre à jour en DB
    // await prisma.blockedDossier.update({ where: { id }, data: updates });

    // TODO: Créer timeline entry
    // TODO: Re-calculer SLA si impact change
    // TODO: Notifier parties prenantes si changements significatifs

    const updatedDossier = {
      ...existingDossier,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    console.log(`[blocked/${id}/update] Dossier mis à jour:`, {
      id,
      changes: Object.keys(updates),
    });

    return NextResponse.json({
      success: true,
      message: 'Dossier mis à jour avec succès',
      dossier: updatedDossier,
      changes: Object.keys(updates),
    });
  } catch (error) {
    console.error(`[blocked/${params.id}/update] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to update dossier', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

