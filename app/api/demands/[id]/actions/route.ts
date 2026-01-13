export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const body = await req.json().catch(() => ({}));
  const type: string = body.type ?? body.action;
  const payload = body.payload ?? body;

  const demand = await prisma.demand.findUnique({ where: { id } });
  if (!demand) {
    return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
  }

  const actorId = payload.actorId ?? 'SYS';
  const actorName = payload.actorName ?? 'A. DIALLO';

  if (type === 'validate') {
    await prisma.demand.update({ where: { id }, data: { status: 'validated' } });
    await prisma.demandEvent.create({
      data: { demandId: id, actorId, actorName, action: 'validation', details: 'Demande validée' }
    });
  }

  if (type === 'reject') {
    await prisma.demand.update({ where: { id }, data: { status: 'rejected' } });
    await prisma.demandEvent.create({
      data: { demandId: id, actorId, actorName, action: 'rejection', details: 'Demande rejetée' }
    });
  }

  if (type === 'request_complement') {
    const msg = String(payload.message ?? '').trim();
    await prisma.demandEvent.create({
      data: { demandId: id, actorId, actorName, action: 'request_complement', details: msg || 'Complément demandé' }
    });
  }

  if (type === 'assign') {
    const employeeId = payload.employeeId ?? null;
    const employeeName = payload.employeeName ?? null;
    await prisma.demand.update({ 
      where: { id }, 
      data: { assignedToId: employeeId, assignedToName: employeeName } 
    });
    await prisma.demandEvent.create({
      data: { 
        demandId: id, 
        actorId, 
        actorName, 
        action: 'assign', 
        details: `Affectée à ${employeeName ?? employeeId ?? 'N/A'}` 
      }
    });
  }

  return NextResponse.json({ ok: true });
}
