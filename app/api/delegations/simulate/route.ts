/**
 * API Simulation de délégation
 * ============================
 * 
 * POST /api/delegations/simulate
 * 
 * Simule une action sur une délégation pour savoir si elle serait autorisée.
 * C'est l'"arme suprême" : permet de tester avant d'agir.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluate } from '@/lib/delegation/policy-engine';
import { mapPrismaToDelegation } from '@/lib/delegation/mapper';
import type { ActionContext, DelegationAction, Currency, DocumentType, SimulationResponse } from '@/lib/delegation/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      delegationId,
      action,
      projectId,
      projectName,
      bureau,
      amount,
      currency = 'XOF',
      supplierId,
      supplierName,
      category,
      documentType,
      documentRef,
      requesterId,
      requesterName,
    } = body as {
      delegationId: string;
      action: DelegationAction;
      projectId?: string;
      projectName?: string;
      bureau: string;
      amount: number;
      currency?: Currency;
      supplierId?: string;
      supplierName?: string;
      category?: string;
      documentType?: DocumentType;
      documentRef?: string;
      requesterId?: string;
      requesterName?: string;
    };
    
    // Validation
    if (!delegationId || !action || !bureau || amount == null) {
      return NextResponse.json(
        { error: 'Paramètres manquants: delegationId, action, bureau, amount requis.' },
        { status: 400 }
      );
    }
    
    // Charger la délégation avec ses relations
    const delegation = await prisma.delegation.findUnique({
      where: { id: delegationId },
      include: {
        policies: true,
        actors: true,
        engagements: true,
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
    
    // Construire le contexte
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
      requesterId,
      requesterName,
      timestamp: new Date(),
    };
    
    // Évaluer
    const evaluation = evaluate(delegationFull, context);
    
    // Calculer les infos supplémentaires
    const now = new Date();
    const remainingDays = Math.ceil(
      (delegationFull.endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const remainingAmount = delegationFull.maxTotalAmount
      ? delegationFull.maxTotalAmount - delegationFull.usageTotalAmount
      : undefined;
    
    // Détecter les risques spécifiques à cette simulation
    const risks: SimulationResponse['risks'] = [];
    
    if (remainingDays <= 7) {
      risks.push({
        type: 'CONTINUITY',
        level: remainingDays <= 2 ? 'HIGH' : 'MEDIUM',
        description: `Délégation expire dans ${remainingDays} jour(s).`,
        mitigation: 'Prolonger ou préparer une relève.',
        detectedAt: now,
      });
    }
    
    if (remainingAmount !== undefined && amount > remainingAmount) {
      risks.push({
        type: 'BUDGET_OVERRUN',
        level: 'CRITICAL',
        description: `Montant demandé (${amount}) > budget restant (${remainingAmount}).`,
        mitigation: 'Demander une extension de plafond.',
        detectedAt: now,
      });
    }
    
    if (requesterId === delegationFull.delegate.id) {
      risks.push({
        type: 'CONFLICT_OF_INTEREST',
        level: 'HIGH',
        description: 'Le délégataire valide sa propre demande.',
        mitigation: 'Activer le dual control.',
        detectedAt: now,
      });
    }
    
    const response: SimulationResponse = {
      request: {
        delegationId,
        context,
      },
      evaluation,
      delegation: {
        id: delegationFull.id,
        title: delegationFull.title,
        status: delegationFull.status,
        delegate: delegationFull.delegate,
        endsAt: delegationFull.endsAt,
        remainingAmount,
        remainingOps: delegationFull.maxDailyOps
          ? delegationFull.maxDailyOps - delegationFull.usageCount
          : undefined,
      },
      risks,
      timeline: {
        wouldBeNthUsage: delegationFull.usageCount + 1,
        totalAfterUsage: delegationFull.usageTotalAmount + amount,
        remainingDays,
      },
      simulatedAt: now,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Erreur simulation délégation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la simulation.' },
      { status: 500 }
    );
  }
}

