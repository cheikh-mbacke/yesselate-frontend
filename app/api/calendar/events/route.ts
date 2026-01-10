import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET /api/calendar/events
 * ========================
 * 
 * Liste les événements du calendrier avec filtres et pagination
 * 
 * Query params:
 * - queue: 'today' | 'week' | 'month' | 'overdue' | 'conflicts' | 'completed' | 'all'
 * - bureau: Filtrer par bureau
 * - category: Filtrer par catégorie
 * - priority: Filtrer par priorité
 * - status: Filtrer par statut
 * - search: Recherche texte
 * - page: Numéro de page (défaut: 1)
 * - limit: Éléments par page (défaut: 20)
 * - sortBy: Champ de tri (défaut: 'start')
 * - sortDir: Direction du tri 'asc' | 'desc' (défaut: 'asc')
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const queue = searchParams.get('queue') || 'all';
    const bureau = searchParams.get('bureau');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'start';
    const sortDir = searchParams.get('sortDir') || 'asc';

    // TODO: Remplacer par vrai appel BDD/API
    const { calendarEvents, filterEventsByQueue, detectConflicts } = await import('@/lib/data/calendar');

    // Filtrer par queue
    let events = filterEventsByQueue(calendarEvents, queue);

    // Appliquer filtres additionnels
    if (bureau) {
      events = events.filter(e => e.bureau === bureau);
    }

    if (category && category !== 'all') {
      const categoryMap: Record<string, string> = {
        'meeting': 'meeting',
        'site_visit': 'site-visit',
        'validation': 'validation',
        'payment': 'payment',
        'deadline': 'deadline',
        'absence': 'absence',
      };
      const targetKind = categoryMap[category] || category;
      events = events.filter(e => e.kind === targetKind);
    }

    if (priority && priority !== 'all') {
      events = events.filter(e => e.priority === priority);
    }

    if (status && status !== 'all') {
      const statusMap: Record<string, string> = {
        'open': 'open',
        'completed': 'done',
        'cancelled': 'cancelled',
      };
      const targetStatus = statusMap[status] || status;
      events = events.filter(e => e.status === targetStatus);
    }

    if (search) {
      const q = search.toLowerCase();
      events = events.filter(e => 
        e.title.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        (e as any).location?.toLowerCase().includes(q)
      );
    }

    // Détection des conflits
    const conflicts = detectConflicts(events);

    // Enrichir avec infos supplémentaires
    const now = Date.now();
    const enrichedEvents = events.map(event => {
      const hasConflict = conflicts.has(event.id);
      const slaOverdue = event.slaDueAt && new Date(event.slaDueAt).getTime() < now && event.status === 'open';
      
      return {
        ...event,
        hasConflict,
        isOverdue: slaOverdue,
        slaStatus: slaOverdue ? 'overdue' : 'ok',
      };
    });

    // Tri
    enrichedEvents.sort((a, b) => {
      let cmp = 0;
      
      switch (sortBy) {
        case 'start':
          cmp = new Date(a.start).getTime() - new Date(b.start).getTime();
          break;
        case 'priority': {
          const priorityOrder: Record<string, number> = { critical: 0, urgent: 1, high: 2, normal: 3, low: 4 };
          cmp = (priorityOrder[a.priority || 'normal'] || 3) - (priorityOrder[b.priority || 'normal'] || 3);
          break;
        }
        case 'title':
          cmp = a.title.localeCompare(b.title, 'fr');
          break;
        case 'status':
          cmp = (a.status || '').localeCompare(b.status || '', 'fr');
          break;
        default:
          cmp = new Date(a.start).getTime() - new Date(b.start).getTime();
      }
      
      return sortDir === 'asc' ? cmp : -cmp;
    });

    // Pagination
    const total = enrichedEvents.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedEvents = enrichedEvents.slice(start, end);

    return NextResponse.json({
      success: true,
      data: {
        events: paginatedEvents,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          queue,
          bureau,
          category,
          priority,
          status,
          search,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des événements',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar/events
 * =========================
 * 
 * Crée un nouvel événement
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation basique
    if (!body.title || !body.start || !body.end) {
      return NextResponse.json(
        {
          success: false,
          error: 'Titre, date de début et date de fin sont requis',
        },
        { status: 400 }
      );
    }

    // TODO: Sauvegarder en BDD
    const newEvent = {
      id: `EVT-${Date.now()}`,
      title: body.title,
      description: body.description || '',
      kind: body.category || 'meeting',
      bureau: body.bureau || '',
      assignees: body.attendees || [],
      start: body.start,
      end: body.end,
      priority: body.priority || 'normal',
      severity: body.priority === 'critical' ? 'critical' : body.priority === 'urgent' ? 'warning' : 'info',
      status: 'open',
      location: body.location || '',
      linkedTo: body.links?.[0] || null,
      slaDueAt: body.slaDueAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: 'Événement créé avec succès',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de l'événement",
      },
      { status: 500 }
    );
  }
}
