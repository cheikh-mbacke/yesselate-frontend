export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

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
  if (delegation.status === 'active' && delegation.endDate < new Date()) {
    actualStatus = 'expired';
  }

  const isExpiringSoon = delegation.endDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && 
                         delegation.endDate > new Date();

  // Calculer les jours restants
  const daysRemaining = Math.ceil((delegation.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return NextResponse.json({
    item: {
      id: delegation.id,
      type: delegation.type,
      status: actualStatus,
      
      // Agent
      agent: {
        id: delegation.agentId,
        name: delegation.agentName,
        role: delegation.agentRole,
        email: delegation.agentEmail,
        phone: delegation.agentPhone,
      },
      
      // Bureau
      bureau: delegation.bureau,
      
      // Périmètre
      scope: delegation.scope,
      scopeDetails: delegation.scopeDetails,
      maxAmount: delegation.maxAmount,
      
      // Période
      startDate: delegation.startDate.toISOString(),
      endDate: delegation.endDate.toISOString(),
      daysRemaining,
      expiringSoon: isExpiringSoon,
      
      // Délégant
      delegator: {
        id: delegation.delegatorId,
        name: delegation.delegatorName,
      },
      
      // Utilisation
      usageCount: delegation.usageCount,
      lastUsedAt: delegation.lastUsedAt?.toISOString() ?? null,
      lastUsedFor: delegation.lastUsedFor,
      
      // Traçabilité
      decisionId: delegation.decisionId,
      hash: delegation.hash,
      
      // Suspension/Révocation
      suspension: delegation.suspendedAt ? {
        at: delegation.suspendedAt.toISOString(),
        by: delegation.suspendedBy,
        reason: delegation.suspendReason,
      } : null,
      revocation: delegation.revokedAt ? {
        at: delegation.revokedAt.toISOString(),
        by: delegation.revokedBy,
        reason: delegation.revokeReason,
      } : null,
      
      // Notes
      notes: delegation.notes,
      
      // Dates
      createdAt: delegation.createdAt.toISOString(),
      updatedAt: delegation.updatedAt.toISOString(),
      
      // Historique
      history: delegation.events.map(e => ({
        id: e.id,
        action: e.action,
        actorName: e.actorName,
        details: e.details,
        targetDoc: e.targetDoc,
        targetDocType: e.targetDocType,
        createdAt: e.createdAt.toISOString(),
      })),
    }
  });
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

