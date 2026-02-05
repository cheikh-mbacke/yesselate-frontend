/**
 * API Utilisation d'une délégation
 * =================================
 * 
 * POST /api/delegations/[id]/use
 * 
 * Enregistre une utilisation de la délégation (signature, paiement, etc.)
 * avec évaluation automatique des policies et logging dans l'audit trail.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluate } from '@/lib/delegation/policy-engine';
import { mapPrismaToDelegation } from '@/lib/delegation/mapper';
import { computeEventHash, generateEventId } from '@/lib/delegation/hash';
import type { ActionContext, DelegationAction, Currency, DocumentType } from '@/lib/delegation/types';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      actorId,
      actorName,
      actorRole,
      action,
      projectId,
      projectName,
      bureau,
      amount,
      currency = 'XOF',
      supplierId,
      supplierName,
      category,
      documentId,
      documentRef,
      documentType,
      documentDate,
      notes,
    } = body as {
      actorId: string;
      actorName: string;
      actorRole?: string;
      action: DelegationAction;
      projectId?: string;
      projectName?: string;
      bureau: string;
      amount: number;
      currency?: Currency;
      supplierId?: string;
      supplierName?: string;
      category?: string;
      documentId?: string;
      documentRef: string;
      documentType: DocumentType;
      documentDate?: string;
      notes?: string;
    };

    // Validation
    if (!actorId || !actorName || !action || !bureau || amount == null || !documentRef || !documentType) {
      return NextResponse.json(
        { error: 'Paramètres manquants: actorId, actorName, action, bureau, amount, documentRef, documentType requis.' },
        { status: 400 }
      );
    }

    // Charger la délégation complète
    const delegation = await prisma.delegation.findUnique({
      where: { id },
      include: {
        policies: true,
        actors: true,
        engagements: true,
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!delegation) {
      return NextResponse.json({ error: 'Délégation introuvable.' }, { status: 404 });
    }

    // Mapper vers le domaine
    const delegationFull = mapPrismaToDelegation(delegation as any);

    // Construire le contexte d'action
    const context: ActionContext = {
      action,
      projectId,
      projectName,
      bureau,
      amount,
      currency,
      supplierId,
      supplierName,
      category,
      documentType,
      documentRef,
      requesterId: actorId,
      requesterName: actorName,
      timestamp: new Date(),
    };

    // Évaluer avec le moteur de règles
    const evaluation = evaluate(delegationFull, context);

    // Déterminer le statut de l'usage
    let usageStatus: 'AUTHORIZED' | 'DENIED' | 'PENDING_CONTROL';
    if (!evaluation.allowed) {
      usageStatus = 'DENIED';
    } else if (evaluation.result === 'PENDING_CONTROL') {
      usageStatus = 'PENDING_CONTROL';
    } else {
      usageStatus = 'AUTHORIZED';
    }

    // Calculer le hash pour l'événement
    const previousHash = delegation.events[0]?.eventHash ?? delegation.headHash ?? null;
    const now = new Date();
    const eventData = {
      eventType: 'USED',
      actorId,
      details: {
        action,
        bureau,
        amount,
        documentRef,
        result: evaluation.result,
      },
      targetDocRef: documentRef,
      targetAmount: amount,
      createdAt: now,
    };
    const eventHash = computeEventHash(eventData, previousHash);

    // Transaction : créer usage + event + update delegation
    const usageId = generateEventId().replace('evt_', 'usg_');
    const eventId = generateEventId();

    const [updatedDelegation, usage] = await prisma.$transaction([
      // Update delegation stats
      prisma.delegation.update({
        where: { id },
        data: {
          usageCount: { increment: 1 },
          usageTotalAmount: usageStatus === 'AUTHORIZED' ? { increment: amount } : undefined,
          lastUsedAt: usageStatus === 'AUTHORIZED' ? now : undefined,
          lastUsedFor: usageStatus === 'AUTHORIZED' ? documentRef : undefined,
          lastUsedAmount: usageStatus === 'AUTHORIZED' ? amount : undefined,
          headHash: eventHash,
          updatedAt: now,
        },
      }),

      // Créer l'usage
      prisma.delegationUsage.create({
        data: {
          id: usageId,
          delegationId: id,
          projectId,
          projectName,
          bureau,
          supplierId,
          supplierName,
          category,
          documentId,
          documentRef,
          documentType,
          documentDate: documentDate ? new Date(documentDate) : null,
          amount,
          currency,
          usedById: actorId,
          usedByName: actorName,
          status: usageStatus,
          evaluationResult: JSON.stringify(evaluation),
          controlsRequired: JSON.stringify(evaluation.controls),
          eventId,
          notes,
        },
      }),

      // Créer l'événement d'audit
      prisma.delegationEvent.create({
        data: {
          id: eventId,
          delegationId: id,
          eventType: 'USED',
          actorId,
          actorName,
          actorRole,
          summary: `Usage ${evaluation.result}: ${action} pour ${documentRef}`,
          details: JSON.stringify({
            action,
            bureau,
            project: projectName || projectId,
            supplier: supplierName || supplierId,
            category,
          }),
          usageContext: JSON.stringify(context),
          targetDocId: documentId,
          targetDocRef: documentRef,
          targetDocType: documentType,
          targetAmount: amount,
          evaluationResult: evaluation.result,
          evaluationReasons: JSON.stringify(evaluation.reasons),
          controlsRequired: JSON.stringify(evaluation.controls),
          previousHash,
          eventHash,
          createdAt: now,
        },
      }),
    ]);

    return NextResponse.json({
      success: usageStatus !== 'DENIED',
      usageId,
      status: usageStatus,
      evaluation: {
        result: evaluation.result,
        allowed: evaluation.allowed,
        reasons: evaluation.reasons,
        controls: evaluation.controls,
        riskLevel: evaluation.riskLevel,
        recommendations: evaluation.recommendations,
      },
      delegation: {
        id: updatedDelegation.id,
        usageCount: updatedDelegation.usageCount,
        usageTotalAmount: updatedDelegation.usageTotalAmount,
        headHash: updatedDelegation.headHash,
      },
      event: {
        id: eventId,
        type: 'USED',
        hash: eventHash,
      },
    });
  } catch (error) {
    console.error('[API] Erreur utilisation délégation:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'utilisation.' }, { status: 500 });
  }
}

