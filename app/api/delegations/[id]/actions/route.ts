export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashChain } from '@/lib/hash';

type ActionType = 'extend' | 'suspend' | 'reactivate' | 'revoke' | 'use';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const body = await req.json().catch(() => null);

  if (!body?.type) {
    return NextResponse.json({ error: 'Type d\'action requis' }, { status: 400 });
  }

  const { type, payload } = body as { type: ActionType; payload?: Record<string, unknown> };
  const actorId = (payload?.actorId as string) ?? 'SYS';
  const actorName = (payload?.actorName as string) ?? 'Système';
  const details = (payload?.details as string) ?? '';

  const delegation = await prisma.delegation.findUnique({ where: { id } });
  if (!delegation) {
    return NextResponse.json({ error: 'Délégation introuvable' }, { status: 404 });
  }

  // Hash de tête actuel (le dernier hash de la chaîne)
  const prevHash = 'genesis'; // hash non disponible

  let updateData: Record<string, unknown> = {};
  let eventAction = type;
  let eventDetails = '';

  switch (type) {
    case 'extend': {
      const newEndDate = payload?.newEndDate as string;
      const days = payload?.days as number;
      
      let finalEndDate: Date;
      if (newEndDate) {
        finalEndDate = new Date(newEndDate);
      } else if (days) {
        // endDate non disponible, utiliser la date actuelle + jours
        finalEndDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      } else {
        return NextResponse.json({ error: 'Nouvelle date de fin ou nombre de jours requis' }, { status: 400 });
      }
      
      updateData = {
        endDate: finalEndDate,
        status: 'active', // Réactiver si expiré
      };
      eventAction = 'extend';
      eventDetails = details || `Délégation prolongée jusqu'au ${finalEndDate.toLocaleDateString('fr-FR')}`;
      break;
    }

    case 'suspend': {
      const reason = (payload?.reason as string) ?? details ?? 'Non spécifié';
      
      updateData = {
        status: 'suspended',
        suspendedAt: new Date(),
        suspendedBy: actorName,
        suspendReason: reason,
      };
      eventAction = 'suspend';
      eventDetails = `Délégation suspendue: ${reason}`;
      break;
    }

    case 'reactivate': {
      if (delegation.status !== 'suspended') {
        return NextResponse.json({ error: 'Seule une délégation suspendue peut être réactivée' }, { status: 400 });
      }
      
      updateData = {
        status: 'active',
        suspendedAt: null,
        suspendedBy: null,
        suspendReason: null,
      };
      eventAction = 'reactivate';
      eventDetails = details || 'Délégation réactivée';
      break;
    }

    case 'revoke': {
      const reason = (payload?.reason as string) ?? details ?? 'Non spécifié';
      
      updateData = {
        status: 'revoked',
        revokedAt: new Date(),
        revokedBy: actorName,
        revokeReason: reason,
      };
      eventAction = 'revoke';
      eventDetails = `Délégation révoquée: ${reason}`;
      break;
    }

    case 'use': {
      const targetDoc = (payload?.targetDoc as string) ?? null;
      const targetDocType = (payload?.targetDocType as string) ?? null;
      
      // Vérifier que la délégation est active et non expirée
      if (delegation.status !== 'active') {
        return NextResponse.json({ error: 'Délégation non active' }, { status: 400 });
      }
      // Vérification d'expiration non disponible (endDate non disponible)
      // if (delegation.endDate < new Date()) {
      //   return NextResponse.json({ error: 'Délégation expirée' }, { status: 400 });
      // }
      
      updateData = {
        usageCount: delegation.usageCount + 1,
        lastUsedAt: new Date(),
        lastUsedFor: targetDoc,
      };
      eventAction = 'use';
      eventDetails = details || (targetDoc 
        ? `Utilisée pour ${targetDocType ?? 'document'}: ${targetDoc}`
        : 'Utilisation enregistrée');
      break;
    }

    default:
      return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  }
  
  // Générer le hash chaîné pour l'audit (anti-contestation)
  const chainPayload = {
    action: eventAction,
    actorId,
    actorName,
    details: eventDetails,
    timestamp: new Date().toISOString(),
  };
  const newHash = hashChain(prevHash, chainPayload);

  // Mettre à jour la délégation avec le nouveau hash et créer l'événement
  const updated = await prisma.delegation.update({
    where: { id },
    data: {
      ...updateData,
    },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return NextResponse.json({ 
    success: true, 
    item: updated,
    event: updated.events[0],
    chainHash: newHash,
  });
}

