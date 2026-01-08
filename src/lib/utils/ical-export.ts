// ============================================
// Export iCal pour compatibilité calendriers externes
// ============================================

export interface CalendarItem {
  id: string;
  title: string;
  description?: string;
  kind: string;
  bureau?: string;
  assignees?: { id: string; name: string }[];
  start: string;
  end: string;
  priority: string;
  severity: string;
  status: string;
  linkedTo?: { type: string; id: string; label?: string };
  slaDueAt?: string;
  project?: string;
  originalSource?: string;
}

/**
 * Génère un fichier .ics (iCalendar) à partir d'items calendrier
 */
export function generateICal(items: CalendarItem[]): string {
  const lines: string[] = [];

  // En-tête iCal
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Yesselate//BMO Calendar//FR');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');

  // Événements
  for (const item of items) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${item.id}@yesselate.com`);
    lines.push(`DTSTART:${formatICalDate(new Date(item.start))}`);
    lines.push(`DTEND:${formatICalDate(new Date(item.end))}`);
    lines.push(`SUMMARY:${escapeICalText(item.title)}`);
    
    if (item.description) {
      lines.push(`DESCRIPTION:${escapeICalText(item.description)}`);
    }
    
    if (item.bureau) {
      lines.push(`LOCATION:${escapeICalText(item.bureau)}`);
    }
    
    lines.push(`PRIORITY:${getICalPriority(item.priority)}`);
    lines.push(`STATUS:${getICalStatus(item.status)}`);
    
    if (item.slaDueAt) {
      lines.push(`DTSTAMP:${formatICalDate(new Date(item.slaDueAt))}`);
    }
    
    lines.push('END:VEVENT');
  }

  // Fin
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Télécharge un fichier .ics
 */
export function downloadICal(items: CalendarItem[], filename = 'calendrier.ics') {
  const content = generateICal(items);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse un fichier .ics (basique)
 */
export function parseICal(content: string): CalendarItem[] {
  // Implémentation basique - à améliorer pour production
  const items: CalendarItem[] = [];
  const events = content.split('BEGIN:VEVENT');
  
  for (const event of events.slice(1)) {
    const uid = extractICalField(event, 'UID');
    const summary = extractICalField(event, 'SUMMARY');
    const dtstart = extractICalField(event, 'DTSTART');
    const dtend = extractICalField(event, 'DTEND');
    const description = extractICalField(event, 'DESCRIPTION');
    const location = extractICalField(event, 'LOCATION');
    
    if (uid && summary && dtstart && dtend) {
      items.push({
        id: uid.split('@')[0],
        title: unescapeICalText(summary),
        description: description ? unescapeICalText(description) : undefined,
        kind: 'other',
        start: parseICalDate(dtstart).toISOString(),
        end: parseICalDate(dtend).toISOString(),
        priority: 'normal',
        severity: 'info',
        status: 'open',
        bureau: location || undefined,
      });
    }
  }
  
  return items;
}

// Helpers privés
function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function parseICalDate(dateStr: string): Date {
  // Format: 20251224T100000Z ou 20251224
  const clean = dateStr.replace(/[TZ]/g, '');
  if (clean.length === 8) {
    const year = parseInt(clean.slice(0, 4));
    const month = parseInt(clean.slice(4, 6)) - 1;
    const day = parseInt(clean.slice(6, 8));
    return new Date(year, month, day);
  }
  if (clean.length >= 14) {
    const year = parseInt(clean.slice(0, 4));
    const month = parseInt(clean.slice(4, 6)) - 1;
    const day = parseInt(clean.slice(6, 8));
    const hour = parseInt(clean.slice(8, 10) || '0');
    const minute = parseInt(clean.slice(10, 12) || '0');
    const second = parseInt(clean.slice(12, 14) || '0');
    return new Date(year, month, day, hour, minute, second);
  }
  return new Date();
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function unescapeICalText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function getICalPriority(priority: string): string {
  if (priority === 'critical') return '1';
  if (priority === 'urgent') return '2';
  return '5';
}

function getICalStatus(status: string): string {
  if (status === 'done') return 'CONFIRMED';
  if (status === 'ack') return 'CANCELLED';
  return 'TENTATIVE';
}

function extractICalField(content: string, field: string): string | null {
  const regex = new RegExp(`${field}:(.+?)(?:\\r?\\n|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

