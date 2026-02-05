/**
 * API Soumission d'une délégation
 * ================================
 * 
 * POST /api/delegations/[id]/submit
 * 
 * Passe une délégation de "draft" à "submitted" pour approbation.
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
      },
    });

    if (!delegation) {
      return NextResponse.json({ error: 'Délégation introuvable.' }, { status: 404 });
    }

    if (delegation.status !== 'draft') {
      return NextResponse.json(
        { error: `Impossible de soumettre : statut actuel = "${delegation.status}".` },
        { status: 400 }
      );
    }

    // Calculer le hash
    const previousHash = delegation.events[0]?.eventHash ?? delegation.headHash ?? null;
    const now = new Date();
    const eventData = {
      eventType: 'SUBMITTED',
      actorId,
      details: { notes },
      createdAt: now,
    };
    const eventHash = computeEventHash(eventData, previousHash);

    // Transaction : update + event
    const [updatedDelegation] = await prisma.$transaction([
      prisma.delegation.update({
        where: { id },
        data: {
          status: 'submitted',
          headHash: eventHash,
          updatedAt: now,
        },
      }),
      prisma.delegationEvent.create({
        data: {
          id: generateEventId(),
          delegationId: id,
          eventType: 'SUBMITTED',
          actorId,
          actorName,
          actorRole,
          summary: 'Délégation soumise pour approbation',
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
        type: 'SUBMITTED',
        hash: eventHash,
      },
    });
  } catch (error) {
    console.error('[API] Erreur soumission délégation:', error);
    return NextResponse.json({ error: 'Erreur lors de la soumission.' }, { status: 500 });
  }
}

