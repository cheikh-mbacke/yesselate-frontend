export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Queue = 'all' | 'active' | 'expired' | 'revoked' | 'suspended' | 'expiring_soon';
type SortField = 'id' | 'type' | 'agentName' | 'bureau' | 'endDate' | 'usageCount' | 'createdAt';
type SortDir = 'asc' | 'desc';

const computeStatus = (delegation: { status: string; endDate: Date }): string => {
  // Si déjà révoqué ou suspendu, garder le statut
  if (delegation.status === 'revoked' || delegation.status === 'suspended') {
    return delegation.status;
  }
  // Vérifier si expiré
  if (delegation.endDate < new Date()) {
    return 'expired';
  }
  return delegation.status;
};

const isExpiringSoon = (endDate: Date): boolean => {
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return endDate <= in7Days && endDate > new Date();
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queue = (searchParams.get('queue') ?? 'all') as Queue;
  const search = searchParams.get('q')?.toLowerCase() ?? '';
  
  // Pagination
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));
  const skip = (page - 1) * limit;
  
  // Tri
  const sortField = (searchParams.get('sort') ?? 'endDate') as SortField;
  const sortDir = (searchParams.get('dir') ?? 'asc') as SortDir;
  
  // Filtres avancés
  const bureauFilter = searchParams.get('bureau');
  const typeFilter = searchParams.get('type');
  const minAmount = searchParams.get('minAmount');
  const maxAmount = searchParams.get('maxAmount');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  const now = new Date();
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Construire le where clause
  const where: Record<string, unknown> = {};

  if (queue === 'active') {
    where.status = 'active';
    where.endDate = { gte: now };
  } else if (queue === 'expired') {
    where.OR = [
      { status: 'expired' },
      { endDate: { lt: now }, status: { notIn: ['revoked', 'suspended'] } }
    ];
  } else if (queue === 'revoked') {
    where.status = 'revoked';
  } else if (queue === 'suspended') {
    where.status = 'suspended';
  } else if (queue === 'expiring_soon') {
    where.status = 'active';
    where.endDate = { gte: now, lte: in7Days };
  }
  
  // Filtres additionnels
  if (bureauFilter) {
    where.bureau = bureauFilter;
  }
  if (typeFilter) {
    where.type = { contains: typeFilter };
  }
  if (minAmount || maxAmount) {
    where.maxAmount = {};
    if (minAmount) (where.maxAmount as Record<string, number>).gte = parseInt(minAmount, 10);
    if (maxAmount) (where.maxAmount as Record<string, number>).lte = parseInt(maxAmount, 10);
  }
  if (dateFrom || dateTo) {
    where.endDate = where.endDate ?? {};
    if (dateFrom) (where.endDate as Record<string, Date>).gte = new Date(dateFrom);
    if (dateTo) (where.endDate as Record<string, Date>).lte = new Date(dateTo);
  }
  
  // Recherche textuelle (via OR sur plusieurs champs)
  if (search) {
    where.OR = [
      { id: { contains: search } },
      { type: { contains: search } },
      { agentName: { contains: search } },
      { bureau: { contains: search } },
      { scope: { contains: search } },
      { delegatorName: { contains: search } },
    ];
  }

  // Construire l'orderBy
  const orderBy: Record<string, SortDir>[] = [];
  if (sortField === 'id') orderBy.push({ id: sortDir });
  else if (sortField === 'type') orderBy.push({ type: sortDir });
  else if (sortField === 'agentName') orderBy.push({ agentName: sortDir });
  else if (sortField === 'bureau') orderBy.push({ bureau: sortDir });
  else if (sortField === 'endDate') orderBy.push({ endDate: sortDir });
  else if (sortField === 'usageCount') orderBy.push({ usageCount: sortDir });
  else if (sortField === 'createdAt') orderBy.push({ createdAt: sortDir });
  else orderBy.push({ endDate: 'asc' }); // default
  
  // Comptage total pour pagination
  const total = await prisma.delegation.count({ where });

  const delegations = await prisma.delegation.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  // Transformation des données
  const items = delegations.map(d => {
    const actualStatus = computeStatus(d);
    const expiringSoon = isExpiringSoon(d.endDate);
    
    return {
      id: d.id,
      type: d.type,
      status: actualStatus,
      agentId: d.agentId,
      agentName: d.agentName,
      agentRole: d.agentRole,
      bureau: d.bureau,
      scope: d.scope,
      maxAmount: d.maxAmount,
      startDate: d.startDate.toISOString(),
      endDate: d.endDate.toISOString(),
      delegatorName: d.delegatorName,
      usageCount: d.usageCount,
      lastUsedAt: d.lastUsedAt?.toISOString() ?? null,
      lastUsedFor: d.lastUsedFor,
      decisionId: d.decisionId,
      hash: d.hash,
      expiringSoon,
      createdAt: d.createdAt.toISOString(),
      recentEvents: d.events.map(e => ({
        id: e.id,
        action: e.action,
        actorName: e.actorName,
        details: e.details,
        targetDoc: e.targetDoc,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  });

  return NextResponse.json({ 
    items, 
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const {
    type,
    agentId,
    agentName,
    agentRole,
    agentEmail,
    agentPhone,
    bureau,
    scope,
    scopeDetails,
    maxAmount,
    startDate,
    endDate,
    delegatorId,
    delegatorName,
    notes,
  } = body;

  if (!type || !agentId || !agentName || !bureau || !scope || !startDate || !endDate || !delegatorId || !delegatorName) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  // Générer un ID unique
  const year = new Date().getFullYear();
  const count = await prisma.delegation.count({ where: { id: { startsWith: `DEL-${year}` } } });
  const id = `DEL-${year}-${String(count + 1).padStart(3, '0')}`;

  // Générer un hash de traçabilité
  const hashData = `${id}|${type}|${agentId}|${scope}|${startDate}|${endDate}|${Date.now()}`;
  const hash = Buffer.from(hashData).toString('base64').slice(0, 64);

  const delegation = await prisma.delegation.create({
    data: {
      id,
      type,
      status: 'active',
      agentId,
      agentName,
      agentRole,
      agentEmail,
      agentPhone,
      bureau,
      scope,
      scopeDetails,
      maxAmount: maxAmount ? parseInt(maxAmount, 10) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      delegatorId,
      delegatorName,
      hash,
      notes,
      events: {
        create: {
          action: 'created',
          actorId: delegatorId,
          actorName: delegatorName,
          details: `Délégation créée: ${type} pour ${agentName}`,
        },
      },
    },
  });

  return NextResponse.json({ item: delegation }, { status: 201 });
}

