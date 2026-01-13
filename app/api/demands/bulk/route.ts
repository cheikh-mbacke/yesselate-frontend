export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Action = 'validate' | 'reject' | 'assign' | 'request_complement';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const ids: string[] = body?.ids ?? [];
  const action: Action | undefined = body?.action;

  if (!action || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids/action requis' }, { status: 400 });
  }

  const actorId = body.actorId ?? 'USR-001';
  const actorName = body.actorName ?? 'A. DIALLO';

  const updated: string[] = [];
  const skipped: Array<{ id: string; reason: string }> = [];

  await prisma.$transaction(async (tx) => {
    const demands = await tx.demand.findMany({ where: { id: { in: ids } } });

    for (const d of demands) {
      // règles métier
      if ((action === 'validate' || action === 'reject') && d.status !== 'pending') {
        skipped.push({ id: d.id, reason: 'Statut non pending' });
        continue;
      }

      if (action === 'validate') {
        await tx.demand.update({ where: { id: d.id }, data: { status: 'validated' } });
        await tx.demandEvent.create({
          data: { demandId: d.id, actorId, actorName, action: 'validation', details: body.details ?? 'Validée' },
        });
        updated.push(d.id);
        continue;
      }

      if (action === 'reject') {
        await tx.demand.update({ where: { id: d.id }, data: { status: 'rejected' } });
        await tx.demandEvent.create({
          data: { demandId: d.id, actorId, actorName, action: 'rejection', details: body.details ?? 'Rejetée' },
        });
        updated.push(d.id);
        continue;
      }

      if (action === 'assign') {
        const employeeId = body.employeeId;
        const employeeName = body.employeeName;
        if (!employeeId || !employeeName) {
          skipped.push({ id: d.id, reason: 'employeeId/employeeName manquant' });
          continue;
        }
        await tx.demand.update({
          where: { id: d.id },
          data: { assignedToId: employeeId, assignedToName: employeeName },
        });
        await tx.demandEvent.create({
          data: { demandId: d.id, actorId, actorName, action: 'delegation', details: `Assignée à ${employeeName}` },
        });
        updated.push(d.id);
        continue;
      }

      if (action === 'request_complement') {
        const message = (body.message ?? '').trim();
        if (!message) {
          skipped.push({ id: d.id, reason: 'message manquant' });
          continue;
        }
        await tx.demandEvent.create({
          data: { demandId: d.id, actorId, actorName, action: 'request_complement', details: message },
        });
        updated.push(d.id);
      }
    }
  });

  return NextResponse.json({ updated, skipped });
}

