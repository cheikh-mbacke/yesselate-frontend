/**
 * API Évaluation d'une action sur une délégation
 * ===============================================
 * 
 * POST /api/delegations/[id]/evaluate
 * 
 * Évalue si une action spécifique est autorisée par cette délégation.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluate, formatEvaluationSummary } from '@/lib/delegation/policy-engine';
import { mapPrismaToDelegation } from '@/lib/delegation/mapper';
import type { ActionContext, DelegationAction, Currency } from '@/lib/delegation/types';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const {
      action,
      projectId,
      projectName,
      bureau,
      amount,
      currency = 'XOF',
      supplierId,
      supplierName,
      category,
      requesterId,
      requesterName,
    } = body as {
      action: DelegationAction;
      projectId?: string;
      projectName?: string;
      bureau: string;
      amount: number;
      currency?: Currency;
      supplierId?: string;
      supplierName?: string;
      category?: string;
      requesterId?: string;
      requesterName?: string;
    };
    
    // Validation
    if (!action || !bureau || amount == null) {
      return NextResponse.json(
        { error: 'Paramètres manquants: action, bureau, amount requis.' },
        { status: 400 }
      );
    }
    
    // Charger la délégation
    const delegation = await prisma.delegation.findUnique({
      where: { id },
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
    
    // Mapper et évaluer
    const delegationFull = mapPrismaToDelegation(delegation as any);
    
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
      requesterId,
      requesterName,
      timestamp: new Date(),
    };
    
    const result = evaluate(delegationFull, context);
    const summary = formatEvaluationSummary(result);
    
    return NextResponse.json({
      ...result,
      summary,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Erreur évaluation délégation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'évaluation.' },
      { status: 500 }
    );
  }
}

