import { NextRequest, NextResponse } from 'next/server';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'validate' | 'reject' | 'export' | 'login' | 'logout' | 'delegate' | 'escalate';
  category: 'demande' | 'agent' | 'document' | 'workflow' | 'delegation' | 'system' | 'auth' | 'budget';
  actor: {
    id: string;
    name: string;
    role: string;
    ip?: string;
    userAgent?: string;
  };
  target?: {
    type: string;
    id: string;
    label: string;
  };
  details: {
    description: string;
    previousValue?: unknown;
    newValue?: unknown;
    changedFields?: string[];
    reason?: string;
  };
  status: 'success' | 'failure' | 'partial';
  errorMessage?: string;
  duration?: number; // en ms
  metadata?: {
    sessionId?: string;
    requestId?: string;
    correlationId?: string;
    source?: 'web' | 'api' | 'mobile' | 'system';
    environment?: 'production' | 'staging' | 'development';
  };
  hash?: string; // Pour l'intégrité de l'audit trail
}

// Données simulées
let auditLogs: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-01-10T10:30:00Z',
    action: 'validate',
    category: 'demande',
    actor: {
      id: 'USR-001',
      name: 'Sarah Martin',
      role: 'RH Manager',
      ip: '192.168.1.100',
    },
    target: {
      type: 'demande',
      id: 'RH-2026-001',
      label: 'Congé annuel - Ahmed Kaci',
    },
    details: {
      description: 'Validation de la demande de congé',
      previousValue: { status: 'en_attente' },
      newValue: { status: 'validé' },
      changedFields: ['status', 'validatedBy', 'validatedAt'],
    },
    status: 'success',
    duration: 245,
    metadata: {
      sessionId: 'sess-abc123',
      requestId: 'req-xyz789',
      source: 'web',
      environment: 'production',
    },
    hash: 'sha256:abc123def456...',
  },
  {
    id: 'AUD-002',
    timestamp: '2026-01-10T10:25:00Z',
    action: 'read',
    category: 'demande',
    actor: {
      id: 'USR-001',
      name: 'Sarah Martin',
      role: 'RH Manager',
    },
    target: {
      type: 'demande',
      id: 'RH-2026-001',
      label: 'Congé annuel - Ahmed Kaci',
    },
    details: {
      description: 'Consultation de la demande',
    },
    status: 'success',
    duration: 45,
    metadata: {
      source: 'web',
    },
    hash: 'sha256:def456abc789...',
  },
  {
    id: 'AUD-003',
    timestamp: '2026-01-10T09:15:00Z',
    action: 'create',
    category: 'demande',
    actor: {
      id: 'AGT-001',
      name: 'Ahmed Kaci',
      role: 'Agent',
    },
    target: {
      type: 'demande',
      id: 'RH-2026-001',
      label: 'Congé annuel',
    },
    details: {
      description: 'Création d\'une nouvelle demande de congé',
      newValue: {
        type: 'congé annuel',
        dateDebut: '2026-01-15',
        dateFin: '2026-01-20',
        nbJours: 4,
      },
    },
    status: 'success',
    duration: 320,
    metadata: {
      source: 'web',
    },
    hash: 'sha256:ghi789jkl012...',
  },
  {
    id: 'AUD-004',
    timestamp: '2026-01-10T09:00:00Z',
    action: 'login',
    category: 'auth',
    actor: {
      id: 'USR-001',
      name: 'Sarah Martin',
      role: 'RH Manager',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    },
    details: {
      description: 'Connexion réussie',
    },
    status: 'success',
    duration: 150,
    metadata: {
      sessionId: 'sess-abc123',
      source: 'web',
    },
    hash: 'sha256:mno345pqr678...',
  },
  {
    id: 'AUD-005',
    timestamp: '2026-01-10T08:45:00Z',
    action: 'login',
    category: 'auth',
    actor: {
      id: 'unknown',
      name: 'unknown',
      role: 'unknown',
      ip: '10.0.0.50',
    },
    details: {
      description: 'Tentative de connexion échouée',
      reason: 'Identifiants incorrects',
    },
    status: 'failure',
    errorMessage: 'Invalid credentials',
    metadata: {
      source: 'web',
    },
    hash: 'sha256:stu901vwx234...',
  },
  {
    id: 'AUD-006',
    timestamp: '2026-01-10T11:00:00Z',
    action: 'export',
    category: 'demande',
    actor: {
      id: 'USR-001',
      name: 'Sarah Martin',
      role: 'RH Manager',
    },
    details: {
      description: 'Export des demandes en cours',
      newValue: {
        format: 'xlsx',
        count: 45,
        filters: { status: 'en_attente' },
      },
    },
    status: 'success',
    duration: 1250,
    metadata: {
      source: 'web',
    },
    hash: 'sha256:yza567bcd890...',
  },
  {
    id: 'AUD-007',
    timestamp: '2026-01-09T16:00:00Z',
    action: 'delegate',
    category: 'delegation',
    actor: {
      id: 'USR-002',
      name: 'Thomas Dubois',
      role: 'Directeur',
    },
    target: {
      type: 'delegation',
      id: 'DEL-001',
      label: 'Délégation vers Sarah Martin',
    },
    details: {
      description: 'Création d\'une délégation temporaire',
      newValue: {
        delegatee: 'Sarah Martin',
        permissions: ['validation_congés', 'validation_dépenses'],
        dateDebut: '2026-01-01',
        dateFin: '2026-01-31',
      },
    },
    status: 'success',
    duration: 180,
    metadata: {
      source: 'web',
    },
    hash: 'sha256:efg123hij456...',
  },
  {
    id: 'AUD-008',
    timestamp: '2026-01-10T12:00:00Z',
    action: 'update',
    category: 'budget',
    actor: {
      id: 'SYS',
      name: 'Système',
      role: 'System',
    },
    target: {
      type: 'budget',
      id: 'BUD-2026-A',
      label: 'Budget RH Bureau A - 2026',
    },
    details: {
      description: 'Mise à jour automatique du budget suite à validation',
      previousValue: { consumed: 150000, remaining: 350000 },
      newValue: { consumed: 165000, remaining: 335000 },
      changedFields: ['consumed', 'remaining'],
    },
    status: 'success',
    duration: 50,
    metadata: {
      source: 'system',
      correlationId: 'RH-2026-002',
    },
    hash: 'sha256:klm789nop012...',
  },
];

// Générer un hash simple pour l'intégrité
function generateHash(entry: Omit<AuditLogEntry, 'hash'>): string {
  const data = JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    action: entry.action,
    actor: entry.actor.id,
    target: entry.target?.id,
    details: entry.details.description,
  });
  // Simple hash simulation (en production, utiliser crypto)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

// GET /api/rh/audit
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    const category = searchParams.get('category');
    const actorId = searchParams.get('actorId');
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filtered = [...auditLogs];

    if (id) {
      const entry = filtered.find((e) => e.id === id);
      if (!entry) {
        return NextResponse.json(
          { error: 'Entrée d\'audit non trouvée' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: entry, success: true });
    }

    // Filtres
    if (action) {
      const actions = action.split(',');
      filtered = filtered.filter((e) => actions.includes(e.action));
    }
    if (category) {
      const categories = category.split(',');
      filtered = filtered.filter((e) => categories.includes(e.category));
    }
    if (actorId) {
      filtered = filtered.filter((e) => e.actor.id === actorId);
    }
    if (targetId) {
      filtered = filtered.filter((e) => e.target?.id === targetId);
    }
    if (targetType) {
      filtered = filtered.filter((e) => e.target?.type === targetType);
    }
    if (status) {
      filtered = filtered.filter((e) => e.status === status);
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      filtered = filtered.filter((e) => new Date(e.timestamp) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      filtered = filtered.filter((e) => new Date(e.timestamp) <= to);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.details.description.toLowerCase().includes(searchLower) ||
          e.actor.name.toLowerCase().includes(searchLower) ||
          e.target?.label?.toLowerCase().includes(searchLower)
      );
    }

    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Statistiques
    const stats = {
      total: filtered.length,
      byAction: {
        create: filtered.filter((e) => e.action === 'create').length,
        read: filtered.filter((e) => e.action === 'read').length,
        update: filtered.filter((e) => e.action === 'update').length,
        delete: filtered.filter((e) => e.action === 'delete').length,
        validate: filtered.filter((e) => e.action === 'validate').length,
        reject: filtered.filter((e) => e.action === 'reject').length,
        export: filtered.filter((e) => e.action === 'export').length,
        login: filtered.filter((e) => e.action === 'login').length,
        logout: filtered.filter((e) => e.action === 'logout').length,
      },
      byCategory: {
        demande: filtered.filter((e) => e.category === 'demande').length,
        agent: filtered.filter((e) => e.category === 'agent').length,
        document: filtered.filter((e) => e.category === 'document').length,
        auth: filtered.filter((e) => e.category === 'auth').length,
        system: filtered.filter((e) => e.category === 'system').length,
      },
      byStatus: {
        success: filtered.filter((e) => e.status === 'success').length,
        failure: filtered.filter((e) => e.status === 'failure').length,
        partial: filtered.filter((e) => e.status === 'partial').length,
      },
      failedAttempts: filtered.filter((e) => e.status === 'failure').length,
      avgDuration: filtered.reduce((sum, e) => sum + (e.duration || 0), 0) / filtered.length || 0,
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
    console.error('Erreur GET /api/rh/audit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/audit - Créer une entrée d'audit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.action || !body.category || !body.actor || !body.details) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: body.action,
      category: body.category,
      actor: body.actor,
      target: body.target,
      details: body.details,
      status: body.status || 'success',
      errorMessage: body.errorMessage,
      duration: body.duration,
      metadata: {
        ...body.metadata,
        requestId: `req-${Date.now()}`,
      },
      hash: '', // Sera généré
    };

    // Générer le hash pour l'intégrité
    newEntry.hash = generateHash(newEntry);

    auditLogs.push(newEntry);

    return NextResponse.json(
      {
        data: newEntry,
        message: 'Entrée d\'audit créée',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/audit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// Vérification de l'intégrité de l'audit trail
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'verify_integrity') {
      const results = auditLogs.map((entry) => {
        const expectedHash = generateHash(entry);
        return {
          id: entry.id,
          timestamp: entry.timestamp,
          isValid: entry.hash === expectedHash,
          storedHash: entry.hash,
          computedHash: expectedHash,
        };
      });

      const invalidEntries = results.filter((r) => !r.isValid);

      return NextResponse.json({
        valid: invalidEntries.length === 0,
        totalEntries: auditLogs.length,
        validEntries: results.filter((r) => r.isValid).length,
        invalidEntries: invalidEntries.length,
        details: invalidEntries.length > 0 ? invalidEntries : undefined,
        success: true,
      });
    }

    if (action === 'export') {
      const { format = 'json', dateFrom, dateTo } = body;

      let filtered = [...auditLogs];
      if (dateFrom) {
        filtered = filtered.filter((e) => new Date(e.timestamp) >= new Date(dateFrom));
      }
      if (dateTo) {
        filtered = filtered.filter((e) => new Date(e.timestamp) <= new Date(dateTo));
      }

      // En production, générer le fichier réel
      return NextResponse.json({
        data: format === 'json' ? filtered : null,
        count: filtered.length,
        format,
        exportedAt: new Date().toISOString(),
        success: true,
      });
    }

    return NextResponse.json(
      { error: 'Action non reconnue', success: false },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erreur PUT /api/rh/audit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

