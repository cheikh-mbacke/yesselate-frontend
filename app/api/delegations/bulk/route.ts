export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashChain } from '@/lib/hash';

type BulkAction = 'suspend' | 'reactivate' | 'revoke' | 'extend';

interface BulkRequest {
  action: BulkAction;
  ids: string[];
  payload?: {
    reason?: string;
    days?: number;
    newEndDate?: string;
    actorId?: string;
    actorName?: string;
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as BulkRequest | null;

  if (!body?.action || !body?.ids?.length) {
    return NextResponse.json({ error: 'Action et IDs requis' }, { status: 400 });
  }

  const { action, ids, payload } = body;
  const actorId = payload?.actorId ?? 'SYS';
  const actorName = payload?.actorName ?? 'Système';
  const reason = payload?.reason ?? 'Action groupée';

  // Vérifier que toutes les délégations existent
  const delegations = await prisma.delegation.findMany({
    where: { id: { in: ids } },
  });

  if (delegations.length !== ids.length) {
    const foundIds = delegations.map(d => d.id);
    const missing = ids.filter(id => !foundIds.includes(id));
    return NextResponse.json({ 
      error: 'Certaines délégations sont introuvables',
      missing,
    }, { status: 404 });
  }

  const results: Array<{ id: string; success: boolean; error?: string }> = [];

  for (const delegation of delegations) {
    try {
      const prevHash = delegation.hash ?? 'genesis';
      let updateData: Record<string, unknown> = {};
      let eventAction = action;
      let eventDetails = '';

      switch (action) {
        case 'suspend':
          if (delegation.status !== 'active') {
            results.push({ id: delegation.id, success: false, error: 'Non active' });
            continue;
          }
          updateData = {
            status: 'suspended',
            suspendedAt: new Date(),
            suspendedBy: actorName,
            suspendReason: reason,
          };
          eventAction = 'suspended';
          eventDetails = `Suspension groupée: ${reason}`;
          break;

        case 'reactivate':
          if (delegation.status !== 'suspended') {
            results.push({ id: delegation.id, success: false, error: 'Non suspendue' });
            continue;
          }
          updateData = {
            status: 'active',
            suspendedAt: null,
            suspendedBy: null,
            suspendReason: null,
          };
          eventAction = 'reactivated';
          eventDetails = 'Réactivation groupée';
          break;

        case 'revoke':
          if (delegation.status === 'revoked') {
            results.push({ id: delegation.id, success: false, error: 'Déjà révoquée' });
            continue;
          }
          updateData = {
            status: 'revoked',
            revokedAt: new Date(),
            revokedBy: actorName,
            revokeReason: reason,
          };
          eventAction = 'revoked';
          eventDetails = `Révocation groupée: ${reason}`;
          break;

        case 'extend':
          const days = payload?.days ?? 30;
          const newEndDate = payload?.newEndDate 
            ? new Date(payload.newEndDate)
            : new Date(delegation.endDate.getTime() + days * 24 * 60 * 60 * 1000);
          
          updateData = {
            endDate: newEndDate,
            status: 'active',
          };
          eventAction = 'extended';
          eventDetails = `Prolongation groupée jusqu'au ${newEndDate.toLocaleDateString('fr-FR')}`;
          break;

        default:
          results.push({ id: delegation.id, success: false, error: 'Action inconnue' });
          continue;
      }

      const chainPayload = {
        action: eventAction,
        actorId,
        actorName,
        details: eventDetails,
        timestamp: new Date().toISOString(),
        bulkOperation: true,
      };
      const newHash = hashChain(prevHash, chainPayload);

      await prisma.delegation.update({
        where: { id: delegation.id },
        data: {
          ...updateData,
          hash: newHash,
          events: {
            create: {
              action: eventAction,
              actorId,
              actorName,
              details: eventDetails,
            },
          },
        },
      });

      results.push({ id: delegation.id, success: true });
    } catch (e) {
      results.push({ 
        id: delegation.id, 
        success: false, 
        error: e instanceof Error ? e.message : 'Erreur inconnue' 
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return NextResponse.json({
    success: failCount === 0,
    processed: results.length,
    successCount,
    failCount,
    results,
    message: `${successCount}/${results.length} délégation(s) traitée(s)`,
  });
}

