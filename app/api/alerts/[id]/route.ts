/**
 * API Route: GET/PATCH/DELETE /api/alerts/[id]
 * Gestion d'une alerte spécifique
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock detailed alert
    const alert = {
      id,
      type: 'budget',
      title: 'Dépassement budget projet PROJ-001',
      description: 'Le budget du projet a dépassé le seuil de 80%',
      severity: 'critical',
      status: 'open',
      priority: 'haute',
      
      // Context
      context: {
        projectId: 'PROJ-001',
        projectName: 'Rénovation Immeuble Dakar',
        budgetTotal: 150000000,
        budgetUsed: 127500000,
        percentUsed: 85,
        threshold: 80,
        overrun: 7500000,
        currency: 'XOF'
      },
      
      // Impact
      impact: {
        level: 'élevé',
        areas: ['Finances', 'Planning', 'Ressources'],
        estimatedCost: 12500000,
        riskScore: 8.5,
        affectedStakeholders: ['Direction', 'Maître d\'ouvrage', 'Comptabilité']
      },
      
      // Actions
      actions: [
        {
          id: 'ACT-001',
          type: 'acknowledge',
          label: 'Acquitter',
          description: 'Marquer comme prise en compte',
          available: true
        },
        {
          id: 'ACT-002',
          type: 'escalate',
          label: 'Escalader',
          description: 'Transférer à la direction',
          available: true
        },
        {
          id: 'ACT-003',
          type: 'resolve',
          label: 'Résoudre',
          description: 'Marquer comme résolue',
          available: false,
          reason: 'Nécessite une action corrective d\'abord'
        }
      ],
      
      // Timeline
      timeline: [
        {
          id: 'TL-001',
          type: 'creation',
          description: 'Alerte créée automatiquement',
          timestamp: '2026-01-10T08:30:00Z',
          actor: 'Système',
          actorType: 'system'
        },
        {
          id: 'TL-002',
          type: 'notification',
          description: 'Notification envoyée au gestionnaire',
          timestamp: '2026-01-10T08:31:00Z',
          actor: 'Système',
          actorType: 'system'
        },
        {
          id: 'TL-003',
          type: 'view',
          description: 'Alerte consultée',
          timestamp: '2026-01-10T09:15:00Z',
          actor: 'Amadou DIOP',
          actorType: 'user'
        }
      ],
      
      // Recommendations
      recommendations: [
        {
          id: 'REC-001',
          priority: 1,
          title: 'Réviser les engagements',
          description: 'Analyser les postes de dépense et identifier les économies possibles',
          effort: 'moyen',
          impact: 'élevé'
        },
        {
          id: 'REC-002',
          priority: 2,
          title: 'Demander rallonge budgétaire',
          description: 'Préparer une demande de budget supplémentaire avec justificatifs',
          effort: 'élevé',
          impact: 'élevé'
        },
        {
          id: 'REC-003',
          priority: 3,
          title: 'Reporter travaux non critiques',
          description: 'Identifier et reporter les travaux secondaires',
          effort: 'faible',
          impact: 'moyen'
        }
      ],
      
      // Related
      relatedAlerts: ['ALERT-002', 'ALERT-005'],
      relatedDocuments: [
        {
          id: 'DOC-001',
          name: 'Budget_PROJ-001.xlsx',
          type: 'spreadsheet',
          url: '/documents/budget_proj001.xlsx'
        }
      ],
      
      // Metadata
      responsible: 'Amadou DIOP',
      responsibleEmail: 'amadou.diop@company.sn',
      bureau: 'Bureau Finances',
      daysOpen: 2,
      slaDeadline: '2026-01-12T18:00:00Z',
      slaStatus: 'warning', // 'ok' | 'warning' | 'breached'
      
      createdAt: '2026-01-10T08:30:00Z',
      updatedAt: '2026-01-10T09:15:00Z',
      acknowledgedAt: null,
      resolvedAt: null,
      
      tags: ['budget', 'projet', 'dépassement', 'urgent']
    };

    return NextResponse.json({
      success: true,
      data: alert,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const { id } = await params;
    console.error(`Erreur API GET /api/alerts/${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de l\'alerte',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { action, comment, assignTo } = body;

    // Validate action
    const validActions = ['acknowledge', 'escalate', 'resolve', 'dismiss', 'reopen', 'assign'];
    if (action && !validActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Action invalide',
          details: `Actions valides: ${validActions.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Simulate update
    const updates: Record<string, unknown> = {
      id,
      updatedAt: new Date().toISOString()
    };

    switch (action) {
      case 'acknowledge':
        updates.status = 'acknowledged';
        updates.acknowledgedAt = new Date().toISOString();
        break;
      case 'escalate':
        updates.status = 'escalated';
        updates.escalatedAt = new Date().toISOString();
        updates.escalatedTo = assignTo || 'Direction';
        break;
      case 'resolve':
        updates.status = 'resolved';
        updates.resolvedAt = new Date().toISOString();
        updates.resolution = comment || 'Résolu';
        break;
      case 'dismiss':
        updates.status = 'dismissed';
        updates.dismissedAt = new Date().toISOString();
        updates.dismissReason = comment;
        break;
      case 'reopen':
        updates.status = 'open';
        updates.reopenedAt = new Date().toISOString();
        break;
      case 'assign':
        updates.responsible = assignTo;
        updates.assignedAt = new Date().toISOString();
        break;
    }

    if (comment) {
      updates.lastComment = comment;
    }

    return NextResponse.json({
      success: true,
      message: `Alerte ${id} mise à jour avec succès`,
      data: updates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const { id } = await params;
    console.error(`Erreur API PATCH /api/alerts/${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de l\'alerte',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Simulate deletion (soft delete in practice)
    return NextResponse.json({
      success: true,
      message: `Alerte ${id} supprimée avec succès`,
      data: { id, deletedAt: new Date().toISOString() },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const { id } = await params;
    console.error(`Erreur API DELETE /api/alerts/${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de l\'alerte',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

