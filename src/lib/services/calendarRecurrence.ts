/**
 * SERVICE DE GESTION DES RÉCURRENCES
 * 
 * Gère la création et la gestion d'événements récurrents :
 * - Quotidien (daily)
 * - Hebdomadaire (weekly)
 * - Mensuel (monthly)
 * - Annuel (yearly)
 * 
 * Supporte :
 * - Intervalles personnalisés
 * - Jours spécifiques de la semaine
 * - Dates d'exception
 * - Limite par nombre d'occurrences ou date de fin
 */

import { prisma } from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval: number; // Tous les X jours/semaines/mois/années
  daysOfWeek?: string[]; // Pour weekly: ['MON', 'WED', 'FRI']
  dayOfMonth?: number; // Pour monthly: 1..31
  monthOfYear?: number; // Pour yearly: 1..12
  endDate?: Date; // Date de fin
  count?: number; // Nombre d'occurrences
  exceptions?: Date[]; // Dates à exclure
}

export interface RecurrenceInstance {
  start: Date;
  end: Date;
  isException: boolean;
}

// ============================================
// SERVICE
// ============================================

export class CalendarRecurrenceService {
  /**
   * Créer des événements récurrents
   */
  static async createRecurringEvents(
    baseEventId: string,
    config: RecurrenceConfig,
    baseEventData: any
  ): Promise<string[]> {
    const instances = this.generateInstances(
      baseEventData.start,
      baseEventData.end,
      config
    );

    const createdEventIds: string[] = [baseEventId]; // Inclut l'événement de base

    // Créer les événements récurrents
    for (const instance of instances) {
      if (instance.isException) continue;

      try {
        const event = await prisma.calendarEvent.create({
          data: {
            title: baseEventData.title,
            description: baseEventData.description,
            kind: baseEventData.kind,
            bureau: baseEventData.bureau,
            start: instance.start,
            end: instance.end,
            priority: baseEventData.priority,
            status: baseEventData.status || 'open',
            project: baseEventData.project,
            slaDueAt: baseEventData.slaDueAt,
            location: baseEventData.location,
            equipment: baseEventData.equipment,
            budget: baseEventData.budget,
            notes: baseEventData.notes,
            assignees: baseEventData.assignees ? {
              create: baseEventData.assignees.map((a: any) => ({
                userId: a.id,
                userName: a.name,
                role: a.role || 'participant',
              })),
            } : undefined,
          },
        });

        createdEventIds.push(event.id);
      } catch (error) {
        console.error('Error creating recurring event:', error);
      }
    }

    return createdEventIds;
  }

  /**
   * Générer les instances d'événements récurrents
   */
  static generateInstances(
    baseStart: Date,
    baseEnd: Date,
    config: RecurrenceConfig,
    maxInstances: number = 100
  ): RecurrenceInstance[] {
    const instances: RecurrenceInstance[] = [];
    const duration = baseEnd.getTime() - baseStart.getTime();

    let currentDate = new Date(baseStart);
    let count = 0;

    while (count < maxInstances) {
      // Vérifier si on a atteint la limite
      if (config.count && instances.length >= config.count) break;
      if (config.endDate && currentDate > config.endDate) break;

      // Vérifier si c'est une exception
      const isException = config.exceptions?.some(
        ex => ex.toDateString() === currentDate.toDateString()
      ) || false;

      instances.push({
        start: new Date(currentDate),
        end: new Date(currentDate.getTime() + duration),
        isException,
      });

      // Calculer la prochaine occurrence
      currentDate = this.getNextOccurrence(currentDate, config);
      count++;

      // Protection contre boucle infinie
      if (count > 1000) {
        console.warn('Recurrence generation stopped: too many instances');
        break;
      }
    }

    return instances;
  }

  /**
   * Calculer la prochaine occurrence
   */
  private static getNextOccurrence(
    currentDate: Date,
    config: RecurrenceConfig
  ): Date {
    const next = new Date(currentDate);

    switch (config.frequency) {
      case 'daily':
        next.setDate(next.getDate() + config.interval);
        break;

      case 'weekly':
        // Si daysOfWeek est défini, passer au prochain jour de la semaine
        if (config.daysOfWeek && config.daysOfWeek.length > 0) {
          next.setDate(next.getDate() + 1);
          
          while (!this.isDayOfWeekMatch(next, config.daysOfWeek)) {
            next.setDate(next.getDate() + 1);
            
            // Si on a passé 7 jours, ajouter l'intervalle de semaines
            if (next.getDay() === currentDate.getDay()) {
              next.setDate(next.getDate() + (config.interval - 1) * 7);
              break;
            }
          }
        } else {
          next.setDate(next.getDate() + config.interval * 7);
        }
        break;

      case 'monthly':
        if (config.dayOfMonth) {
          // Jour spécifique du mois
          next.setMonth(next.getMonth() + config.interval);
          next.setDate(Math.min(config.dayOfMonth, this.getDaysInMonth(next)));
        } else {
          // Même jour du mois
          const targetDay = currentDate.getDate();
          next.setMonth(next.getMonth() + config.interval);
          next.setDate(Math.min(targetDay, this.getDaysInMonth(next)));
        }
        break;

      case 'yearly':
        if (config.monthOfYear && config.dayOfMonth) {
          // Jour et mois spécifiques
          next.setFullYear(next.getFullYear() + config.interval);
          next.setMonth(config.monthOfYear - 1);
          next.setDate(config.dayOfMonth);
        } else {
          // Même date l'année suivante
          next.setFullYear(next.getFullYear() + config.interval);
        }
        break;
    }

    return next;
  }

  /**
   * Vérifier si un jour correspond aux jours de semaine spécifiés
   */
  private static isDayOfWeekMatch(date: Date, daysOfWeek: string[]): boolean {
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const currentDay = dayNames[date.getDay()];
    return daysOfWeek.includes(currentDay);
  }

  /**
   * Obtenir le nombre de jours dans un mois
   */
  private static getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  /**
   * Mettre à jour une série d'événements récurrents
   */
  static async updateRecurringSeries(
    baseEventId: string,
    updates: any,
    scope: 'this' | 'future' | 'all'
  ): Promise<void> {
    // Récupérer l'événement de base
    const baseEvent = await prisma.calendarEvent.findUnique({
      where: { id: baseEventId },
      include: { recurrence: true },
    });

    if (!baseEvent || !baseEvent.recurrence) {
      throw new Error('Not a recurring event');
    }

    switch (scope) {
      case 'this':
        // Mettre à jour seulement cet événement
        await prisma.calendarEvent.update({
          where: { id: baseEventId },
          data: updates,
        });
        break;

      case 'future':
        // Mettre à jour cet événement et tous les futurs
        await prisma.calendarEvent.updateMany({
          where: {
            start: { gte: baseEvent.start },
            // TODO: ajouter lien vers série récurrente
          },
          data: updates,
        });
        break;

      case 'all':
        // Mettre à jour toute la série
        // TODO: implémenter le lien vers série récurrente
        await prisma.calendarEvent.update({
          where: { id: baseEventId },
          data: updates,
        });
        break;
    }
  }

  /**
   * Supprimer une série d'événements récurrents
   */
  static async deleteRecurringSeries(
    baseEventId: string,
    scope: 'this' | 'future' | 'all'
  ): Promise<void> {
    const baseEvent = await prisma.calendarEvent.findUnique({
      where: { id: baseEventId },
      include: { recurrence: true },
    });

    if (!baseEvent || !baseEvent.recurrence) {
      throw new Error('Not a recurring event');
    }

    switch (scope) {
      case 'this':
        // Supprimer seulement cet événement
        await prisma.calendarEvent.delete({
          where: { id: baseEventId },
        });
        break;

      case 'future':
        // Supprimer cet événement et tous les futurs
        await prisma.calendarEvent.deleteMany({
          where: {
            start: { gte: baseEvent.start },
            // TODO: ajouter lien vers série récurrente
          },
        });
        break;

      case 'all':
        // Supprimer toute la série
        // TODO: implémenter le lien vers série récurrente
        await prisma.calendarEvent.delete({
          where: { id: baseEventId },
        });
        break;
    }
  }

  /**
   * Ajouter une exception à une série récurrente
   */
  static async addException(
    eventId: string,
    exceptionDate: Date
  ): Promise<void> {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { recurrence: true },
    });

    if (!event || !event.recurrence) {
      throw new Error('Not a recurring event');
    }

    const exceptions = event.recurrence.exceptions
      ? JSON.parse(event.recurrence.exceptions)
      : [];

    exceptions.push(exceptionDate.toISOString());

    await prisma.calendarRecurrence.update({
      where: { id: event.recurrence.id },
      data: {
        exceptions: JSON.stringify(exceptions),
      },
    });
  }

  /**
   * Obtenir les prochaines occurrences d'un événement récurrent
   */
  static async getUpcomingOccurrences(
    eventId: string,
    limit: number = 10
  ): Promise<RecurrenceInstance[]> {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { recurrence: true },
    });

    if (!event || !event.recurrence) {
      return [];
    }

    const config: RecurrenceConfig = {
      frequency: event.recurrence.frequency as RecurrenceFrequency,
      interval: event.recurrence.interval,
      daysOfWeek: event.recurrence.daysOfWeek
        ? JSON.parse(event.recurrence.daysOfWeek)
        : undefined,
      dayOfMonth: event.recurrence.dayOfMonth || undefined,
      monthOfYear: event.recurrence.monthOfYear || undefined,
      endDate: event.recurrence.endDate || undefined,
      count: event.recurrence.count || undefined,
      exceptions: event.recurrence.exceptions
        ? JSON.parse(event.recurrence.exceptions).map((d: string) => new Date(d))
        : undefined,
    };

    const now = new Date();
    const instances = this.generateInstances(event.start, event.end, config, limit * 2);

    // Filtrer pour garder seulement les futures occurrences
    return instances
      .filter(inst => inst.start > now && !inst.isException)
      .slice(0, limit);
  }

  /**
   * Générer une description textuelle de la récurrence
   */
  static describeRecurrence(config: RecurrenceConfig): string {
    const { frequency, interval, daysOfWeek, dayOfMonth, endDate, count } = config;

    let description = '';

    // Fréquence
    switch (frequency) {
      case 'daily':
        description = interval === 1 ? 'Tous les jours' : `Tous les ${interval} jours`;
        break;

      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const dayNames: Record<string, string> = {
            MON: 'lun',
            TUE: 'mar',
            WED: 'mer',
            THU: 'jeu',
            FRI: 'ven',
            SAT: 'sam',
            SUN: 'dim',
          };
          const days = daysOfWeek.map(d => dayNames[d]).join(', ');
          description = interval === 1
            ? `Chaque semaine le ${days}`
            : `Toutes les ${interval} semaines le ${days}`;
        } else {
          description = interval === 1
            ? 'Chaque semaine'
            : `Toutes les ${interval} semaines`;
        }
        break;

      case 'monthly':
        if (dayOfMonth) {
          description = interval === 1
            ? `Le ${dayOfMonth} de chaque mois`
            : `Le ${dayOfMonth} tous les ${interval} mois`;
        } else {
          description = interval === 1
            ? 'Chaque mois'
            : `Tous les ${interval} mois`;
        }
        break;

      case 'yearly':
        description = interval === 1 ? 'Chaque année' : `Tous les ${interval} ans`;
        break;
    }

    // Fin
    if (endDate) {
      description += ` jusqu'au ${endDate.toLocaleDateString('fr-FR')}`;
    } else if (count) {
      description += ` (${count} occurrences)`;
    }

    return description;
  }
}

// Export par défaut
export default CalendarRecurrenceService;

