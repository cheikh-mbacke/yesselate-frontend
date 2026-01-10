/**
 * API Suspendre une délégation
 * ============================
 * 
 * POST /api/delegations/[id]/suspend
 * 
 * Suspend temporairement une délégation active.
 * Seules les délégations actives peuvent être suspendues.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeEventHash } from '@/lib/delegation/hash';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { actorId, actorName, actorRole, reason, expectedReactivation } = body;

    if (!actorId || !actorName) {
      return NextResponse.json(
        { error: 'actorId et actorName sont requis.' },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Une raison de suspension est requise.' },
        { status: 400 }
      );
    }

    // Récupérer la délégation
    const delegation = await prisma.delegation.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!delegation) {
      return NextResponse.json(
        { error: 'Délégation introuvable.' },
        { status: 404 }
      );
    }

    if (delegation.status !== 'active') {
      return NextResponse.json(
        { error: `Impossible de suspendre une délégation au statut "${delegation.status}". Seules les délégations actives peuvent être suspendues.` },
        { status: 400 }
      );
    }

    // Calculer le hash de l'événement
    const previousHash = delegation.events[0]?.eventHash || delegation.headHash || delegation.decisionHash;
    const eventPayload = {
      type: 'SUSPENDED',
      actorId,
      actorName,
      actorRole,
      reason,
      expectedReactivation,
      timestamp: new Date().toISOString(),
    };
    const eventHash = computeEventHash(eventPayload, previousHash || null);

    // Transaction : mettre à jour la délégation + créer l'événement
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'événement d'audit
      const event = await tx.delegationEvent.create({
        data: {
          delegationId: id,
          eventType: 'SUSPENDED',
          actorId,
          actorName,
          actorRole: actorRole || null,
          summary: `Délégation suspendue par ${actorName}`,
          details: reason,
          previousHash: previousHash || null,
          eventHash,
        },
      });

      // Mettre à jour la délégation
      const updated = await tx.delegation.update({
        where: { id },
        data: {
          status: 'suspended',
          headHash: eventHash,
        },
      });

      return { delegation: updated, event };
    });

    return NextResponse.json({
      success: true,
      delegation: result.delegation,
      event: {
        id: result.event.id,
        type: result.event.eventType,
        hash: result.event.eventHash,
        createdAt: result.event.createdAt,
      },
    });
  } catch (error) {
    console.error('[API] Erreur suspension délégation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suspension.' },
      { status: 500 }
    );
  }
}

