/**
 * GÉNÉRATEUR DE FICHIERS iCAL (RFC 5545)
 * 
 * Génère des fichiers .ics compatibles avec :
 * - Google Calendar
 * - Microsoft Outlook
 * - Apple Calendar
 * - Autres clients compatibles iCal
 */

export interface ICalEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
  status?: string;
  priority?: string;
}

/**
 * Générer un fichier iCal à partir d'événements
 */
export function generateICalFile(events: ICalEvent[]): string {
  const now = new Date();
  const timestamp = formatICalDate(now);

  // En-tête iCal
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bureau Maître d\'Ouvrage//Calendrier BMO//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Calendrier BMO',
    'X-WR-TIMEZONE:Africa/Dakar',
    'X-WR-CALDESC:Événements du Bureau Maître d\'Ouvrage',
  ].join('\r\n');

  // Ajouter chaque événement
  for (const event of events) {
    ical += '\r\n' + generateVEvent(event, timestamp);
  }

  // Pied de page
  ical += '\r\nEND:VCALENDAR\r\n';

  return ical;
}

/**
 * Générer un VEVENT individuel
 */
function generateVEvent(event: ICalEvent, timestamp: string): string {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${event.id}@bmo.sn`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${formatICalDate(event.start)}`,
    `DTEND:${formatICalDate(event.end)}`,
    `SUMMARY:${escapeICalText(event.title)}`,
  ];

  // Description (optionnelle)
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }

  // Lieu (optionnel)
  if (event.location) {
    lines.push(`LOCATION:${escapeICalText(event.location)}`);
  }

  // Statut
  const status = mapStatus(event.status);
  if (status) {
    lines.push(`STATUS:${status}`);
  }

  // Priorité
  const priority = mapPriority(event.priority);
  if (priority !== null) {
    lines.push(`PRIORITY:${priority}`);
  }

  // Catégories
  lines.push('CATEGORIES:BMO,Calendrier');

  // Organisation
  lines.push('ORGANIZER:CN=BMO:mailto:contact@bmo.sn');

  // Fin de l'événement
  lines.push('END:VEVENT');

  return lines.join('\r\n');
}

/**
 * Formater une date au format iCal (yyyyMMddTHHmmssZ)
 */
function formatICalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Échapper le texte pour iCal
 * - Échapper les virgules, points-virgules, backslashes
 * - Gérer les retours à la ligne
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')   // Backslash
    .replace(/;/g, '\\;')      // Point-virgule
    .replace(/,/g, '\\,')      // Virgule
    .replace(/\n/g, '\\n')     // Retour à la ligne
    .replace(/\r/g, '');       // Supprimer CR
}

/**
 * Mapper le statut de l'événement au format iCal
 */
function mapStatus(status?: string): string | null {
  if (!status) return null;

  const statusMap: Record<string, string> = {
    'open': 'CONFIRMED',
    'done': 'CONFIRMED',
    'snoozed': 'TENTATIVE',
    'ack': 'CONFIRMED',
    'blocked': 'CANCELLED',
  };

  return statusMap[status] || 'CONFIRMED';
}

/**
 * Mapper la priorité au format iCal (0-9, où 0 = non défini, 1 = haute, 5 = moyenne, 9 = basse)
 */
function mapPriority(priority?: string): number | null {
  if (!priority) return 5; // Moyenne par défaut

  const priorityMap: Record<string, number> = {
    'critical': 1,
    'urgent': 2,
    'normal': 5,
  };

  return priorityMap[priority] || 5;
}

/**
 * Générer un seul événement iCal (utile pour invitations)
 */
export function generateSingleEventICal(event: ICalEvent): string {
  return generateICalFile([event]);
}

/**
 * Générer un fichier iCal avec récurrence
 */
export function generateRecurringEventICal(
  event: ICalEvent,
  recurrence: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    until?: Date;
    count?: number;
    byDay?: string[]; // MO, TU, WE, TH, FR, SA, SU
  }
): string {
  const now = new Date();
  const timestamp = formatICalDate(now);

  // Construire la règle RRULE
  let rrule = `FREQ=${recurrence.frequency}`;

  if (recurrence.interval && recurrence.interval > 1) {
    rrule += `;INTERVAL=${recurrence.interval}`;
  }

  if (recurrence.until) {
    rrule += `;UNTIL=${formatICalDate(recurrence.until)}`;
  } else if (recurrence.count) {
    rrule += `;COUNT=${recurrence.count}`;
  }

  if (recurrence.byDay && recurrence.byDay.length > 0) {
    rrule += `;BYDAY=${recurrence.byDay.join(',')}`;
  }

  // Générer l'événement avec RRULE
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bureau Maître d\'Ouvrage//Calendrier BMO//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@bmo.sn`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${formatICalDate(event.start)}`,
    `DTEND:${formatICalDate(event.end)}`,
    `SUMMARY:${escapeICalText(event.title)}`,
    `RRULE:${rrule}`,
  ];

  if (event.description) {
    ical.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }

  if (event.location) {
    ical.push(`LOCATION:${escapeICalText(event.location)}`);
  }

  ical.push('END:VEVENT');
  ical.push('END:VCALENDAR');

  return ical.join('\r\n') + '\r\n';
}
