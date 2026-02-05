export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const delayDays = (createdAt: Date) => {
  const diff = Date.now() - createdAt.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queue = searchParams.get('queue') ?? 'pending';

  const where: { status?: string; priority?: string } = {};
  if (queue === 'pending') where.status = 'pending';
  if (queue === 'validated') where.status = 'validated';
  if (queue === 'rejected') where.status = 'rejected';
  if (queue === 'urgent') { where.status = 'pending'; where.priority = 'urgent'; }
  // overdue = calcul local après fetch

  const demands = await prisma.demand.findMany({
    where,
    orderBy: { requestedAt: 'desc' },
    take: 200,
  });

  const items = demands
    .map(d => {
      const dd = delayDays(d.requestedAt);
      const isOverdue = dd > 7 && d.status !== 'validated';
      return {
        id: d.id,
        subject: d.subject,
        bureau: d.bureau,
        type: d.type,
        priority: d.priority,
        status: d.status,
        amount: d.amount, // Int, plus besoin de parse
        delayDays: dd,
        isOverdue,
      };
    })
    .filter(d => queue !== 'overdue' ? true : d.isOverdue);

  return NextResponse.json({ items, now: new Date().toISOString() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const id = String(body?.id ?? `REQ-${Date.now()}`).trim();
  const subject = String(body?.subject ?? '').trim();
  const bureau = String(body?.bureau ?? '').trim();
  const type = String(body?.type ?? '').trim();
  const priority = String(body?.priority ?? 'normal').trim();
  const status = 'pending';
  const amount = body?.amount ? Number(body.amount) : null;

  if (!subject || !bureau || !type) {
    return NextResponse.json({ error: 'subject, bureau, type requis' }, { status: 400 });
  }

  const demand = await prisma.demand.create({
    data: { id, subject, bureau, type, priority, status, amount },
  });

  return NextResponse.json({ item: demand }, { status: 201 });
}
