/**
 * TESTS UNITAIRES - SERVICES CALENDRIER
 * 
 * Tests pour :
 * - CalendarSLAService
 * - CalendarConflictService
 * - CalendarRecurrenceService
 * - CalendarNotificationService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CalendarSLAService } from '@/lib/services/calendarSLA';
import { CalendarConflictService } from '@/lib/services/calendarConflicts';
import { CalendarRecurrenceService } from '@/lib/services/calendarRecurrence';

// ============================================
// CALENDAR SLA SERVICE TESTS
// ============================================

describe('CalendarSLAService', () => {
  let slaService: CalendarSLAService;

  beforeEach(() => {
    slaService = new CalendarSLAService();
  });

  describe('calculateSLA', () => {
    it('devrait calculer la date SLA correctement', () => {
      const startDate = new Date('2024-01-15T10:00:00');
      const slaDate = slaService.calculateSLA(startDate, 'meeting_preparation', 'dakar');

      expect(slaDate).toBeDefined();
      expect(slaDate.getTime()).toBeGreaterThan(startDate.getTime());
    });

    it('devrait retourner le bon statut SLA', () => {
      const now = new Date();
      const slaDueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 jour

      const status = slaService.getSLAStatus(now, slaDueDate);
      expect(status).toBe('on_track');
    });

    it('devrait détecter un SLA overdue', () => {
      const now = new Date();
      const slaDueDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // -1 jour

      const status = slaService.getSLAStatus(now, slaDueDate);
      expect(status).toBe('overdue');
    });

    it('devrait détecter un SLA at_risk', () => {
      const now = new Date();
      const slaDueDate = new Date(now.getTime() + 12 * 60 * 60 * 1000); // +12 heures

      const status = slaService.getSLAStatus(now, slaDueDate);
      expect(status).toBe('at_risk');
    });
  });

  describe('calculateWorkingDays', () => {
    it('devrait exclure les weekends', () => {
      const start = new Date('2024-01-15'); // Lundi
      const end = new Date('2024-01-19'); // Vendredi

      const days = slaService.calculateWorkingDays(start, end);
      expect(days).toBe(5);
    });

    it('devrait exclure les jours fériés sénégalais', () => {
      const start = new Date('2024-01-01'); // Jour de l'An (férié)
      const end = new Date('2024-01-05');

      const days = slaService.calculateWorkingDays(start, end);
      expect(days).toBeLessThan(5);
    });
  });

  describe('getRecommendations', () => {
    it('devrait fournir des recommandations pour SLA overdue', () => {
      const event = {
        id: '1',
        title: 'Test',
        slaStatus: 'overdue',
        priority: 'high',
      };

      const recommendations = slaService.getRecommendations(event as any);
      
      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toContain('urgent');
    });
  });
});

// ============================================
// CALENDAR CONFLICT SERVICE TESTS
// ============================================

describe('CalendarConflictService', () => {
  let conflictService: CalendarConflictService;

  beforeEach(() => {
    conflictService = new CalendarConflictService();
  });

  describe('detectConflicts', () => {
    it('devrait détecter un conflit de chevauchement temporel', async () => {
      const newEvent = {
        id: 'new',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00'),
        attendeeIds: ['user1'],
        resourceIds: [],
        location: 'Salle A',
      };

      const existingEvents = [
        {
          id: 'existing',
          start: new Date('2024-01-15T10:30:00'),
          end: new Date('2024-01-15T11:30:00'),
          attendeeIds: ['user1'],
          resourceIds: [],
          location: 'Salle B',
        },
      ];

      const conflicts = await conflictService.detectConflicts(
        newEvent as any,
        existingEvents as any
      );

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].type).toBe('scheduling');
    });

    it('devrait détecter un conflit de ressource', async () => {
      const newEvent = {
        id: 'new',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00'),
        attendeeIds: [],
        resourceIds: ['projector1'],
        location: 'Salle A',
      };

      const existingEvents = [
        {
          id: 'existing',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00'),
          attendeeIds: [],
          resourceIds: ['projector1'],
          location: 'Salle B',
        },
      ];

      const conflicts = await conflictService.detectConflicts(
        newEvent as any,
        existingEvents as any
      );

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].type).toBe('resource');
    });

    it('devrait détecter un conflit de lieu', async () => {
      const newEvent = {
        id: 'new',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00'),
        attendeeIds: [],
        resourceIds: [],
        location: 'Salle A',
      };

      const existingEvents = [
        {
          id: 'existing',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00'),
          attendeeIds: [],
          resourceIds: [],
          location: 'Salle A',
        },
      ];

      const conflicts = await conflictService.detectConflicts(
        newEvent as any,
        existingEvents as any
      );

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].type).toBe('location');
    });

    it('ne devrait pas détecter de conflit si pas de chevauchement', async () => {
      const newEvent = {
        id: 'new',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00'),
        attendeeIds: ['user1'],
        resourceIds: [],
        location: 'Salle A',
      };

      const existingEvents = [
        {
          id: 'existing',
          start: new Date('2024-01-15T12:00:00'),
          end: new Date('2024-01-15T13:00:00'),
          attendeeIds: ['user1'],
          resourceIds: [],
          location: 'Salle A',
        },
      ];

      const conflicts = await conflictService.detectConflicts(
        newEvent as any,
        existingEvents as any
      );

      expect(conflicts.length).toBe(0);
    });
  });

  describe('suggestResolution', () => {
    it('devrait suggérer des résolutions appropriées', () => {
      const conflict = {
        type: 'scheduling',
        severity: 'high',
        conflictingEvents: [{ id: '1' }],
      };

      const resolutions = conflictService.suggestResolution(conflict as any);
      
      expect(resolutions).toBeDefined();
      expect(resolutions.length).toBeGreaterThan(0);
    });
  });
});

// ============================================
// CALENDAR RECURRENCE SERVICE TESTS
// ============================================

describe('CalendarRecurrenceService', () => {
  let recurrenceService: CalendarRecurrenceService;

  beforeEach(() => {
    recurrenceService = new CalendarRecurrenceService();
  });

  describe('generateRRule', () => {
    it('devrait générer RRULE pour récurrence quotidienne', () => {
      const rrule = recurrenceService.generateRRule({
        frequency: 'DAILY',
        interval: 1,
        count: 10,
      });

      expect(rrule).toContain('FREQ=DAILY');
      expect(rrule).toContain('INTERVAL=1');
      expect(rrule).toContain('COUNT=10');
    });

    it('devrait générer RRULE pour récurrence hebdomadaire', () => {
      const rrule = recurrenceService.generateRRule({
        frequency: 'WEEKLY',
        interval: 2,
        byWeekday: ['MO', 'WE', 'FR'],
      });

      expect(rrule).toContain('FREQ=WEEKLY');
      expect(rrule).toContain('INTERVAL=2');
      expect(rrule).toContain('BYDAY=MO,WE,FR');
    });

    it('devrait générer RRULE pour récurrence mensuelle', () => {
      const rrule = recurrenceService.generateRRule({
        frequency: 'MONTHLY',
        interval: 1,
        byMonthDay: [15],
      });

      expect(rrule).toContain('FREQ=MONTHLY');
      expect(rrule).toContain('BYMONTHDAY=15');
    });

    it('devrait générer RRULE avec date de fin', () => {
      const until = new Date('2024-12-31');
      const rrule = recurrenceService.generateRRule({
        frequency: 'DAILY',
        interval: 1,
        until,
      });

      expect(rrule).toContain('FREQ=DAILY');
      expect(rrule).toContain('UNTIL=');
    });
  });

  describe('parseRRule', () => {
    it('devrait parser un RRULE valide', () => {
      const rrule = 'FREQ=DAILY;INTERVAL=1;COUNT=10';
      const parsed = recurrenceService.parseRRule(rrule);

      expect(parsed.frequency).toBe('DAILY');
      expect(parsed.interval).toBe(1);
      expect(parsed.count).toBe(10);
    });

    it('devrait gérer RRULE avec BYDAY', () => {
      const rrule = 'FREQ=WEEKLY;BYDAY=MO,WE,FR';
      const parsed = recurrenceService.parseRRule(rrule);

      expect(parsed.frequency).toBe('WEEKLY');
      expect(parsed.byWeekday).toEqual(['MO', 'WE', 'FR']);
    });
  });

  describe('getNextOccurrences', () => {
    it('devrait générer les prochaines occurrences', () => {
      const baseEvent = {
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00'),
      };

      const rrule = 'FREQ=DAILY;INTERVAL=1;COUNT=5';
      
      const occurrences = recurrenceService.getNextOccurrences(
        baseEvent as any,
        rrule,
        5
      );

      expect(occurrences.length).toBe(5);
      expect(occurrences[1].start.getDate()).toBe(16);
      expect(occurrences[2].start.getDate()).toBe(17);
    });

    it('devrait respecter les dates d\'exception', () => {
      const baseEvent = {
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00'),
      };

      const rrule = 'FREQ=DAILY;INTERVAL=1;COUNT=5';
      const exceptionDates = ['2024-01-16T10:00:00'];
      
      const occurrences = recurrenceService.getNextOccurrences(
        baseEvent as any,
        rrule,
        5,
        exceptionDates
      );

      const dates = occurrences.map(o => o.start.getDate());
      expect(dates).not.toContain(16);
    });
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

describe('Calendar Services Integration', () => {
  it('devrait détecter conflit + SLA + notification', async () => {
    const slaService = new CalendarSLAService();
    const conflictService = new CalendarConflictService();

    // Créer événement avec SLA
    const event = {
      id: '1',
      title: 'Réunion importante',
      start: new Date('2024-01-15T10:00:00'),
      end: new Date('2024-01-15T11:00:00'),
      category: 'meeting_preparation',
      bureauId: 'dakar',
      attendeeIds: ['user1'],
      resourceIds: [],
      location: 'Salle A',
      priority: 'high',
    };

    // Calculer SLA
    const slaDueDate = slaService.calculateSLA(
      event.start,
      event.category,
      event.bureauId
    );

    expect(slaDueDate).toBeDefined();

    // Vérifier conflits
    const conflicts = await conflictService.detectConflicts(event as any, []);
    expect(conflicts).toBeDefined();

    // Vérifier statut SLA
    const slaStatus = slaService.getSLAStatus(new Date(), slaDueDate);
    expect(['on_track', 'at_risk', 'overdue']).toContain(slaStatus);
  });
});

