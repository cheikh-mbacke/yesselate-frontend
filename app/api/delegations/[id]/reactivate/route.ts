/**
 * API Réactiver une délégation
 * ============================
 * 
 * POST /api/delegations/[id]/reactivate
 * 
 * Réactive une délégation suspendue.
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
    const { actorId, actorName, actorRole, reason } = body;

    if (!actorId || !actorName) {
      return NextResponse.json(
        { error: 'actorId et actorName sont requis.' },
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

    if (delegation.status !== 'suspended') {
      return NextResponse.json(
        { error: `Impossible de réactiver une délégation au statut "${delegation.status}". Seules les délégations suspendues peuvent être réactivées.` },
        { status: 400 }
      );
    }

    // Vérifier si la délégation n'est pas expirée
    const now = new Date();
    if (delegation.endsAt < now) {
      return NextResponse.json(
        { error: 'Impossible de réactiver : la délégation est expirée. Veuillez d\'abord la prolonger.' },
        { status: 400 }
      );
    }

    // Calculer le hash de l'événement
    const previousHash = delegation.events[0]?.eventHash || delegation.headHash || delegation.decisionHash;
    const eventPayload = {
      type: 'REACTIVATED',
      actorId,
      actorName,
      actorRole,
      reason,
      timestamp: new Date().toISOString(),
    };
    const eventHash = computeEventHash(eventPayload, previousHash || null);

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'événement d'audit
      const event = await tx.delegationEvent.create({
        data: {
          delegationId: id,
          eventType: 'REACTIVATED',
          actorId,
          actorName,
          actorRole: actorRole || null,
          summary: `Délégation réactivée par ${actorName}`,
          details: reason || null,
          previousHash: previousHash || null,
          eventHash,
        },
      });

      // Mettre à jour la délégation
      const updated = await tx.delegation.update({
        where: { id },
        data: {
          status: 'active',
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
    console.error('[API] Erreur réactivation délégation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réactivation.' },
      { status: 500 }
    );
  }
}

