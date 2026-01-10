/**
 * API Route: GET /api/alerts/[id]/timeline
 * Récupère l'historique d'une alerte
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock timeline
    const timeline = [
      {
        id: 'TL-001',
        alertId: id,
        type: 'creation',
        category: 'system',
        title: 'Alerte créée',
        description: 'Alerte générée automatiquement suite au dépassement du seuil budget (80%)',
        timestamp: '2026-01-10T08:30:00Z',
        actor: 'Système de monitoring',
        actorId: 'SYSTEM',
        actorType: 'system',
        icon: 'alert',
        metadata: {
          threshold: 80,
          actualValue: 85,
          source: 'budget_monitor'
        }
      },
      {
        id: 'TL-002',
        alertId: id,
        type: 'notification',
        category: 'system',
        title: 'Notifications envoyées',
        description: 'Email envoyé à 3 destinataires',
        timestamp: '2026-01-10T08:31:00Z',
        actor: 'Système de notification',
        actorId: 'SYSTEM',
        actorType: 'system',
        icon: 'mail',
        metadata: {
          recipients: ['amadou.diop@company.sn', 'direction@company.sn', 'finances@company.sn'],
          channel: 'email'
        }
      },
      {
        id: 'TL-003',
        alertId: id,
        type: 'view',
        category: 'user',
        title: 'Alerte consultée',
        description: 'L\'alerte a été ouverte et consultée',
        timestamp: '2026-01-10T09:15:00Z',
        actor: 'Amadou DIOP',
        actorId: 'USER-001',
        actorType: 'user',
        icon: 'eye',
        metadata: {
          viewDuration: 45, // seconds
          device: 'desktop'
        }
      },
      {
        id: 'TL-004',
        alertId: id,
        type: 'comment',
        category: 'user',
        title: 'Commentaire ajouté',
        description: 'Je vais analyser les postes de dépenses principaux',
        timestamp: '2026-01-10T09:20:00Z',
        actor: 'Amadou DIOP',
        actorId: 'USER-001',
        actorType: 'user',
        icon: 'message',
        metadata: {}
      },
      {
        id: 'TL-005',
        alertId: id,
        type: 'acknowledge',
        category: 'action',
        title: 'Alerte acquittée',
        description: 'Prise en compte, analyse en cours',
        timestamp: '2026-01-10T10:00:00Z',
        actor: 'Amadou DIOP',
        actorId: 'USER-001',
        actorType: 'user',
        icon: 'check',
        metadata: {
          responseTimeMinutes: 90
        }
      },
      {
        id: 'TL-006',
        alertId: id,
        type: 'document',
        category: 'user',
        title: 'Document attaché',
        description: 'Analyse budgétaire détaillée',
        timestamp: '2026-01-10T14:30:00Z',
        actor: 'Amadou DIOP',
        actorId: 'USER-001',
        actorType: 'user',
        icon: 'file',
        metadata: {
          documentId: 'DOC-123',
          documentName: 'analyse_budget_proj001.pdf',
          documentSize: 256000
        }
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        alertId: id,
        timeline,
        total: timeline.length,
        stats: {
          totalActions: timeline.filter(t => t.category === 'action').length,
          totalComments: timeline.filter(t => t.type === 'comment').length,
          totalDocuments: timeline.filter(t => t.type === 'document').length,
          responseTimeMinutes: 90
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const { id } = await params;
    console.error(`Erreur API GET /api/alerts/${id}/timeline:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de l\'historique',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { type, description, userId, userName, metadata = {} } = body;

    // Validate
    if (!type || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres manquants',
          details: 'type et description sont requis'
        },
        { status: 400 }
      );
    }

    const validTypes = ['comment', 'document', 'action', 'note'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Type invalide',
          details: `Types valides: ${validTypes.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Create timeline entry
    const entry = {
      id: `TL-${Date.now()}`,
      alertId: id,
      type,
      category: 'user',
      title: type === 'comment' ? 'Commentaire ajouté' : 
             type === 'document' ? 'Document attaché' :
             type === 'note' ? 'Note ajoutée' : 'Action effectuée',
      description,
      timestamp: new Date().toISOString(),
      actor: userName || 'Utilisateur',
      actorId: userId || 'USER-001',
      actorType: 'user',
      icon: type === 'comment' ? 'message' : 
            type === 'document' ? 'file' :
            type === 'note' ? 'note' : 'action',
      metadata
    };

    return NextResponse.json({
      success: true,
      message: 'Entrée ajoutée à l\'historique',
      data: entry,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    const { id } = await params;
    console.error(`Erreur API POST /api/alerts/${id}/timeline:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'ajout à l\'historique',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

