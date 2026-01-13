export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await prisma.demandStakeholder.findMany({
    where: { demandId: id },
    orderBy: [{ required: 'desc' }, { role: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ rows });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  const personId = String(body?.personId ?? '').trim();
  const personName = String(body?.personName ?? '').trim();
  const role = body?.role;
  const required = body?.required ? 1 : 0;
  const note = body?.note ? String(body.note) : null;

  if (!personId || !personName || !role) {
    return NextResponse.json({ error: 'personId/personName/role requis' }, { status: 400 });
  }

  const row = await prisma.demandStakeholder.create({
    data: { demandId: id, personId, personName, role, required, note },
  });

  await prisma.demandEvent.create({
    data: {
      demandId: id,
      actorId: 'SYS',
      actorName: 'System',
      action: 'stakeholder_add',
      details: `${personName} ajouté (${role}${required ? ', requis' : ''})`,
    },
  });

  return NextResponse.json({ row });
}
