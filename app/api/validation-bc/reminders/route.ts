import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/validation-bc/reminders
 * 
 * Récupère les rappels et échéances
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'active';

    // Mock reminders
    const reminders = [
      {
        id: 'REM-001',
        type: 'sla_warning',
        priority: 'high',
        title: 'BC-2026-0048 expire dans 4 heures',
        documentId: 'BC-2026-0048',
        documentType: 'bc',
        dueAt: '2026-01-10T17:00:00Z',
        hoursRemaining: 4,
        createdAt: '2026-01-10T09:00:00Z',
        status: 'active',
        notificationsSent: 2,
        lastNotificationAt: '2026-01-10T11:00:00Z',
        assignedTo: ['USER-001', 'USER-002'],
      },
      {
        id: 'REM-002',
        type: 'follow_up',
        priority: 'medium',
        title: 'Relance fournisseur - documents manquants',
        documentId: 'FAC-2026-0082',
        documentType: 'facture',
        dueAt: '2026-01-11T09:00:00Z',
        hoursRemaining: 20,
        createdAt: '2026-01-09T14:00:00Z',
        status: 'active',
        notificationsSent: 1,
        lastNotificationAt: '2026-01-09T14:00:00Z',
        assignedTo: ['USER-003'],
        notes: 'Attestation de régularité fiscale en attente',
      },
      {
        id: 'REM-003',
        type: 'approval_pending',
        priority: 'high',
        title: 'Approbation DG requise - BC-2026-0049',
        documentId: 'BC-2026-0049',
        documentType: 'bc',
        dueAt: '2026-01-12T12:00:00Z',
        hoursRemaining: 48,
        createdAt: '2026-01-10T08:00:00Z',
        status: 'active',
        notificationsSent: 0,
        assignedTo: ['USER-DG'],
        escalatedFrom: 'USER-DAF',
      },
      {
        id: 'REM-004',
        type: 'recurring',
        priority: 'low',
        title: 'Rapport hebdomadaire validation BC',
        dueAt: '2026-01-13T08:00:00Z',
        hoursRemaining: 72,
        createdAt: '2026-01-06T08:00:00Z',
        status: 'active',
        notificationsSent: 0,
        assignedTo: ['USER-001'],
        recurrence: 'weekly',
      },
      {
        id: 'REM-005',
        type: 'payment_due',
        priority: 'high',
        title: 'Échéance paiement fournisseur',
        documentId: 'FAC-2026-0075',
        documentType: 'facture',
        dueAt: '2026-01-15T00:00:00Z',
        hoursRemaining: 120,
        createdAt: '2026-01-05T10:00:00Z',
        status: 'active',
        notificationsSent: 1,
        lastNotificationAt: '2026-01-08T08:00:00Z',
        assignedTo: ['USER-PAY'],
        amount: 12500000,
        supplier: 'TECH SERVICES SARL',
      },
    ];

    let filtered = reminders;
    if (status !== 'all') {
      filtered = reminders.filter(r => r.status === status);
    }

    // Trier par priorité et échéance
    filtered.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
                          (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      return a.hoursRemaining - b.hoursRemaining;
    });

    return NextResponse.json({
      success: true,
      data: filtered,
      summary: {
        total: reminders.length,
        urgent: reminders.filter(r => r.hoursRemaining < 8).length,
        today: reminders.filter(r => r.hoursRemaining < 24).length,
        thisWeek: reminders.filter(r => r.hoursRemaining < 168).length,
        byType: {
          sla_warning: reminders.filter(r => r.type === 'sla_warning').length,
          follow_up: reminders.filter(r => r.type === 'follow_up').length,
          approval_pending: reminders.filter(r => r.type === 'approval_pending').length,
          payment_due: reminders.filter(r => r.type === 'payment_due').length,
        },
      },
    });
  } catch (error) {
    console.error('Erreur récupération rappels:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/validation-bc/reminders
 * 
 * Créer un rappel
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, title, documentId, dueAt, assignedTo, notes } = body;

    if (!title || !dueAt) {
      return NextResponse.json(
        { error: 'title et dueAt sont requis' },
        { status: 400 }
      );
    }

    const now = new Date();
    const due = new Date(dueAt);
    const hoursRemaining = Math.max(0, (due.getTime() - now.getTime()) / (1000 * 60 * 60));

    const newReminder = {
      id: `REM-${Date.now()}`,
      type: type || 'custom',
      priority: hoursRemaining < 8 ? 'high' : hoursRemaining < 24 ? 'medium' : 'low',
      title,
      documentId,
      dueAt,
      hoursRemaining: Math.round(hoursRemaining),
      createdAt: now.toISOString(),
      status: 'active',
      notificationsSent: 0,
      assignedTo: assignedTo || [],
      notes,
      createdBy: 'current_user', // TODO: Récupérer depuis session
    };

    return NextResponse.json({
      success: true,
      data: newReminder,
    });
  } catch (error) {
    console.error('Erreur création rappel:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

