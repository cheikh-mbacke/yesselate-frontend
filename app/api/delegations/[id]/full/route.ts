/**
 * API Délégation complète
 * =======================
 * 
 * GET /api/delegations/[id]/full
 * 
 * Retourne la délégation avec toutes ses relations :
 * - Policies
 * - Acteurs
 * - Engagements
 * - Derniers événements
 * - Usages récents
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mapPrismaToDelegation } from '@/lib/delegation/mapper';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const delegation = await prisma.delegation.findUnique({
      where: { id },
      include: {
        policies: {
          orderBy: { createdAt: 'asc' },
        },
        actors: {
          orderBy: { createdAt: 'asc' },
        },
        engagements: {
          orderBy: { criticality: 'desc' },
        },
        events: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        usages: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    
    if (!delegation) {
      return NextResponse.json(
        { error: 'Délégation introuvable.' },
        { status: 404 }
      );
    }
    
    // Mapper vers le domaine
    const delegationFull = mapPrismaToDelegation(delegation as any);
    
    // Ajouter les événements et usages (non mappés dans le type principal)
    const response = {
      ...delegationFull,
      events: delegation.events.map(e => ({
        id: e.id,
        eventType: e.eventType,
        actor: {
          id: e.actorId,
          name: e.actorName,
          role: e.actorRole,
        },
        summary: e.summary,
        details: e.details,
        targetDoc: e.targetDocRef ? {
          id: e.targetDocId,
          ref: e.targetDocRef,
          type: e.targetDocType,
          amount: e.targetAmount,
        } : undefined,
        evaluationResult: e.evaluationResult,
        evaluationReasons: e.evaluationReasons ? JSON.parse(e.evaluationReasons) : undefined,
        controlsRequired: e.controlsRequired ? JSON.parse(e.controlsRequired) : undefined,
        previousHash: e.previousHash,
        eventHash: e.eventHash,
        validation: e.validatedById ? {
          validatedBy: { id: e.validatedById, name: e.validatedByName },
          validatedAt: e.validatedAt,
        } : undefined,
        createdAt: e.createdAt,
      })),
      usages: delegation.usages.map(u => ({
        id: u.id,
        context: {
          projectId: u.projectId,
          projectName: u.projectName,
          bureau: u.bureau,
          supplierId: u.supplierId,
          supplierName: u.supplierName,
          category: u.category,
        },
        document: {
          id: u.documentId,
          ref: u.documentRef,
          type: u.documentType,
          date: u.documentDate,
        },
        amount: u.amount,
        currency: u.currency,
        usedBy: {
          id: u.usedById,
          name: u.usedByName,
        },
        status: u.status,
        controls: {
          dualControl: u.dualControlById ? {
            by: { id: u.dualControlById, name: u.dualControlByName },
            at: u.dualControlAt,
          } : undefined,
          legalReview: u.legalReviewById ? {
            by: { id: u.legalReviewById, name: u.legalReviewByName },
            at: u.legalReviewAt,
            notes: u.legalReviewNotes,
          } : undefined,
          financeCheck: u.financeCheckById ? {
            by: { id: u.financeCheckById, name: u.financeCheckByName },
            at: u.financeCheckAt,
            notes: u.financeCheckNotes,
          } : undefined,
        },
        eventId: u.eventId,
        notes: u.notes,
        createdAt: u.createdAt,
      })),
      
      // Métriques calculées
      metrics: {
        daysToExpiry: Math.ceil(
          (new Date(delegation.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
        usageRate: delegation.maxTotalAmount
          ? Math.round((delegation.usageTotalAmount / delegation.maxTotalAmount) * 100)
          : null,
        remainingAmount: delegation.maxTotalAmount
          ? delegation.maxTotalAmount - delegation.usageTotalAmount
          : null,
        isExpiringSoon: Math.ceil(
          (new Date(delegation.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ) <= 14,
        activeControlsCount: delegation.usages.filter(
          u => u.status === 'PENDING_CONTROL'
        ).length,
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Erreur chargement délégation complète:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement.' },
      { status: 500 }
    );
  }
}

