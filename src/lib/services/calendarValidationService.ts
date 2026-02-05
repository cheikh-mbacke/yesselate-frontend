/**
 * Service de validation pour les événements du calendrier
 * ========================================================
 * 
 * Valide les données d'événements avant création/modification
 * Détecte les conflits potentiels
 * Vérifie les règles métier
 */

// ============================================
// Types
// ============================================

export interface EventValidationError {
  field: string;
  message: string;
  code: string;
}

export interface EventValidationResult {
  valid: boolean;
  errors: EventValidationError[];
  warnings: EventValidationError[];
}

export interface EventData {
  title: string;
  description?: string;
  start: string | Date;
  end: string | Date;
  category?: string;
  priority?: string;
  status?: string;
  location?: string;
  bureau?: string;
  attendees?: Array<{ name: string; email?: string; role?: string }>;
  allDay?: boolean;
  recurrence?: string;
  links?: Array<{ type: string; ref: string; title?: string }>;
}

// ============================================
// Règles de validation
// ============================================

const VALID_CATEGORIES = [
  'meeting', 'site_visit', 'deadline', 'validation', 
  'payment', 'absence', 'training', 'other'
];

const VALID_PRIORITIES = ['critical', 'urgent', 'high', 'normal', 'low'];

const VALID_STATUSES = ['open', 'in_progress', 'completed', 'cancelled'];

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_ATTENDEES = 50;

// ============================================
// Service de validation
// ============================================

export class CalendarValidationService {
  /**
   * Valide un événement complet
   */
  validateEvent(data: EventData): EventValidationResult {
    const errors: EventValidationError[] = [];
    const warnings: EventValidationError[] = [];

    // Titre requis
    if (!data.title || !data.title.trim()) {
      errors.push({
        field: 'title',
        message: 'Le titre est requis',
        code: 'TITLE_REQUIRED',
      });
    } else if (data.title.length > MAX_TITLE_LENGTH) {
      errors.push({
        field: 'title',
        message: `Le titre ne peut pas dépasser ${MAX_TITLE_LENGTH} caractères`,
        code: 'TITLE_TOO_LONG',
      });
    }

    // Description
    if (data.description && data.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push({
        field: 'description',
        message: `La description ne peut pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères`,
        code: 'DESCRIPTION_TOO_LONG',
      });
    }

    // Dates requises
    if (!data.start) {
      errors.push({
        field: 'start',
        message: 'La date de début est requise',
        code: 'START_REQUIRED',
      });
    }

    if (!data.end) {
      errors.push({
        field: 'end',
        message: 'La date de fin est requise',
        code: 'END_REQUIRED',
      });
    }

    // Validation des dates
    if (data.start && data.end) {
      const start = new Date(data.start);
      const end = new Date(data.end);

      if (isNaN(start.getTime())) {
        errors.push({
          field: 'start',
          message: 'La date de début est invalide',
          code: 'START_INVALID',
        });
      }

      if (isNaN(end.getTime())) {
        errors.push({
          field: 'end',
          message: 'La date de fin est invalide',
          code: 'END_INVALID',
        });
      }

      if (start.getTime() >= end.getTime()) {
        errors.push({
          field: 'end',
          message: 'La date de fin doit être après la date de début',
          code: 'END_BEFORE_START',
        });
      }

      // Vérifier si l'événement est dans le passé
      const now = new Date();
      if (start < now && !data.allDay) {
        warnings.push({
          field: 'start',
          message: 'Cet événement commence dans le passé',
          code: 'START_IN_PAST',
        });
      }

      // Vérifier la durée
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (durationHours > 24 && !data.allDay) {
        warnings.push({
          field: 'duration',
          message: 'Cet événement dure plus de 24 heures. Voulez-vous le marquer comme "journée entière" ?',
          code: 'LONG_DURATION',
        });
      }

      // Vérifier si événement très court
      if (durationHours < 0.25 && !data.allDay) {
        warnings.push({
          field: 'duration',
          message: 'Cet événement dure moins de 15 minutes',
          code: 'SHORT_DURATION',
        });
      }
    }

    // Catégorie
    if (data.category && !VALID_CATEGORIES.includes(data.category)) {
      warnings.push({
        field: 'category',
        message: `Catégorie non reconnue: ${data.category}`,
        code: 'INVALID_CATEGORY',
      });
    }

    // Priorité
    if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
      warnings.push({
        field: 'priority',
        message: `Priorité non reconnue: ${data.priority}`,
        code: 'INVALID_PRIORITY',
      });
    }

    // Statut
    if (data.status && !VALID_STATUSES.includes(data.status)) {
      warnings.push({
        field: 'status',
        message: `Statut non reconnu: ${data.status}`,
        code: 'INVALID_STATUS',
      });
    }

    // Participants
    if (data.attendees) {
      if (data.attendees.length > MAX_ATTENDEES) {
        errors.push({
          field: 'attendees',
          message: `Maximum ${MAX_ATTENDEES} participants autorisés`,
          code: 'TOO_MANY_ATTENDEES',
        });
      }

      data.attendees.forEach((attendee, index) => {
        if (!attendee.name || !attendee.name.trim()) {
          errors.push({
            field: `attendees[${index}].name`,
            message: 'Le nom du participant est requis',
            code: 'ATTENDEE_NAME_REQUIRED',
          });
        }

        if (attendee.email && !this.isValidEmail(attendee.email)) {
          warnings.push({
            field: `attendees[${index}].email`,
            message: 'Adresse email invalide',
            code: 'INVALID_EMAIL',
          });
        }
      });

      // Vérifier les doublons
      const names = data.attendees.map(a => a.name.toLowerCase().trim());
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicates.length > 0) {
        warnings.push({
          field: 'attendees',
          message: 'Participants en double détectés',
          code: 'DUPLICATE_ATTENDEES',
        });
      }
    }

    // Absence : vérifier qu'il n'y a qu'un seul participant
    if (data.category === 'absence' && data.attendees && data.attendees.length > 1) {
      warnings.push({
        field: 'attendees',
        message: 'Une absence ne devrait concerner qu\'une seule personne',
        code: 'ABSENCE_MULTIPLE_ATTENDEES',
      });
    }

    // Événement critique sans participants
    if (data.priority === 'critical' && (!data.attendees || data.attendees.length === 0)) {
      warnings.push({
        field: 'attendees',
        message: 'Un événement critique devrait avoir au moins un participant',
        code: 'CRITICAL_NO_ATTENDEES',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valide uniquement les champs requis (pour création rapide)
   */
  validateQuick(data: Partial<EventData>): EventValidationResult {
    const errors: EventValidationError[] = [];
    const warnings: EventValidationError[] = [];

    if (!data.title?.trim()) {
      errors.push({
        field: 'title',
        message: 'Le titre est requis',
        code: 'TITLE_REQUIRED',
      });
    }

    if (!data.start) {
      errors.push({
        field: 'start',
        message: 'La date de début est requise',
        code: 'START_REQUIRED',
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Détecte les conflits potentiels avec d'autres événements
   */
  async detectConflicts(
    eventData: EventData,
    existingEvents: any[]
  ): Promise<EventValidationError[]> {
    const warnings: EventValidationError[] = [];

    if (!eventData.attendees || eventData.attendees.length === 0) {
      return warnings;
    }

    const newStart = new Date(eventData.start).getTime();
    const newEnd = new Date(eventData.end).getTime();

    existingEvents.forEach(existingEvent => {
      // Vérifier si même personne
      const sharedAttendees = eventData.attendees!.filter(newAttendee =>
        existingEvent.assignees?.some((existing: any) =>
          existing.name.toLowerCase() === newAttendee.name.toLowerCase()
        )
      );

      if (sharedAttendees.length === 0) return;

      // Vérifier si chevauchement temporel
      const existingStart = new Date(existingEvent.start).getTime();
      const existingEnd = new Date(existingEvent.end).getTime();

      if (newStart < existingEnd && newEnd > existingStart) {
        warnings.push({
          field: 'schedule',
          message: `Conflit détecté avec "${existingEvent.title}" - ${sharedAttendees.map(a => a.name).join(', ')} déjà occupé(s)`,
          code: 'SCHEDULE_CONFLICT',
        });
      }
    });

    return warnings;
  }

  /**
   * Valide un email
   */
  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Vérifie les règles métier spécifiques
   */
  validateBusinessRules(data: EventData): EventValidationError[] {
    const warnings: EventValidationError[] = [];

    // Validation SLA : événements critiques dans moins de 24h
    if (data.priority === 'critical' || data.priority === 'urgent') {
      const start = new Date(data.start);
      const now = new Date();
      const hoursUntil = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntil < 24 && hoursUntil > 0) {
        warnings.push({
          field: 'priority',
          message: `Événement ${data.priority} dans moins de 24h - SLA court`,
          code: 'SHORT_SLA',
        });
      }
    }

    // Réunions sans lieu
    if (data.category === 'meeting' && !data.location) {
      warnings.push({
        field: 'location',
        message: 'Une réunion devrait avoir un lieu défini',
        code: 'MEETING_NO_LOCATION',
      });
    }

    // Visite de site sans lieu
    if (data.category === 'site_visit' && !data.location) {
      warnings.push({
        field: 'location',
        message: 'Une visite de site doit avoir un lieu défini',
        code: 'SITE_VISIT_NO_LOCATION',
      });
    }

    // Paiement sans bureau
    if (data.category === 'payment' && !data.bureau) {
      warnings.push({
        field: 'bureau',
        message: 'Un paiement devrait être rattaché à un bureau',
        code: 'PAYMENT_NO_BUREAU',
      });
    }

    return warnings;
  }

  /**
   * Formatte les erreurs pour affichage
   */
  formatErrors(result: EventValidationResult): string {
    const messages: string[] = [];

    if (result.errors.length > 0) {
      messages.push('Erreurs :');
      result.errors.forEach(err => {
        messages.push(`  • ${err.message}`);
      });
    }

    if (result.warnings.length > 0) {
      messages.push('Avertissements :');
      result.warnings.forEach(warn => {
        messages.push(`  ⚠ ${warn.message}`);
      });
    }

    return messages.join('\n');
  }
}

// Instance singleton
export const calendarValidation = new CalendarValidationService();

export default calendarValidation;

