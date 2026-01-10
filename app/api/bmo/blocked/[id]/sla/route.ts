// API Route: POST /api/bmo/blocked/[id]/sla
// Gestion SLA - Extension délai, modification échéance

import { NextRequest, NextResponse } from 'next/server';
import { blockedMockData } from '@/lib/mocks/blockedMockData';

export interface SLABody {
  action: 'extend' | 'modify' | 'reset';
  extension?: number; // heures
  newDeadline?: string; // ISO date
  justification: string;
  approved?: boolean; // Si nécessite approbation
  approvedBy?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: SLABody = await request.json();

    // Validations
    if (!body.action || !body.justification) {
      return NextResponse.json(
        { error: 'action and justification are required' },
        { status: 400 }
      );
    }

    if (body.justification.length < 30) {
      return NextResponse.json(
        { error: 'Justification must be at least 30 characters' },
        { status: 400 }
      );
    }

    if (body.action === 'extend' && !body.extension) {
      return NextResponse.json(
        { error: 'extension (hours) is required for extend action' },
        { status: 400 }
      );
    }

    if (body.action === 'modify' && !body.newDeadline) {
      return NextResponse.json(
        { error: 'newDeadline is required for modify action' },
        { status: 400 }
      );
    }

    // TODO: Récupérer dossier
    const existingDossier = {
      id,
      status: 'pending',
      impactLevel: 'high',
      blockedSince: '2026-01-08T10:00:00.000Z',
      sla: {
        deadline: '2026-01-13T10:00:00.000Z',
        status: 'warning',
      },
    };

    if (!existingDossier) {
      return NextResponse.json(
        { error: 'Dossier not found' },
        { status: 404 }
      );
    }

    // TODO: Vérifier permissions (BMO, DAF, ou admin uniquement)

    let newDeadline: string;
    let originalDeadline = existingDossier.sla.deadline;

    switch (body.action) {
      case 'extend':
        // Extension par X heures
        newDeadline = new Date(
          new Date(originalDeadline).getTime() + body.extension! * 60 * 60 * 1000
        ).toISOString();
        break;

      case 'modify':
        // Nouvelle deadline spécifique
        newDeadline = body.newDeadline!;
        
        // Vérifier que la nouvelle deadline est dans le futur
        if (new Date(newDeadline) <= new Date()) {
          return NextResponse.json(
            { error: 'New deadline must be in the future' },
            { status: 400 }
          );
        }
        break;

      case 'reset':
        // Reset selon SLA par défaut pour impact level
        const defaultSLA = blockedMockData.slaConfig.byImpact[
          existingDossier.impactLevel as keyof typeof blockedMockData.slaConfig.byImpact
        ];
        newDeadline = new Date(
          new Date(existingDossier.blockedSince).getTime() +
            defaultSLA.totalMaxDuration * 24 * 60 * 60 * 1000
        ).toISOString();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Calculer heures restantes
    const hoursRemaining = Math.max(
      0,
      Math.floor((new Date(newDeadline).getTime() - Date.now()) / (1000 * 60 * 60))
    );

    // Déterminer nouveau status SLA
    const slaStatus = hoursRemaining > 48 ? 'ok' : hoursRemaining > 24 ? 'warning' : 'critical';

    // TODO: Mettre à jour SLA en DB
    // await prisma.blockedDossier.update({
    //   where: { id },
    //   data: {
    //     sla: {
    //       deadline: newDeadline,
    //       status: slaStatus,
    //       lastModified: new Date(),
    //       modificationReason: body.justification,
    //     }
    //   }
    // });

    // TODO: Créer timeline entry
    // TODO: Créer audit trail (changement SLA nécessite justification)
    // TODO: Notifier parties prenantes du nouveau délai
    // TODO: Recréer alertes/rappels automatiques

    const slaModification = {
      id: `sla-${Date.now()}`,
      dossierId: id,
      action: body.action,
      originalDeadline,
      newDeadline,
      extension: body.action === 'extend' ? body.extension : null,
      hoursRemaining,
      newStatus: slaStatus,
      justification: body.justification,
      modifiedAt: new Date().toISOString(),
      modifiedBy: 'current-user-id',
      approved: body.approved || false,
      approvedBy: body.approvedBy,
    };

    console.log(`[blocked/${id}/sla] SLA modifié:`, {
      id,
      action: body.action,
      newDeadline,
      hoursRemaining,
    });

    return NextResponse.json({
      success: true,
      message: `SLA ${
        body.action === 'extend' ? 'étendu' : body.action === 'modify' ? 'modifié' : 'réinitialisé'
      } avec succès`,
      sla: slaModification,
      notifications: {
        sent: ['responsable', 'observateurs'],
        alertsRescheduled: true,
      },
    });
  } catch (error) {
    console.error(`[blocked/${params.id}/sla] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to modify SLA', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET pour voir historique modifications SLA
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Récupérer historique SLA
    const slaHistory = [
      {
        id: 'sla-001',
        action: 'reset',
        originalDeadline: '2026-01-13T10:00:00.000Z',
        newDeadline: '2026-01-15T10:00:00.000Z',
        justification: 'SLA initial basé sur impact high (5 jours)',
        modifiedAt: '2026-01-08T10:00:00.000Z',
        modifiedBy: 'Système',
      },
      {
        id: 'sla-002',
        action: 'extend',
        originalDeadline: '2026-01-15T10:00:00.000Z',
        newDeadline: '2026-01-16T10:00:00.000Z',
        extension: 24,
        justification: 'Extension 24h pour permettre substitution BMO',
        modifiedAt: '2026-01-09T10:00:00.000Z',
        modifiedBy: 'Amadou SECK (BMO)',
        approved: true,
        approvedBy: 'DAF',
      },
    ];

    const currentSLA = slaHistory[slaHistory.length - 1];

    return NextResponse.json({
      dossierId: id,
      current: {
        deadline: currentSLA.newDeadline,
        hoursRemaining: Math.max(
          0,
          Math.floor(
            (new Date(currentSLA.newDeadline).getTime() - Date.now()) / (1000 * 60 * 60)
          )
        ),
        status: 'warning',
      },
      history: slaHistory,
    });
  } catch (error) {
    console.error(`[blocked/${params.id}/sla] Get error:`, error);
    return NextResponse.json(
      { error: 'Failed to get SLA history' },
      { status: 500 }
    );
  }
}

