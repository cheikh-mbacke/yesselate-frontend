export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await prisma.demandTask.findMany({
    where: { demandId: id },
    orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ rows });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? '').trim();
  if (!title) return NextResponse.json({ error: 'title requis' }, { status: 400 });

  const row = await prisma.demandTask.create({
    data: {
      demandId: id,
      title,
      description: body?.description ? String(body.description) : null,
      dueAt: body?.dueAt ? new Date(body.dueAt) : null,
      assignedToId: body?.assignedToId ?? null,
      assignedToName: body?.assignedToName ?? null,
      status: body?.status ?? 'OPEN',
    },
  });

  await prisma.demandEvent.create({
    data: {
      demandId: id,
      actorId: 'SYS',
      actorName: 'System',
      action: 'task_add',
      details: `Tâche créée: ${title}`,
    },
  });

  return NextResponse.json({ row });
}
