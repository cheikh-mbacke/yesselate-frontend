/**
 * API Créer une délégation
 * ========================
 * 
 * POST /api/delegations/create
 * 
 * Crée une nouvelle délégation en statut 'draft'.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeEventHash } from '@/lib/delegation/hash';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      // Identité
      title,
      category,
      object,
      description,
      legalBasis,
      
      // Acteurs principaux
      grantorId,
      grantorName,
      grantorRole,
      grantorEmail,
      delegateId,
      delegateName,
      delegateRole,
      delegateEmail,
      delegatePhone,
      
      // Contexte
      bureau,
      
      // Période
      startsAt,
      endsAt,
      extendable = true,
      maxExtensions = 2,
      extensionDays = 90,
      
      // Périmètre
      projectScopeMode = 'ALL',
      projectScopeList,
      bureauScopeMode = 'ALL',
      bureauScopeList,
      supplierScopeMode = 'ALL',
      supplierScopeList,
      categoryScopeList,
      
      // Limites
      maxAmount,
      maxTotalAmount,
      currency = 'XOF',
      maxDailyOps,
      maxMonthlyOps,
      allowedHoursStart,
      allowedHoursEnd,
      allowedDays,
      
      // Contrôles
      requiresDualControl = false,
      requiresLegalReview = false,
      requiresFinanceCheck = false,
      requiresStepUpAuth = false,
      requiresDocumentation = false,
      
      // Référence décision
      decisionRef,
      decisionDate,
      
      // Acteur créateur
      createdById,
      createdByName,
    } = body;

    // Validations
    if (!title || !category || !object) {
      return NextResponse.json(
        { error: 'title, category et object sont requis.' },
        { status: 400 }
      );
    }

    if (!grantorId || !grantorName || !delegateId || !delegateName) {
      return NextResponse.json(
        { error: 'Les informations du délégant et du délégataire sont requises.' },
        { status: 400 }
      );
    }

    if (!bureau) {
      return NextResponse.json(
        { error: 'Le bureau est requis.' },
        { status: 400 }
      );
    }

    if (!startsAt || !endsAt) {
      return NextResponse.json(
        { error: 'Les dates de début et fin sont requises.' },
        { status: 400 }
      );
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Dates invalides.' },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'La date de fin doit être postérieure à la date de début.' },
        { status: 400 }
      );
    }

    // Générer l'ID et le code
    const id = randomUUID();
    const year = new Date().getFullYear();
    const count = await prisma.delegation.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });
    const code = `DEL-${year}-${String(count + 1).padStart(3, '0')}`;

    // Créer le hash de décision initial
    const decisionPayload = {
      type: 'CREATED',
      delegationId: id,
      code,
      title,
      category,
      grantor: { id: grantorId, name: grantorName },
      delegate: { id: delegateId, name: delegateName },
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      createdBy: { id: createdById, name: createdByName },
      timestamp: new Date().toISOString(),
    };
    const decisionHash = computeEventHash(decisionPayload, null);

    // Créer la délégation
    const delegation = await prisma.$transaction(async (tx) => {
      const newDelegation = await tx.delegation.create({
        data: {
          id,
          code,
          title,
          category,
          status: 'draft',
          object,
          description: description || null,
          legalBasis: legalBasis || null,
          
          grantorId,
          grantorName,
          grantorRole: grantorRole || null,
          grantorEmail: grantorEmail || null,
          
          delegateId,
          delegateName,
          delegateRole: delegateRole || null,
          delegateEmail: delegateEmail || null,
          delegatePhone: delegatePhone || null,
          
          bureau,
          
          startsAt: startDate,
          endsAt: endDate,
          extendable: extendable ? 1 : 0,
          maxExtensions,
          extensionDays,
          
          projectScopeMode,
          projectScopeList: projectScopeList ? JSON.stringify(projectScopeList) : null,
          bureauScopeMode,
          bureauScopeList: bureauScopeList ? JSON.stringify(bureauScopeList) : null,
          supplierScopeMode,
          supplierScopeList: supplierScopeList ? JSON.stringify(supplierScopeList) : null,
          categoryScopeList: categoryScopeList ? JSON.stringify(categoryScopeList) : null,
          
          maxAmount: maxAmount || null,
          maxTotalAmount: maxTotalAmount || null,
          currency,
          maxDailyOps: maxDailyOps || null,
          maxMonthlyOps: maxMonthlyOps || null,
          allowedHoursStart: allowedHoursStart || null,
          allowedHoursEnd: allowedHoursEnd || null,
          allowedDays: allowedDays ? JSON.stringify(allowedDays) : null,
          
          requiresDualControl: requiresDualControl ? 1 : 0,
          requiresLegalReview: requiresLegalReview ? 1 : 0,
          requiresFinanceCheck: requiresFinanceCheck ? 1 : 0,
          requiresStepUpAuth: requiresStepUpAuth ? 1 : 0,
          requiresDocumentation: requiresDocumentation ? 1 : 0,
          
          usageCount: 0,
          usageTotalAmount: 0,
          
          decisionHash,
          headHash: decisionHash,
          decisionRef: decisionRef || null,
          decisionDate: decisionDate ? new Date(decisionDate) : null,
        },
      });

      // Créer l'événement de création
      await tx.delegationEvent.create({
        data: {
          delegationId: id,
          eventType: 'CREATED',
          actorId: createdById || grantorId,
          actorName: createdByName || grantorName,
          summary: `Délégation "${title}" créée`,
          details: JSON.stringify({ category, bureau, delegate: delegateName }),
          previousHash: null,
          eventHash: decisionHash,
        },
      });

      // Ajouter les acteurs par défaut
      await tx.delegationActor.createMany({
        data: [
          {
            delegationId: id,
            userId: grantorId,
            userName: grantorName,
            userRole: grantorRole || null,
            userEmail: grantorEmail || null,
            roleType: 'GRANTOR',
            required: 1,
            canApprove: 1,
            canRevoke: 1,
            mustBeNotified: 1,
          },
          {
            delegationId: id,
            userId: delegateId,
            userName: delegateName,
            userRole: delegateRole || null,
            userEmail: delegateEmail || null,
            roleType: 'DELEGATE',
            required: 1,
            canApprove: 0,
            canRevoke: 0,
            mustBeNotified: 1,
          },
        ],
      });

      return newDelegation;
    });

    return NextResponse.json({
      success: true,
      delegation: {
        id: delegation.id,
        code: delegation.code,
        title: delegation.title,
        status: delegation.status,
        category: delegation.category,
        startsAt: delegation.startsAt,
        endsAt: delegation.endsAt,
        decisionHash: delegation.decisionHash,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Erreur création délégation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création.' },
      { status: 500 }
    );
  }
}

