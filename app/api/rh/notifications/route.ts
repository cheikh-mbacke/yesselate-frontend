import { NextRequest, NextResponse } from 'next/server';

export interface RHNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  category: 'demande' | 'validation' | 'deadline' | 'system' | 'delegation' | 'workflow';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  recipient: {
    id: string;
    name: string;
    email?: string;
  };
  sender?: {
    id: string;
    name: string;
  };
  relatedEntity?: {
    type: 'demande' | 'agent' | 'workflow' | 'delegation';
    id: string;
    label: string;
  };
  actions?: Array<{
    id: string;
    label: string;
    action: string;
    variant: 'primary' | 'secondary' | 'danger';
  }>;
  isRead: boolean;
  readAt?: string;
  isArchived: boolean;
  archivedAt?: string;
  expiresAt?: string;
  channels: ('app' | 'email' | 'sms' | 'push')[];
  deliveryStatus: {
    app?: 'pending' | 'delivered' | 'failed';
    email?: 'pending' | 'sent' | 'delivered' | 'failed';
    sms?: 'pending' | 'sent' | 'delivered' | 'failed';
    push?: 'pending' | 'delivered' | 'failed';
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Données simulées
let notifications: RHNotification[] = [
  {
    id: 'NOTIF-001',
    type: 'warning',
    category: 'deadline',
    title: 'Délai de validation dépassé',
    message: 'La demande RH-2026-001 attend votre validation depuis 5 jours.',
    priority: 'high',
    recipient: {
      id: 'USR-001',
      name: 'Sarah Martin',
      email: 'sarah.martin@example.com',
    },
    relatedEntity: {
      type: 'demande',
      id: 'RH-2026-001',
      label: 'Congé annuel - Ahmed Kaci',
    },
    actions: [
      {
        id: 'validate',
        label: 'Valider',
        action: 'validate_demande',
        variant: 'primary',
      },
      {
        id: 'reject',
        label: 'Refuser',
        action: 'reject_demande',
        variant: 'danger',
      },
    ],
    isRead: false,
    isArchived: false,
    channels: ['app', 'email'],
    deliveryStatus: {
      app: 'delivered',
      email: 'sent',
    },
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'NOTIF-002',
    type: 'info',
    category: 'demande',
    title: 'Nouvelle demande reçue',
    message: 'Farid Benali a soumis une demande de remboursement de frais.',
    priority: 'normal',
    recipient: {
      id: 'USR-001',
      name: 'Sarah Martin',
    },
    sender: {
      id: 'AGT-002',
      name: 'Farid Benali',
    },
    relatedEntity: {
      type: 'demande',
      id: 'RH-2026-005',
      label: 'Remboursement frais - Farid Benali',
    },
    isRead: true,
    readAt: '2026-01-10T09:00:00Z',
    isArchived: false,
    channels: ['app'],
    deliveryStatus: {
      app: 'delivered',
    },
    createdAt: '2026-01-10T08:30:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'NOTIF-003',
    type: 'success',
    category: 'validation',
    title: 'Demande validée',
    message: 'Votre demande de congé du 15/01 au 20/01 a été validée.',
    priority: 'normal',
    recipient: {
      id: 'AGT-001',
      name: 'Ahmed Kaci',
      email: 'ahmed.kaci@example.com',
    },
    sender: {
      id: 'USR-001',
      name: 'Sarah Martin',
    },
    relatedEntity: {
      type: 'demande',
      id: 'RH-2026-001',
      label: 'Congé annuel',
    },
    isRead: false,
    isArchived: false,
    channels: ['app', 'email', 'push'],
    deliveryStatus: {
      app: 'delivered',
      email: 'delivered',
      push: 'delivered',
    },
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'NOTIF-004',
    type: 'reminder',
    category: 'delegation',
    title: 'Délégation arrivant à expiration',
    message: 'Votre délégation vers Sarah Martin expire dans 3 jours.',
    priority: 'high',
    recipient: {
      id: 'USR-002',
      name: 'Thomas Dubois',
    },
    relatedEntity: {
      type: 'delegation',
      id: 'DEL-001',
      label: 'Délégation validation congés',
    },
    actions: [
      {
        id: 'extend',
        label: 'Prolonger',
        action: 'extend_delegation',
        variant: 'primary',
      },
      {
        id: 'dismiss',
        label: 'Ignorer',
        action: 'dismiss',
        variant: 'secondary',
      },
    ],
    isRead: false,
    isArchived: false,
    channels: ['app'],
    deliveryStatus: {
      app: 'delivered',
    },
    createdAt: '2026-01-10T07:00:00Z',
    updatedAt: '2026-01-10T07:00:00Z',
  },
  {
    id: 'NOTIF-005',
    type: 'error',
    category: 'system',
    title: 'Échec de synchronisation',
    message: 'La synchronisation avec le système de paie a échoué. Nouvelle tentative dans 1 heure.',
    priority: 'urgent',
    recipient: {
      id: 'SYS-ADMIN',
      name: 'Admin Système',
    },
    isRead: false,
    isArchived: false,
    channels: ['app', 'email', 'sms'],
    deliveryStatus: {
      app: 'delivered',
      email: 'sent',
      sms: 'delivered',
    },
    metadata: {
      errorCode: 'SYNC_FAILED_500',
      retryCount: 3,
      nextRetry: '2026-01-10T12:00:00Z',
    },
    createdAt: '2026-01-10T11:00:00Z',
    updatedAt: '2026-01-10T11:00:00Z',
  },
];

// GET /api/rh/notifications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const recipientId = searchParams.get('recipientId');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isRead = searchParams.get('isRead');
    const isArchived = searchParams.get('isArchived');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filtered = [...notifications];

    if (id) {
      const notification = filtered.find((n) => n.id === id);
      if (!notification) {
        return NextResponse.json(
          { error: 'Notification non trouvée' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: notification, success: true });
    }

    if (recipientId) {
      filtered = filtered.filter((n) => n.recipient.id === recipientId);
    }
    if (type) {
      filtered = filtered.filter((n) => n.type === type);
    }
    if (category) {
      filtered = filtered.filter((n) => n.category === category);
    }
    if (isRead !== null) {
      const read = isRead === 'true';
      filtered = filtered.filter((n) => n.isRead === read);
    }
    if (isArchived !== null) {
      const archived = isArchived === 'true';
      filtered = filtered.filter((n) => n.isArchived === archived);
    }
    if (priority) {
      filtered = filtered.filter((n) => n.priority === priority);
    }

    // Trier par date de création (plus récentes en premier)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Statistiques
    const stats = {
      total: filtered.length,
      unread: filtered.filter((n) => !n.isRead).length,
      byType: {
        info: filtered.filter((n) => n.type === 'info').length,
        success: filtered.filter((n) => n.type === 'success').length,
        warning: filtered.filter((n) => n.type === 'warning').length,
        error: filtered.filter((n) => n.type === 'error').length,
        reminder: filtered.filter((n) => n.type === 'reminder').length,
      },
      byPriority: {
        low: filtered.filter((n) => n.priority === 'low').length,
        normal: filtered.filter((n) => n.priority === 'normal').length,
        high: filtered.filter((n) => n.priority === 'high').length,
        urgent: filtered.filter((n) => n.priority === 'urgent').length,
      },
    };

    // Pagination
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginated,
      stats,
      total: filtered.length,
      hasMore: offset + limit < filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/notifications - Créer une notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.message || !body.recipient) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    const newNotification: RHNotification = {
      id: `NOTIF-${Date.now()}`,
      type: body.type || 'info',
      category: body.category || 'system',
      title: body.title,
      message: body.message,
      priority: body.priority || 'normal',
      recipient: body.recipient,
      sender: body.sender,
      relatedEntity: body.relatedEntity,
      actions: body.actions,
      isRead: false,
      isArchived: false,
      expiresAt: body.expiresAt,
      channels: body.channels || ['app'],
      deliveryStatus: {
        app: 'pending',
      },
      metadata: body.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simuler la livraison
    if (newNotification.channels.includes('app')) {
      newNotification.deliveryStatus.app = 'delivered';
    }
    if (newNotification.channels.includes('email')) {
      newNotification.deliveryStatus.email = 'sent';
    }
    if (newNotification.channels.includes('sms')) {
      newNotification.deliveryStatus.sms = 'sent';
    }
    if (newNotification.channels.includes('push')) {
      newNotification.deliveryStatus.push = 'delivered';
    }

    notifications.push(newNotification);

    return NextResponse.json(
      {
        data: newNotification,
        message: 'Notification créée avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/notifications - Marquer comme lu/archiver
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ids, action } = body;

    // Action en lot
    if (ids && Array.isArray(ids)) {
      const updatedIds: string[] = [];

      ids.forEach((notifId: string) => {
        const index = notifications.findIndex((n) => n.id === notifId);
        if (index !== -1) {
          if (action === 'read') {
            notifications[index].isRead = true;
            notifications[index].readAt = new Date().toISOString();
          }
          if (action === 'unread') {
            notifications[index].isRead = false;
            notifications[index].readAt = undefined;
          }
          if (action === 'archive') {
            notifications[index].isArchived = true;
            notifications[index].archivedAt = new Date().toISOString();
          }
          notifications[index].updatedAt = new Date().toISOString();
          updatedIds.push(notifId);
        }
      });

      return NextResponse.json({
        message: `${updatedIds.length} notifications mises à jour`,
        updatedIds,
        success: true,
      });
    }

    // Action unitaire
    if (!id) {
      return NextResponse.json(
        { error: 'ID de la notification requis', success: false },
        { status: 400 }
      );
    }

    const index = notifications.findIndex((n) => n.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Notification non trouvée', success: false },
        { status: 404 }
      );
    }

    if (action === 'read') {
      notifications[index].isRead = true;
      notifications[index].readAt = new Date().toISOString();
    }
    if (action === 'unread') {
      notifications[index].isRead = false;
      notifications[index].readAt = undefined;
    }
    if (action === 'archive') {
      notifications[index].isArchived = true;
      notifications[index].archivedAt = new Date().toISOString();
    }
    if (action === 'unarchive') {
      notifications[index].isArchived = false;
      notifications[index].archivedAt = undefined;
    }

    notifications[index].updatedAt = new Date().toISOString();

    return NextResponse.json({
      data: notifications[index],
      message: 'Notification mise à jour',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/notifications
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clearAll');
    const clearArchived = searchParams.get('clearArchived');

    if (clearAll === 'true') {
      const count = notifications.length;
      notifications = [];
      return NextResponse.json({
        message: `${count} notifications supprimées`,
        success: true,
      });
    }

    if (clearArchived === 'true') {
      const archivedCount = notifications.filter((n) => n.isArchived).length;
      notifications = notifications.filter((n) => !n.isArchived);
      return NextResponse.json({
        message: `${archivedCount} notifications archivées supprimées`,
        success: true,
      });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la notification requis', success: false },
        { status: 400 }
      );
    }

    const index = notifications.findIndex((n) => n.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Notification non trouvée', success: false },
        { status: 404 }
      );
    }

    notifications.splice(index, 1);

    return NextResponse.json({
      message: 'Notification supprimée avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

