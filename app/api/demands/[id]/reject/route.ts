export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (!body?.reason?.trim()) {
    return NextResponse.json({ error: 'Motif requis' }, { status: 400 });
  }

  const updated = await prisma.demand.update({
    where: { id },
    data: { status: 'rejected' },
  });

  await prisma.demandEvent.create({
    data: {
      demandId: id,
      actorId: body.actorId ?? 'USR-001',
      actorName: body.actorName ?? 'A. DIALLO',
      action: 'rejection',
      details: body.reason,
    },
  });

  return NextResponse.json({ demand: updated });
}
