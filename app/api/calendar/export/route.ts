import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET /api/calendar/export
 * ========================
 * 
 * Exporte les événements du calendrier dans différents formats
 * 
 * Query params:
 * - format: 'ical' | 'csv' | 'json' | 'pdf' | 'html' (requis)
 * - queue: 'today' | 'week' | 'month' | 'all' (par défaut: 'all')
 * - month: Numéro du mois (1-12) pour export mensuel
 * - year: Année pour export mensuel
 * - print: 'true' pour version imprimable (HTML/PDF)
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'ical';
    const queue = searchParams.get('queue') || 'all';
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const print = searchParams.get('print') === 'true';

    // TODO: Remplacer par vrai appel BDD/API
    const { calendarEvents, filterEventsByQueue } = await import('@/lib/data/calendar');

    // Filtrer par queue
    let events = filterEventsByQueue(calendarEvents, queue);

    // Filtrer par mois si spécifié
    if (month && year) {
      const targetMonth = parseInt(month) - 1;
      const targetYear = parseInt(year);
      events = events.filter(e => {
        const date = new Date(e.start);
        return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
      });
    }

    switch (format) {
      case 'ical':
        return exportToICal(events);
      case 'csv':
        return exportToCSV(events);
      case 'json':
        return exportToJSON(events);
      case 'html':
        return exportToHTML(events, print);
      case 'pdf':
        // Pour PDF, rediriger vers HTML avec print=true
        return NextResponse.redirect(new URL(`/api/calendar/export?format=html&queue=${queue}&print=true`, request.url));
      default:
        return NextResponse.json(
          { success: false, error: 'Format non supporté' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error exporting calendar:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'export" },
      { status: 500 }
    );
  }
}

// ============================================
// Export helpers
// ============================================

function exportToICal(events: any[]) {
  const lines: string[] = [];
  
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//YESSELATE//Calendar//FR');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push('X-WR-CALNAME:Calendrier YESSELATE');
  lines.push('X-WR-TIMEZONE:Africa/Ouagadougou');

  events.forEach(event => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@yesselate.bf`);
    lines.push(`DTSTAMP:${formatICalDate(new Date())}`);
    lines.push(`DTSTART:${formatICalDate(start)}`);
    lines.push(`DTEND:${formatICalDate(end)}`);
    lines.push(`SUMMARY:${escapeICalText(event.title)}`);
    
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
    }
    
    if (event.location) {
      lines.push(`LOCATION:${escapeICalText(event.location)}`);
    }

    lines.push(`STATUS:${event.status === 'done' ? 'COMPLETED' : event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`);
    
    if (event.priority) {
      const priority = event.priority === 'critical' ? '1' : event.priority === 'urgent' ? '3' : '5';
      lines.push(`PRIORITY:${priority}`);
    }

    if (event.assignees && event.assignees.length > 0) {
      event.assignees.forEach((assignee: any) => {
        lines.push(`ATTENDEE;CN=${escapeICalText(assignee.name)}:mailto:${assignee.name.toLowerCase().replace(' ', '.')}@yesselate.bf`);
      });
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  const content = lines.join('\r\n');

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="calendrier-${new Date().toISOString().split('T')[0]}.ics"`,
    },
  });
}

function exportToCSV(events: any[]) {
  const headers = [
    'ID',
    'Titre',
    'Description',
    'Type',
    'Date début',
    'Heure début',
    'Date fin',
    'Heure fin',
    'Priorité',
    'Statut',
    'Lieu',
    'Bureau',
    'Participants',
  ];

  const rows = events.map(event => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    return [
      event.id,
      escapeCSV(event.title),
      escapeCSV(event.description || ''),
      event.kind || '',
      start.toLocaleDateString('fr-FR'),
      start.toLocaleTimeString('fr-FR'),
      end.toLocaleDateString('fr-FR'),
      end.toLocaleTimeString('fr-FR'),
      event.priority || 'normal',
      event.status || 'open',
      escapeCSV(event.location || ''),
      event.bureau || '',
      event.assignees ? event.assignees.map((a: any) => a.name).join('; ') : '',
    ].join(',');
  });

  const content = [headers.join(','), ...rows].join('\n');

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="calendrier-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

function exportToJSON(events: any[]) {
  const data = {
    exportDate: new Date().toISOString(),
    totalEvents: events.length,
    events: events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      kind: event.kind,
      start: event.start,
      end: event.end,
      priority: event.priority,
      status: event.status,
      location: event.location,
      bureau: event.bureau,
      assignees: event.assignees,
      linkedTo: event.linkedTo,
      slaDueAt: event.slaDueAt,
    })),
  };

  return NextResponse.json(data, {
    headers: {
      'Content-Disposition': `attachment; filename="calendrier-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}

function exportToHTML(events: any[], forPrint: boolean) {
  const now = new Date();
  const title = 'Calendrier YESSELATE';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background: #f8f9fa;
      color: #212529;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    header {
      border-bottom: 3px solid #0066cc;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #0066cc;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .meta {
      color: #6c757d;
      font-size: 14px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      padding: 20px;
      border-radius: 8px;
      background: #f8f9fa;
      border-left: 4px solid #0066cc;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #0066cc;
    }
    .stat-label {
      font-size: 14px;
      color: #6c757d;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge-critical { background: #dc3545; color: white; }
    .badge-urgent { background: #ffc107; color: #212529; }
    .badge-high { background: #fd7e14; color: white; }
    .badge-normal { background: #0dcaf0; color: white; }
    .badge-low { background: #6c757d; color: white; }
    .badge-done { background: #198754; color: white; }
    .badge-cancelled { background: #6c757d; color: white; }
    .badge-open { background: #0d6efd; color: white; }
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
      text-align: center;
      color: #6c757d;
      font-size: 12px;
    }
    ${forPrint ? `
      @media print {
        body { padding: 0; background: white; }
        .container { box-shadow: none; padding: 20px; }
        .no-print { display: none; }
      }
    ` : ''}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${title}</h1>
      <div class="meta">
        Exporté le ${now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à ${now.toLocaleTimeString('fr-FR')}
      </div>
    </header>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${events.length}</div>
        <div class="stat-label">Total événements</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${events.filter(e => e.status === 'done').length}</div>
        <div class="stat-label">Terminés</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${events.filter(e => e.status === 'open').length}</div>
        <div class="stat-label">En cours</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${events.filter(e => e.priority === 'critical' || e.priority === 'urgent').length}</div>
        <div class="stat-label">Prioritaires</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Événement</th>
          <th>Type</th>
          <th>Priorité</th>
          <th>Statut</th>
          <th>Bureau</th>
        </tr>
      </thead>
      <tbody>
        ${events.map(event => {
          const start = new Date(event.start);
          const priorityClass = `badge-${event.priority || 'normal'}`;
          const statusClass = `badge-${event.status || 'open'}`;
          
          return `
            <tr>
              <td>${start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}<br>
                  <small style="color: #6c757d;">${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</small>
              </td>
              <td>
                <strong>${escapeHTML(event.title)}</strong>
                ${event.description ? `<br><small style="color: #6c757d;">${escapeHTML(event.description)}</small>` : ''}
              </td>
              <td>${event.kind || '-'}</td>
              <td><span class="badge ${priorityClass}">${event.priority || 'normal'}</span></td>
              <td><span class="badge ${statusClass}">${event.status || 'open'}</span></td>
              <td>${event.bureau || '-'}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <footer>
      <p>Document généré automatiquement par YESSELATE</p>
      <p>Ministère des Infrastructures et du Désenclavement - Burkina Faso</p>
    </footer>

    ${forPrint ? `
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    ` : ''}
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

// ============================================
// Utilities
// ============================================

function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICalText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function escapeCSV(text: string): string {
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function escapeHTML(text: string): string {
  const div = { innerHTML: '' } as any;
  div.textContent = text;
  return div.innerHTML || text.replace(/[&<>"']/g, (m: string) => {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[m];
  });
}
