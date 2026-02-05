export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDelegationById } from '@/lib/data/delegations-mock-data';

// Mode mock pour développement
const USE_MOCK_FALLBACK = process.env.NODE_ENV === 'development' || process.env.USE_DELEGATIONS_MOCK === 'true';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  // Mode mock: utiliser les mock data
  if (USE_MOCK_FALLBACK) {
    try {
      const mockDelegation = getDelegationById(id);
      if (!mockDelegation) {
        return NextResponse.json({ item: null }, { status: 404 });
      }

      return NextResponse.json({
        item: {
          id: mockDelegation.id,
          type: mockDelegation.type,
          status: mockDelegation.status,
          agent: {
            id: mockDelegation.toUserId,
            name: mockDelegation.agentName,
            role: mockDelegation.agentRole,
            email: null,
            phone: null,
          },
          bureau: mockDelegation.bureau,
          scope: mockDelegation.scope,
          scopeDetails: null,
          maxAmount: mockDelegation.maxAmount,
          startDate: mockDelegation.startDate,
          endDate: mockDelegation.endDate,
          daysRemaining: Math.ceil((new Date(mockDelegation.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          expiringSoon: mockDelegation.expiringSoon,
          delegator: {
            id: mockDelegation.fromUserId,
            name: mockDelegation.delegatorName,
          },
          usageCount: mockDelegation.usageCount,
          lastUsedAt: mockDelegation.lastUsedAt,
          lastUsedFor: null,
          decisionId: null,
          hash: mockDelegation.hash,
          suspension: null,
          revocation: mockDelegation.revokedAt ? {
            at: mockDelegation.revokedAt,
            by: mockDelegation.revokedBy ?? null,
            reason: null,
          } : null,
          notes: mockDelegation.reason,
          createdAt: mockDelegation.startDate,
          updatedAt: mockDelegation.endDate,
          history: [],
          _mock: true,
        },
      });
    } catch (error) {
      console.error('[API] Erreur avec mock data:', error);
      // Fallback vers Prisma
    }
  }

  // Essayer Prisma avec fallback
  try {

  const delegation = await prisma.delegation.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!delegation) {
    return NextResponse.json({ item: null }, { status: 404 });
  }

  // Calculer le statut réel
  let actualStatus = delegation.status;
  // Vérification d'expiration non disponible (endDate non disponible)
  // if (delegation.status === 'active' && delegation.endDate < new Date()) {
  //   actualStatus = 'expired';
  // }

  // Vérification d'expiration proche non disponible (endDate non disponible)
  const isExpiringSoon = false;

  // Calculer les jours restants (endDate non disponible)
  const daysRemaining = 0;

    return NextResponse.json({
      item: {
        id: delegation.id,
        type: delegation.object || 'unknown',
        status: actualStatus,
      
      // Agent (délégataire)
      agent: {
        id: delegation.delegateId,
        name: delegation.delegateName,
        role: delegation.delegateRole,
        email: delegation.delegateEmail,
        phone: delegation.delegatePhone,
      },
      
      // Bureau
      bureau: delegation.bureau,
      
      // Périmètre (non disponible dans Prisma - à construire depuis les propriétés projectScope, bureauScope, etc.)
      scope: 'all',
      scopeDetails: null,
      maxAmount: delegation.maxAmount,
      
      // Période
      startDate: delegation.startsAt.toISOString(),
      endDate: delegation.endsAt.toISOString(),
      daysRemaining,
      expiringSoon: isExpiringSoon,
      
      // Délégant
      delegator: {
        id: delegation.grantorId,
        name: delegation.grantorName,
      },
      
      // Utilisation (non disponible dans Prisma)
      usageCount: 0,
      lastUsedAt: null,
      lastUsedFor: null,
      
      // Traçabilité
      decisionId: delegation.decisionRef || null,
      hash: delegation.decisionHash || delegation.headHash || null,
      
      // Suspension/Révocation
      suspension: delegation.suspendedAt ? {
        at: delegation.suspendedAt.toISOString(),
        by: delegation.suspendedById || null,
        reason: null,
      } : null,
      revocation: delegation.revokedAt ? {
        at: delegation.revokedAt.toISOString(),
        by: delegation.revokedById || null,
        reason: null,
      } : null,
      
      // Notes (non disponible dans Prisma)
      notes: null,
      
      // Dates
      createdAt: delegation.createdAt.toISOString(),
      updatedAt: delegation.updatedAt.toISOString(),
      
        // Historique
        history: delegation.events.map(e => ({
          id: e.id,
          action: e.eventType,
          actorName: e.actorName,
          details: e.details,
          targetDoc: e.targetDocRef,
          targetDocType: e.targetDocType,
          createdAt: e.createdAt.toISOString(),
        })),
        _mock: false,
      },
    });
  } catch (error) {
    console.error('[API] Erreur Prisma, fallback vers mock data:', error);
    
    // Fallback vers mock data
    const mockDelegation = getDelegationById(id);
    if (!mockDelegation) {
      return NextResponse.json({ item: null }, { status: 404 });
    }

    return NextResponse.json({
      item: {
        id: mockDelegation.id,
        type: mockDelegation.type,
        status: mockDelegation.status,
        agent: {
          id: mockDelegation.toUserId,
          name: mockDelegation.agentName,
          role: mockDelegation.agentRole,
          email: null,
          phone: null,
        },
        bureau: mockDelegation.bureau,
        scope: mockDelegation.scope,
        scopeDetails: null,
        maxAmount: mockDelegation.maxAmount,
        startDate: mockDelegation.startDate,
        endDate: mockDelegation.endDate,
        daysRemaining: Math.ceil((new Date(mockDelegation.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        expiringSoon: mockDelegation.expiringSoon,
        delegator: {
          id: mockDelegation.fromUserId,
          name: mockDelegation.delegatorName,
        },
        usageCount: mockDelegation.usageCount,
        lastUsedAt: mockDelegation.lastUsedAt,
        lastUsedFor: null,
        decisionId: null,
        hash: mockDelegation.hash,
        suspension: null,
        revocation: mockDelegation.revokedAt ? {
          at: mockDelegation.revokedAt,
          by: mockDelegation.revokedBy ?? null,
          reason: null,
        } : null,
        notes: mockDelegation.reason,
        createdAt: mockDelegation.startDate,
        updatedAt: mockDelegation.endDate,
        history: [],
        _mock: true,
      },
    });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  // Champs modifiables
  if (body.scope) data.scope = body.scope;
  if (body.scopeDetails !== undefined) data.scopeDetails = body.scopeDetails;
  if (body.maxAmount !== undefined) data.maxAmount = body.maxAmount;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.endDate) data.endDate = new Date(body.endDate);

  const delegation = await prisma.delegation.update({
    where: { id },
    data,
  });

  return NextResponse.json({ item: delegation });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  await prisma.delegation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

