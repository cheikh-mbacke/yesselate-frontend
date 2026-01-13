export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const delayDays = (createdAt: Date) => {
  const diff = Date.now() - createdAt.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  const demand = await prisma.demand.findUnique({
    where: { id },
    include: { 
      events: { 
        orderBy: { at: 'desc' }, 
        take: 50 
      },
      stakeholders: {
        orderBy: [{ required: 'desc' }, { role: 'asc' }],
      },
      risks: {
        orderBy: { probability: 'desc' },
      },
      tasks: {
        orderBy: [{ status: 'asc' }, { dueAt: 'asc' }],
      },
    },
  });

  if (!demand) {
    return NextResponse.json({ item: null }, { status: 404 });
  }

  const dd = delayDays(demand.requestedAt);
  const isOverdue = dd > 7 && demand.status !== 'validated';

  // Parser les documents JSON
  let documents = [];
  try {
    documents = demand.documents ? JSON.parse(demand.documents) : [];
  } catch {
    documents = [];
  }

  return NextResponse.json({
    item: {
      id: demand.id,
      subject: demand.subject,
      bureau: demand.bureau,
      type: demand.type,
      priority: demand.priority,
      status: demand.status,
      amount: demand.amount,
      createdAt: demand.requestedAt.toISOString(),
      updatedAt: demand.updatedAt.toISOString(),
      delayDays: dd,
      isOverdue,
      
      // Demandeur
      requester: demand.requesterId ? {
        id: demand.requesterId,
        name: demand.requesterName,
        email: demand.requesterEmail,
        phone: demand.requesterPhone,
        service: demand.requesterService,
      } : null,
      
      // Contexte
      description: demand.description,
      justification: demand.justification,
      objectives: demand.objectives,
      beneficiaries: demand.beneficiaries,
      urgencyReason: demand.urgencyReason,
      
      // Budget
      budget: {
        code: demand.budgetCode,
        line: demand.budgetLine,
        available: demand.budgetAvailable,
        requested: demand.amount,
      },
      
      // Dates
      expectedDate: demand.expectedDate?.toISOString() ?? null,
      deadline: demand.deadline?.toISOString() ?? null,
      
      // Affectation
      assignedToId: demand.assignedToId,
      assignedToName: demand.assignedToName,
      
      // Documents
      documents,
      
      // Recommandation
      recommendation: demand.recommendation,
      internalNotes: demand.internalNotes,
      
      // Parties prenantes
      stakeholders: demand.stakeholders.map(s => ({
        id: s.id,
        personId: s.personId,
        personName: s.personName,
        role: s.role,
        required: s.required === 1,
        note: s.note,
      })),
      
      // Risques
      risks: demand.risks.map(r => ({
        id: r.id,
        category: r.category,
        opportunity: r.opportunity === 1,
        probability: r.probability,
        impact: r.impact,
        score: r.probability * r.impact,
        mitigation: r.mitigation,
        ownerName: r.ownerName,
      })),
      
      // Tâches
      tasks: demand.tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        dueAt: t.dueAt?.toISOString() ?? null,
        assignedToName: t.assignedToName,
        completedAt: t.completedAt?.toISOString() ?? null,
      })),
      
      // Audit
      audit: demand.events.map(e => ({
        id: e.id,
        type: e.action,
        actorName: e.actorName,
        message: e.details,
        createdAt: e.at.toISOString(),
      })),
    }
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const body = await req.json().catch(() => null);

  const data: Record<string, unknown> = {};

  // Champs basiques
  if (body?.subject) data.subject = String(body.subject).trim();
  if (body?.bureau) data.bureau = String(body.bureau).trim();
  if (body?.type) data.type = String(body.type).trim();
  if (body?.priority) data.priority = String(body.priority).trim();
  if (body?.status) data.status = String(body.status).trim();
  if ('amount' in body) data.amount = body.amount ?? null;
  if ('assignedToId' in body) data.assignedToId = body.assignedToId ?? null;
  if ('assignedToName' in body) data.assignedToName = body.assignedToName ?? null;
  
  // Champs contextuels
  if ('description' in body) data.description = body.description ?? null;
  if ('justification' in body) data.justification = body.justification ?? null;
  if ('recommendation' in body) data.recommendation = body.recommendation ?? null;
  if ('internalNotes' in body) data.internalNotes = body.internalNotes ?? null;

  const demand = await prisma.demand.update({
    where: { id },
    data,
  });

  return NextResponse.json({ item: demand });
}
