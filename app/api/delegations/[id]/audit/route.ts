/**
 * API Audit d'une délégation
 * ===========================
 * 
 * GET /api/delegations/[id]/audit
 * 
 * Retourne le journal d'audit complet avec vérification d'intégrité de la chaîne.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyChain, getHashAlgorithm, shortHash } from '@/lib/delegation/hash';
import type { ChainEvent } from '@/lib/delegation/hash';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Charger la délégation avec tous ses événements
    const delegation = await prisma.delegation.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!delegation) {
      return NextResponse.json({ error: 'Délégation introuvable.' }, { status: 404 });
    }

    // Préparer les événements pour vérification
    const chainEvents: ChainEvent[] = delegation.events.map(e => ({
      id: e.id,
      previousHash: e.previousHash,
      eventHash: e.eventHash,
      eventType: e.eventType,
      actorId: e.actorId,
      details: e.details ? (typeof e.details === 'string' ? e.details : JSON.stringify(e.details)) : undefined,
      targetDocRef: e.targetDocRef ?? undefined,
      targetAmount: e.targetAmount ?? undefined,
      createdAt: e.createdAt,
    }));

    // Vérifier l'intégrité de la chaîne
    const verification = verifyChain(chainEvents);

    // Formater les événements pour l'affichage
    const events = delegation.events.map((e, i) => ({
      id: e.id,
      index: i,
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
      } : null,
      evaluationResult: e.evaluationResult,
      evaluationReasons: e.evaluationReasons ? JSON.parse(e.evaluationReasons) : null,
      controlsRequired: e.controlsRequired ? JSON.parse(e.controlsRequired) : null,
      validation: e.validatedById ? {
        by: { id: e.validatedById, name: e.validatedByName },
        at: e.validatedAt,
      } : null,
      hashes: {
        previous: shortHash(e.previousHash),
        current: shortHash(e.eventHash),
        previousFull: e.previousHash,
        currentFull: e.eventHash,
      },
      createdAt: e.createdAt,
    }));

    return NextResponse.json({
      delegationId: id,
      title: delegation.title,
      status: delegation.status,
      
      // Informations de traçabilité
      hashes: {
        decision: delegation.decisionHash,
        head: delegation.headHash,
        algorithm: getHashAlgorithm(),
      },
      
      // Résultat de vérification
      verification: {
        valid: verification.valid,
        message: verification.message,
        algorithm: verification.algorithm,
        eventsChecked: verification.eventsChecked,
        brokenAt: verification.brokenAt,
        brokenEventId: verification.brokenEventId,
      },
      
      // Journal des événements
      events,
      totalEvents: events.length,
      
      // Méta
      auditedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Erreur audit délégation:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'audit.' }, { status: 500 });
  }
}

