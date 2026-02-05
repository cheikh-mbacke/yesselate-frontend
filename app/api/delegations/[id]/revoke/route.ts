/**
 * API Révocation d'une délégation
 * ================================
 * 
 * POST /api/delegations/[id]/revoke
 * 
 * Révoque définitivement une délégation. Action irréversible.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeEventHash, generateEventId } from '@/lib/delegation/hash';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { actorId, actorName, actorRole, reason } = body;

    if (!actorId || !actorName || !reason) {
      return NextResponse.json(
        { error: 'actorId, actorName et reason requis.' },
        { status: 400 }
      );
    }

    // Charger la délégation
    const delegation = await prisma.delegation.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        actors: {
          where: { canRevoke: 1 },
        },
      },
    });

    if (!delegation) {
      return NextResponse.json({ error: 'Délégation introuvable.' }, { status: 404 });
    }

    if (delegation.status === 'revoked') {
      return NextResponse.json(
        { error: 'Délégation déjà révoquée.' },
        { status: 400 }
      );
    }

    // Vérifier que l'acteur peut révoquer
    const canRevoke = delegation.actors.some(a => a.userId === actorId);
    if (!canRevoke && delegation.grantorId !== actorId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à révoquer cette délégation.' },
        { status: 403 }
      );
    }

    // Calculer le hash
    const previousHash = delegation.events[0]?.eventHash ?? delegation.headHash ?? null;
    const now = new Date();
    const eventData = {
      eventType: 'REVOKED',
      actorId,
      details: { reason },
      createdAt: now,
    };
    const eventHash = computeEventHash(eventData, previousHash);

    // Transaction
    const [updatedDelegation] = await prisma.$transaction([
      prisma.delegation.update({
        where: { id },
        data: {
          status: 'revoked',
          revokedAt: now,
          revokedById: actorId,
          revokedByName: actorName,
          revokeReason: reason,
          headHash: eventHash,
          updatedAt: now,
        },
      }),
      prisma.delegationEvent.create({
        data: {
          id: generateEventId(),
          delegationId: id,
          eventType: 'REVOKED',
          actorId,
          actorName,
          actorRole,
          summary: `Révocation: ${reason}`,
          details: reason,
          previousHash,
          eventHash,
          createdAt: now,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      delegation: {
        id: updatedDelegation.id,
        status: updatedDelegation.status,
        revokedAt: updatedDelegation.revokedAt,
        revokeReason: updatedDelegation.revokeReason,
        headHash: updatedDelegation.headHash,
      },
      event: {
        type: 'REVOKED',
        hash: eventHash,
      },
    });
  } catch (error) {
    console.error('[API] Erreur révocation délégation:', error);
    return NextResponse.json({ error: 'Erreur lors de la révocation.' }, { status: 500 });
  }
}

