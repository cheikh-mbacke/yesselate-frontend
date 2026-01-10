import { NextRequest, NextResponse } from 'next/server';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'deadline' | 'follow_up' | 'review' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    until?: string;
  };
  linkedTo?: {
    type: 'demande' | 'agent' | 'bureau';
    id: string;
    label: string;
  };
  status: 'pending' | 'completed' | 'snoozed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

let reminders: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Relancer validation demande RH-2026-001',
    description: 'Demande en attente depuis 3 jours - priorité urgente',
    type: 'follow_up',
    priority: 'urgent',
    dueDate: '2026-01-10T14:00:00Z',
    linkedTo: {
      type: 'demande',
      id: 'RH-2026-001',
      label: 'Demande de congés - Ahmed Kaci',
    },
    status: 'pending',
    createdBy: 'system',
    createdAt: '2026-01-07T10:00:00Z',
    updatedAt: '2026-01-07T10:00:00Z',
  },
];

// GET /api/rh/reminders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    let filtered = [...reminders];

    if (id) {
      const reminder = filtered.find((r) => r.id === id);
      if (!reminder) {
        return NextResponse.json(
          { error: 'Rappel non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: reminder, success: true });
    }

    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (priority) {
      filtered = filtered.filter((r) => r.priority === priority);
    }
    if (type) {
      filtered = filtered.filter((r) => r.type === type);
    }

    // Trier par priorité et date d'échéance
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/reminders:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/reminders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.dueDate) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      title: body.title,
      description: body.description || '',
      type: body.type || 'follow_up',
      priority: body.priority || 'medium',
      dueDate: body.dueDate,
      recurring: body.recurring,
      linkedTo: body.linkedTo,
      status: 'pending',
      createdBy: body.createdBy || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reminders.push(newReminder);

    return NextResponse.json(
      {
        data: newReminder,
        message: 'Rappel créé avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/reminders:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/reminders
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du rappel requis', success: false },
        { status: 400 }
      );
    }

    const index = reminders.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Rappel non trouvé', success: false },
        { status: 404 }
      );
    }

    // Si on marque comme complété, ajouter la date
    if (updates.status === 'completed' && !reminders[index].completedAt) {
      updates.completedAt = new Date().toISOString();
    }

    reminders[index] = {
      ...reminders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      data: reminders[index],
      message: 'Rappel mis à jour avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/reminders:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/reminders?id=rem-1
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du rappel requis', success: false },
        { status: 400 }
      );
    }

    const index = reminders.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Rappel non trouvé', success: false },
        { status: 404 }
      );
    }

    reminders.splice(index, 1);

    return NextResponse.json({
      message: 'Rappel supprimé avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/reminders:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

