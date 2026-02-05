import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET /api/calendar/events/[id]/export
 * =====================================
 * 
 * Exporte un événement spécifique dans différents formats
 * 
 * Query params:
 * - format: 'ical' | 'json' | 'pdf' (requis)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'ical';

    // TODO: Remplacer par vrai appel BDD/API
    const { calendarEvents } = await import('@/lib/data/calendar');

    const event = calendarEvents.find(e => e.id === id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Événement non trouvé',
        },
        { status: 404 }
      );
    }

    switch (format) {
      case 'ical':
        return exportEventToICal(event);
      case 'json':
        return exportEventToJSON(event);
      case 'pdf':
        // Rediriger vers HTML avec impression automatique
        return exportEventToHTML(event, true);
      default:
        return NextResponse.json(
          { success: false, error: 'Format non supporté' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error exporting calendar event:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'export" },
      { status: 500 }
    );
  }
}

// ============================================
// Export helpers
// ============================================

function exportEventToICal(event: any) {
  const start = new Date(event.start);
  const end = new Date(event.end);

  const lines: string[] = [];
  
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//YESSELATE//Calendar Event//FR');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');

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
  lines.push('END:VCALENDAR');

  const content = lines.join('\r\n');

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="evenement-${event.id}.ics"`,
    },
  });
}

function exportEventToJSON(event: any) {
  const data = {
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
    exportedAt: new Date().toISOString(),
  };

  return NextResponse.json(data, {
    headers: {
      'Content-Disposition': `attachment; filename="evenement-${event.id}.json"`,
    },
  });
}

function exportEventToHTML(event: any, forPrint: boolean) {
  const start = new Date(event.start);
  const end = new Date(event.end);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(event.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background: #f8f9fa;
      color: #212529;
    }
    .container {
      max-width: 800px;
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
      font-size: 28px;
      margin-bottom: 10px;
    }
    .meta {
      color: #6c757d;
      font-size: 14px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-weight: 600;
      color: #495057;
      margin-bottom: 10px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .info-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .info-label {
      font-size: 12px;
      color: #6c757d;
      margin-bottom: 5px;
    }
    .info-value {
      font-weight: 500;
      color: #212529;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge-critical { background: #dc3545; color: white; }
    .badge-urgent { background: #ffc107; color: #212529; }
    .badge-high { background: #fd7e14; color: white; }
    .badge-normal { background: #0dcaf0; color: white; }
    .attendees {
      list-style: none;
      padding: 0;
    }
    .attendees li {
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 5px;
    }
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
      text-align: center;
      color: #6c757d;
      font-size: 12px;
    }
    @media print {
      body { padding: 0; background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${escapeHTML(event.title)}</h1>
      <div class="meta">
        ID: ${event.id} • Type: ${event.kind || 'événement'}
        ${event.priority ? ` • <span class="badge badge-${event.priority}">${event.priority}</span>` : ''}
      </div>
    </header>

    ${event.description ? `
      <div class="section">
        <div class="section-title">Description</div>
        <p>${escapeHTML(event.description)}</p>
      </div>
    ` : ''}

    <div class="section">
      <div class="section-title">Date & Heure</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Début</div>
          <div class="info-value">
            ${start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br>
            ${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Fin</div>
          <div class="info-value">
            ${end.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br>
            ${end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>

    ${event.location || event.bureau ? `
      <div class="section">
        <div class="section-title">Lieu</div>
        <div class="info-grid">
          ${event.location ? `
            <div class="info-item">
              <div class="info-label">Adresse</div>
              <div class="info-value">${escapeHTML(event.location)}</div>
            </div>
          ` : ''}
          ${event.bureau ? `
            <div class="info-item">
              <div class="info-label">Bureau</div>
              <div class="info-value">${escapeHTML(event.bureau)}</div>
            </div>
          ` : ''}
        </div>
      </div>
    ` : ''}

    ${event.assignees && event.assignees.length > 0 ? `
      <div class="section">
        <div class="section-title">Participants (${event.assignees.length})</div>
        <ul class="attendees">
          ${event.assignees.map((a: any) => `<li>${escapeHTML(a.name)}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <footer>
      <p>Document généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p>YESSELATE - Ministère des Infrastructures et du Désenclavement</p>
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

function escapeHTML(text: string): string {
  const div = { innerHTML: '' } as any;
  div.textContent = text;
  return div.innerHTML || text.replace(/[&<>"']/g, (m: string) => {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[m];
  });
}

