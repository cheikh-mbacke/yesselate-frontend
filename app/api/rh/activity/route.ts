import { NextRequest, NextResponse } from 'next/server';

export interface ActivityLog {
  id: string;
  type: 'demande_created' | 'demande_validated' | 'demande_rejected' | 'comment_added' | 'document_uploaded' | 'delegation_created' | 'workflow_triggered' | 'reminder_sent' | 'agent_updated';
  action: string;
  description: string;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  target?: {
    type: 'demande' | 'agent' | 'delegation' | 'workflow';
    id: string;
    label: string;
  };
  metadata?: Record<string, any>;
  timestamp: string;
  importance: 'low' | 'medium' | 'high';
}

// Données simulées
let activityLogs: ActivityLog[] = [
  {
    id: 'ACT-001',
    type: 'demande_created',
    action: 'Création',
    description: 'Nouvelle demande de congé créée',
    actor: {
      id: 'AGT-001',
      name: 'Ahmed Kaci',
      role: 'Agent',
    },
    target: {
      type: 'demande',
      id: 'RH-2026-001',
      label: 'Demande de congé - 10 jours',
    },
    timestamp: '2026-01-10T09:00:00Z',
    importance: 'medium',
  },
  {
    id: 'ACT-002',
    type: 'demande_validated',
    action: 'Validation',
    description: 'Demande validée par le responsable RH',
    actor: {
      id: 'USR-001',
      name: 'Sarah Martin',
      role: 'Responsable RH',
    },
    target: {
      type: 'demande',
      id: 'RH-2026-001',
      label: 'Demande de congé - Ahmed Kaci',
    },
    metadata: {
      previousStatus: 'pending',
      newStatus: 'validated',
      validationType: 'manual',
    },
    timestamp: '2026-01-10T09:30:00Z',
    importance: 'high',
  },
  {
    id: 'ACT-003',
    type: 'workflow_triggered',
    action: 'Workflow',
    description: 'Règle "Validation auto congés courts" déclenchée',
    actor: {
      id: 'SYS',
      name: 'Système',
      role: 'Automatique',
    },
    target: {
      type: 'workflow',
      id: 'wf-1',
      label: 'Validation automatique congés courts',
    },
    metadata: {
      triggeredBy: 'RH-2026-003',
      result: 'success',
    },
    timestamp: '2026-01-10T10:00:00Z',
    importance: 'low',
  },
  {
    id: 'ACT-004',
    type: 'delegation_created',
    action: 'Délégation',
    description: 'Nouvelle délégation de pouvoir créée',
    actor: {
      id: 'USR-001',
      name: 'Sarah Martin',
      role: 'Responsable RH',
    },
    target: {
      type: 'delegation',
      id: 'del-1',
      label: 'Délégation à Thomas Dubois',
    },
    metadata: {
      permissions: ['validate_leave', 'validate_expenses'],
      duration: '7 jours',
    },
    timestamp: '2026-01-10T08:00:00Z',
    importance: 'high',
  },
  {
    id: 'ACT-005',
    type: 'demande_rejected',
    action: 'Rejet',
    description: 'Demande de dépense rejetée - budget insuffisant',
    actor: {
      id: 'USR-002',
      name: 'Thomas Dubois',
      role: 'Contrôleur financier',
    },
    target: {
      type: 'demande',
      id: 'RH-2026-005',
      label: 'Demande de dépense - 45000 DZD',
    },
    metadata: {
      reason: 'Budget déplacements épuisé pour ce trimestre',
    },
    timestamp: '2026-01-09T16:45:00Z',
    importance: 'high',
  },
  {
    id: 'ACT-006',
    type: 'comment_added',
    action: 'Commentaire',
    description: 'Nouveau commentaire sur une demande',
    actor: {
      id: 'USR-002',
      name: 'Thomas Dubois',
      role: 'Contrôleur financier',
    },
    target: {
      type: 'demande',
      id: 'RH-2026-002',
      label: 'Demande de remboursement - Farid Benali',
    },
    timestamp: '2026-01-10T10:15:00Z',
    importance: 'low',
  },
  {
    id: 'ACT-007',
    type: 'reminder_sent',
    action: 'Rappel',
    description: 'Rappel automatique envoyé pour demande en attente',
    actor: {
      id: 'SYS',
      name: 'Système',
      role: 'Automatique',
    },
    target: {
      type: 'demande',
      id: 'RH-2026-004',
      label: 'Demande de déplacement - Yasmine Larbi',
    },
    metadata: {
      reminderType: 'follow_up',
      daysPending: 3,
    },
    timestamp: '2026-01-10T07:00:00Z',
    importance: 'medium',
  },
];

// GET /api/rh/activity - Récupérer l'historique d'activité
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const actorId = searchParams.get('actorId');
    const targetId = searchParams.get('targetId');
    const importance = searchParams.get('importance');
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filtered = [...activityLogs];

    if (type) {
      filtered = filtered.filter((a) => a.type === type);
    }
    if (actorId) {
      filtered = filtered.filter((a) => a.actor.id === actorId);
    }
    if (targetId) {
      filtered = filtered.filter((a) => a.target?.id === targetId);
    }
    if (importance) {
      filtered = filtered.filter((a) => a.importance === importance);
    }

    // Filtrer par plage de dates
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((a) => new Date(a.timestamp) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((a) => new Date(a.timestamp) <= end);
    }

    // Trier par date (plus récent en premier)
    filtered.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limiter le nombre de résultats
    filtered = filtered.slice(0, limit);

    // Grouper par jour pour l'affichage
    const grouped: Record<string, ActivityLog[]> = {};
    filtered.forEach((log) => {
      const day = log.timestamp.split('T')[0];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(log);
    });

    return NextResponse.json({
      data: filtered,
      grouped,
      total: activityLogs.length,
      filtered: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/activity:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/activity - Ajouter une entrée d'activité
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.type || !body.action || !body.actor) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}`,
      type: body.type,
      action: body.action,
      description: body.description || '',
      actor: body.actor,
      target: body.target,
      metadata: body.metadata,
      timestamp: new Date().toISOString(),
      importance: body.importance || 'medium',
    };

    activityLogs.unshift(newLog); // Ajouter au début

    // Garder seulement les 1000 dernières entrées
    if (activityLogs.length > 1000) {
      activityLogs = activityLogs.slice(0, 1000);
    }

    return NextResponse.json(
      {
        data: newLog,
        message: 'Activité enregistrée',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/activity:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/activity - Purger l'historique ancien
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const olderThan = searchParams.get('olderThan'); // Date ISO

    if (!olderThan) {
      return NextResponse.json(
        { error: 'Paramètre olderThan requis', success: false },
        { status: 400 }
      );
    }

    const cutoffDate = new Date(olderThan);
    const initialCount = activityLogs.length;
    
    activityLogs = activityLogs.filter((a) =>
      new Date(a.timestamp) > cutoffDate
    );

    const deletedCount = initialCount - activityLogs.length;

    return NextResponse.json({
      message: `${deletedCount} entrées supprimées`,
      remainingCount: activityLogs.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/activity:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

