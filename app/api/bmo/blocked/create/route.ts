// API Route: POST /api/bmo/blocked/create
// Crée un nouveau dossier bloqué

import { NextRequest, NextResponse } from 'next/server';
import { blockedMockData } from '@/lib/mocks/blockedMockData';

export interface CreateBlockedBody {
  type: string;
  relatedDocumentId: string;
  relatedDocumentType: 'bc' | 'facture' | 'contrat' | 'paiement';
  relatedDocumentReference: string;
  relatedDocumentAmount: number;
  bureau: string;
  description: string;
  impact?: 'critical' | 'high' | 'medium' | 'low';
  assignTo?: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBlockedBody = await request.json();

    // Validations
    if (!body.type || !body.relatedDocumentId || !body.bureau || !body.description) {
      return NextResponse.json(
        { error: 'Type, relatedDocumentId, bureau, and description are required' },
        { status: 400 }
      );
    }

    if (body.description.length < 20) {
      return NextResponse.json(
        { error: 'Description must be at least 20 characters' },
        { status: 400 }
      );
    }

    // Générer référence unique
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const reference = `BLOCK-${year}${month}-${randomNum}`;

    // Déterminer impact automatique si non fourni
    const impact = body.impact || (
      body.relatedDocumentAmount > 20000000 ? 'critical' :
      body.relatedDocumentAmount > 10000000 ? 'high' :
      body.relatedDocumentAmount > 5000000 ? 'medium' : 'low'
    );

    // TODO: Vérifier que le document source existe
    // TODO: Vérifier que le bureau existe
    // TODO: Déterminer workflow résolution selon type
    // TODO: Assigner responsable automatiquement
    // TODO: Créer dossier en DB
    // TODO: Créer timeline entry initiale
    // TODO: Envoyer notifications

    // Mock response
    const newDossier = {
      id: `blocked-${Date.now()}`,
      reference,
      type: body.type,
      status: 'pending',
      impactLevel: impact,
      bureau: body.bureau,
      blockedSince: new Date().toISOString(),
      delayDays: 0,
      description: body.description,
      relatedDocument: {
        type: body.relatedDocumentType,
        id: body.relatedDocumentId,
        reference: body.relatedDocumentReference,
        amount: body.relatedDocumentAmount,
      },
      assignedTo: body.assignTo || blockedMockData.users.chef1.id,
      priority: body.priority || 'normal',
      createdAt: new Date().toISOString(),
      workflow: {
        currentStep: 1,
        totalSteps: 4,
        status: 'detection',
      },
      sla: {
        deadline: new Date(
          Date.now() + 
          blockedMockData.slaConfig.byImpact[impact].totalMaxDuration * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: 'ok',
      },
    };

    console.log(`[blocked/create] Dossier créé:`, {
      reference,
      type: body.type,
      impact,
      bureau: body.bureau,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Dossier bloqué créé avec succès',
        dossier: newDossier,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[blocked/create] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create blocked dossier', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

