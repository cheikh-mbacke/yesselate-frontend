export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; tid: string }> }) {
  const { id, tid } = await params;
  const body = await req.json().catch(() => null);

  const data: {
    status?: string;
    title?: string;
    description?: string | null;
    dueAt?: Date | null;
    completedAt?: Date;
  } = {};
  if (body?.status) data.status = body.status;
  if (body?.title) data.title = String(body.title).trim();
  if (body?.description !== undefined) data.description = body.description ? String(body.description) : null;
  if (body?.dueAt !== undefined) data.dueAt = body.dueAt ? new Date(body.dueAt) : null;

  if (body?.status === 'DONE') data.completedAt = new Date();

  const row = await prisma.demandTask.update({ where: { id: tid }, data });

  await prisma.demandEvent.create({
    data: {
      demandId: id,
      actorId: 'SYS',
      actorName: 'System',
      action: 'task_update',
      details: `Tâche mise à jour: ${tid}`,
    },
  });

  return NextResponse.json({ row });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; tid: string }> }) {
  const { id, tid } = await params;
  
  await prisma.demandTask.delete({ where: { id: tid } });

  await prisma.demandEvent.create({
    data: {
      demandId: id,
      actorId: 'SYS',
      actorName: 'System',
      action: 'task_remove',
      details: `Tâche supprimée (${tid})`,
    },
  });

  return NextResponse.json({ ok: true });
}
