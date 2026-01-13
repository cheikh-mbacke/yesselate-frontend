/**
 * API Prolonger une délégation
 * ============================
 * 
 * POST /api/delegations/[id]/extend
 * 
 * Prolonge la durée d'une délégation active ou proche de l'expiration.
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
    const { actorId, actorName, actorRole, newEndDate, reason, decisionRef } = body;

    if (!actorId || !actorName) {
      return NextResponse.json(
        { error: 'actorId et actorName sont requis.' },
        { status: 400 }
      );
    }

    if (!newEndDate) {
      return NextResponse.json(
        { error: 'newEndDate est requise.' },
        { status: 400 }
      );
    }

    const newEnd = new Date(newEndDate);
    if (isNaN(newEnd.getTime())) {
      return NextResponse.json(
        { error: 'newEndDate invalide.' },
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

    // Vérifier que la délégation peut être prolongée
    if (!['active', 'expired'].includes(delegation.status)) {
      return NextResponse.json(
        { error: `Impossible de prolonger une délégation au statut "${delegation.status}".` },
        { status: 400 }
      );
    }

    // Vérifier si la délégation est prolongeable
    if (!delegation.extendable) {
      return NextResponse.json(
        { error: 'Cette délégation n\'est pas marquée comme prolongeable.' },
        { status: 400 }
      );
    }

    // Compter les prolongations déjà effectuées
    const extensionCount = await prisma.delegationEvent.count({
      where: {
        delegationId: id,
        eventType: 'EXTENDED',
      },
    });

    if (extensionCount >= delegation.maxExtensions) {
      return NextResponse.json(
        { error: `Nombre maximum de prolongations atteint (${delegation.maxExtensions}).` },
        { status: 400 }
      );
    }

    // Vérifier que la nouvelle date est postérieure à l'ancienne
    if (newEnd <= delegation.endsAt) {
      return NextResponse.json(
        { error: 'La nouvelle date de fin doit être postérieure à la date actuelle.' },
        { status: 400 }
      );
    }

    // Calculer le nombre de jours de prolongation
    const daysExtended = Math.ceil(
      (newEnd.getTime() - delegation.endsAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Vérifier la limite de jours
    if (delegation.extensionDays > 0 && daysExtended > delegation.extensionDays) {
      return NextResponse.json(
        { error: `La prolongation ne peut pas dépasser ${delegation.extensionDays} jours. Demandé: ${daysExtended} jours.` },
        { status: 400 }
      );
    }

    // Calculer le hash de l'événement
    const previousHash = delegation.events[0]?.eventHash || delegation.headHash || delegation.decisionHash;
    const eventPayload = {
      type: 'EXTENDED',
      actorId,
      actorName,
      actorRole,
      previousEndDate: delegation.endsAt.toISOString(),
      newEndDate: newEnd.toISOString(),
      daysExtended,
      extensionNumber: extensionCount + 1,
      reason,
      decisionRef,
      timestamp: new Date().toISOString(),
    };
    const eventHash = computeEventHash(eventPayload, previousHash || null);

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'événement d'audit
      const event = await tx.delegationEvent.create({
        data: {
          delegationId: id,
          eventType: 'EXTENDED',
          actorId,
          actorName,
          actorRole: actorRole || null,
          summary: `Délégation prolongée de ${daysExtended} jours`,
          details: JSON.stringify({
            previousEndDate: delegation.endsAt,
            newEndDate: newEnd,
            reason,
            decisionRef,
          }),
          previousHash: previousHash || null,
          eventHash,
        },
      });

      // Mettre à jour la délégation
      const newStatus = delegation.status === 'expired' ? 'active' : delegation.status;
      const updated = await tx.delegation.update({
        where: { id },
        data: {
          endsAt: newEnd,
          status: newStatus,
          headHash: eventHash,
        },
      });

      return { delegation: updated, event };
    });

    return NextResponse.json({
      success: true,
      delegation: result.delegation,
      extensionInfo: {
        previousEndDate: delegation.endsAt,
        newEndDate: newEnd,
        daysExtended,
        extensionNumber: extensionCount + 1,
        remainingExtensions: delegation.maxExtensions - extensionCount - 1,
      },
      event: {
        id: result.event.id,
        type: result.event.eventType,
        hash: result.event.eventHash,
        createdAt: result.event.createdAt,
      },
    });
  } catch (error) {
    console.error('[API] Erreur prolongation délégation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la prolongation.' },
      { status: 500 }
    );
  }
}

