import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeEventHash } from '@/lib/delegation/hash';

/**
 * GET /api/delegations/[id]/policies
 * Liste toutes les politiques d'une délégation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: delegationId } = await params;

    const policies = await prisma.delegationPolicy.findMany({
      where: { delegationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ items: policies });
  } catch (error) {
    console.error('Error fetching delegation policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/delegations/[id]/policies
 * Ajoute une nouvelle politique à une délégation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: delegationId } = await params;
    const body = await req.json();

    const {
      action,
      maxAmount,
      currency = 'XOF',
      allowedProjects = [],
      allowedBureaux = [],
      allowedSuppliers = [],
      excludedSuppliers = [],
      allowedCategories = [],
      requiresDualControl = false,
      requiresLegalReview = false,
      requiresFinanceCheck = false,
      stepUpAuth = false,
      addedById,
      addedByName,
    } = body;

    // Validation
    if (!action) {
      return NextResponse.json(
        { error: 'L\'action est requise.' },
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

    // Créer la politique et enregistrer l'événement
    const previousHash = delegation.events[0]?.eventHash || delegation.headHash || delegation.decisionHash;
    const eventPayload = {
      type: 'POLICY_ADDED',
      actorId: addedById || 'SYSTEM',
      actorName: addedByName || 'Système',
      policy: { action, maxAmount, currency },
      timestamp: new Date().toISOString(),
    };
    const eventHash = computeEventHash(eventPayload, previousHash || null);

    const result = await prisma.$transaction(async (tx) => {
      // Créer la politique
      const policy = await tx.delegationPolicy.create({
        data: {
          delegationId,
          action,
          maxAmount: maxAmount || null,
          currency,
          allowedProjects: JSON.stringify(allowedProjects),
          allowedBureaux: JSON.stringify(allowedBureaux),
          allowedSuppliers: JSON.stringify(allowedSuppliers),
          excludedSuppliers: JSON.stringify(excludedSuppliers),
          allowedCategories: JSON.stringify(allowedCategories),
          requiresDualControl: requiresDualControl ? 1 : 0,
          requiresLegalReview: requiresLegalReview ? 1 : 0,
          requiresFinanceCheck: requiresFinanceCheck ? 1 : 0,
          stepUpAuth: stepUpAuth ? 1 : 0,
        },
      });

      // Enregistrer l'événement
      await tx.delegationEvent.create({
        data: {
          delegationId,
          eventType: 'POLICY_ADDED',
          actorId: addedById || 'SYSTEM',
          actorName: addedByName || 'Système',
          summary: `Règle ajoutée: ${action} (max: ${maxAmount || 'illimité'} ${currency})`,
          previousHash: previousHash || null,
          eventHash,
        },
      });

      // Mettre à jour le head hash
      await tx.delegation.update({
        where: { id: delegationId },
        data: { headHash: eventHash },
      });

      return policy;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error adding policy to delegation:', error);
    return NextResponse.json(
      { error: 'Failed to add policy' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/delegations/[id]/policies
 * Supprime une politique d'une délégation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: delegationId } = await params;
    const { searchParams } = new URL(req.url);
    const policyId = searchParams.get('policyId');

    if (!policyId) {
      return NextResponse.json(
        { error: 'policyId est requis.' },
        { status: 400 }
      );
    }

    // Vérifier que la politique existe
    const policy = await prisma.delegationPolicy.findUnique({
      where: { id: policyId },
    });

    if (!policy || policy.delegationId !== delegationId) {
      return NextResponse.json(
        { error: 'Politique introuvable.' },
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
      type: 'POLICY_REMOVED',
      removedPolicy: { id: policy.id, action: policy.action },
      timestamp: new Date().toISOString(),
    };
    const eventHash = computeEventHash(eventPayload, previousHash || null);

    await prisma.$transaction(async (tx) => {
      // Supprimer la politique
      await tx.delegationPolicy.delete({
        where: { id: policyId },
      });

      // Enregistrer l'événement
      await tx.delegationEvent.create({
        data: {
          delegationId,
          eventType: 'POLICY_REMOVED',
          actorId: 'SYSTEM',
          actorName: 'Système',
          summary: `Règle retirée: ${policy.action}`,
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
    console.error('Error removing policy from delegation:', error);
    return NextResponse.json(
      { error: 'Failed to remove policy' },
      { status: 500 }
    );
  }
}

