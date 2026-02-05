export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; sid: string }> }) {
  const { id, sid } = await params;
  
  await prisma.demandStakeholder.delete({ where: { id: sid } });

  await prisma.demandEvent.create({
    data: {
      demandId: id,
      actorId: 'SYS',
      actorName: 'System',
      action: 'stakeholder_remove',
      details: `Stakeholder supprimé (${sid})`,
    },
  });

  return NextResponse.json({ ok: true });
}
