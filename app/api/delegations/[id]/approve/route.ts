/**
 * API Approbation d'une délégation
 * =================================
 * 
 * POST /api/delegations/[id]/approve
 * 
 * Approuve une délégation soumise → passe en "active".
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
    const { actorId, actorName, actorRole, notes } = body;

    if (!actorId || !actorName) {
      return NextResponse.json(
        { error: 'actorId et actorName requis.' },
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
          where: { canApprove: 1 },
        },
      },
    });

    if (!delegation) {
      return NextResponse.json({ error: 'Délégation introuvable.' }, { status: 404 });
    }

    if (delegation.status !== 'submitted') {
      return NextResponse.json(
        { error: `Impossible d'approuver : statut actuel = "${delegation.status}".` },
        { status: 400 }
      );
    }

    // Vérifier que l'acteur peut approuver
    const canApprove = delegation.actors.some(a => a.userId === actorId);
    if (!canApprove && delegation.grantorId !== actorId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à approuver cette délégation.' },
        { status: 403 }
      );
    }

    // Calculer le hash
    const previousHash = delegation.events[0]?.eventHash ?? delegation.headHash ?? null;
    const now = new Date();
    const eventData = {
      eventType: 'APPROVED',
      actorId,
      details: { notes },
      createdAt: now,
    };
    const eventHash = computeEventHash(eventData, previousHash);

    // Transaction
    const [updatedDelegation] = await prisma.$transaction([
      prisma.delegation.update({
        where: { id },
        data: {
          status: 'active',
          headHash: eventHash,
          updatedAt: now,
        },
      }),
      prisma.delegationEvent.create({
        data: {
          id: generateEventId(),
          delegationId: id,
          eventType: 'APPROVED',
          actorId,
          actorName,
          actorRole,
          summary: 'Délégation approuvée et activée',
          details: notes,
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
        headHash: updatedDelegation.headHash,
      },
      event: {
        type: 'APPROVED',
        hash: eventHash,
      },
    });
  } catch (error) {
    console.error('[API] Erreur approbation délégation:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'approbation.' }, { status: 500 });
  }
}

