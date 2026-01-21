import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeEventHash } from '@/lib/delegation/hash';

/**
 * GET /api/delegations/[id]/actors
 * Liste tous les acteurs d'une délégation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: delegationId } = await params;

    const actors = await prisma.delegationActor.findMany({
      where: { delegationId },
      orderBy: [
        { roleType: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ items: actors });
  } catch (error) {
    console.error('Error fetching delegation actors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch actors' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/delegations/[id]/actors
 * Ajoute un nouvel acteur à une délégation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: delegationId } = await params;
    const body = await req.json();

    const {
      userId,
      userName,
      userRole,
      roleType,
      required = false,
      canApprove = false,
      canRevoke = false,
      mustBeNotified = false,
      notes,
      addedById,
      addedByName,
    } = body;

    // Validation
    if (!userName || !roleType) {
      return NextResponse.json(
        { error: 'Le nom et le type de rôle sont requis.' },
        { status: 400 }
      );
    }

    // Vérifier que la délégation existe
    const delegation = await prisma.delegation.findUnique({
      where: { id: delegationId },
      include: { events: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!delegation) {
      return NextResponse.json(
        { error: 'Délégation introuvable.' },
        { status: 404 }
      );
    }

    // Créer l'acteur et enregistrer l'événement
    const previousHash = delegation.events[0]?.eventHash || delegation.headHash || delegation.decisionHash;
    const eventPayload = {
      eventType: 'ACTOR_ADDED',
      actorId: addedById || 'SYSTEM',
      createdAt: new Date().toISOString(),
      details: {
        actorName: addedByName || 'Système',
        addedUser: { userId, userName, userRole, roleType },
      },
    };
    const eventHash = computeEventHash(eventPayload, previousHash || null);

    const result = await prisma.$transaction(async (tx) => {
      // Créer l'acteur
      const actor = await tx.delegationActor.create({
        data: {
          delegationId,
          userId: userId || null,
          userName,
          userRole: userRole || null,
          roleType,
          required: required ? 1 : 0,
          canApprove: canApprove ? 1 : 0,
          canRevoke: canRevoke ? 1 : 0,
          mustBeNotified: mustBeNotified ? 1 : 0,
          notes: notes || null,
        },
      });

      // Enregistrer l'événement
      await tx.delegationEvent.create({
        data: {
          delegationId,
          eventType: 'ACTOR_ADDED',
          actorId: addedById || 'SYSTEM',
          actorName: addedByName || 'Système',
          summary: `Acteur ajouté: ${userName} (${roleType})`,
          details: notes,
          previousHash: previousHash || null,
          eventHash,
        },
      });

      // Mettre à jour le head hash
      await tx.delegation.update({
        where: { id: delegationId },
        data: { headHash: eventHash },
      });

      return actor;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error adding actor to delegation:', error);
    return NextResponse.json(
      { error: 'Failed to add actor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/delegations/[id]/actors
 * Supprime un acteur d'une délégation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: delegationId } = await params;
    const { searchParams } = new URL(req.url);
    const actorId = searchParams.get('actorId');

    if (!actorId) {
      return NextResponse.json(
        { error: 'actorId est requis.' },
        { status: 400 }
      );
    }

    // Vérifier que l'acteur existe
    const actor = await prisma.delegationActor.findUnique({
      where: { id: actorId },
    });

    if (!actor || actor.delegationId !== delegationId) {
      return NextResponse.json(
        { error: 'Acteur introuvable.' },
        { status: 404 }
      );
    }

    // Récupérer la délégation pour le hash
    const delegation = await prisma.delegation.findUnique({
      where: { id: delegationId },
      include: { events: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!delegation) {
      return NextResponse.json(
        { error: 'Délégation introuvable.' },
        { status: 404 }
      );
    }

    const previousHash = delegation.events[0]?.eventHash || delegation.headHash || delegation.decisionHash;
    const eventPayload = {
      eventType: 'ACTOR_REMOVED',
      actorId: 'SYSTEM',
      createdAt: new Date().toISOString(),
      details: {
        removedUser: { userId: actor.userId, userName: actor.userName, roleType: actor.roleType },
      },
    };
    const eventHash = computeEventHash(eventPayload, previousHash || null);

    await prisma.$transaction(async (tx) => {
      // Supprimer l'acteur
      await tx.delegationActor.delete({
        where: { id: actorId },
      });

      // Enregistrer l'événement
      await tx.delegationEvent.create({
        data: {
          delegationId,
          eventType: 'ACTOR_REMOVED',
          actorId: 'SYSTEM',
          actorName: 'Système',
          summary: `Acteur retiré: ${actor.userName} (${actor.roleType})`,
          previousHash: previousHash || null,
          eventHash,
        },
      });

      // Mettre à jour le head hash
      await tx.delegation.update({
        where: { id: delegationId },
        data: { headHash: eventHash },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing actor from delegation:', error);
    return NextResponse.json(
      { error: 'Failed to remove actor' },
      { status: 500 }
    );
  }
}

