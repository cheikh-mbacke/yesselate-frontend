/**
 * GET /api/calendar/conflicts
 * Détecter les conflits de calendrier
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Simuler détection de conflits
    // En prod, analyser les événements avec participants et horaires qui se chevauchent
    
    const conflicts = [
      {
        id: 'CONFLICT-001',
        date: new Date().toISOString(),
        type: 'participant_overlap',
        severity: 'warning',
        events: [
          { id: 'EVT-002', title: 'Deadline BC-2024-0847', participants: ['M. Dupont'] },
          { id: 'EVT-003', title: 'Réunion fournisseurs', participants: ['M. Dupont'] },
        ],
        description: 'M. Dupont assigné sur 2 événements simultanés',
        suggestion: 'Déléguer ou reporter l\'un des événements',
      },
      {
        id: 'CONFLICT-002',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'resource_conflict',
        severity: 'critical',
        events: [
          { id: 'EVT-004', title: 'Réunion Salle A', location: 'Salle A', time: '14:00-16:00' },
          { id: 'EVT-005', title: 'Formation', location: 'Salle A', time: '14:30-17:00' },
        ],
        description: 'Salle A réservée 2 fois sur la même plage horaire',
        suggestion: 'Changer de salle ou d\'horaire',
      },
    ];

    // Filtrer par période
    let filteredConflicts = conflicts;
    if (startDate) {
      const start = new Date(startDate);
      filteredConflicts = filteredConflicts.filter((c) => new Date(c.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filteredConflicts = filteredConflicts.filter((c) => new Date(c.date) <= end);
    }

    const stats = {
      total: filteredConflicts.length,
      critical: filteredConflicts.filter((c) => c.severity === 'critical').length,
      warning: filteredConflicts.filter((c) => c.severity === 'warning').length,
      participantOverlap: filteredConflicts.filter((c) => c.type === 'participant_overlap').length,
      resourceConflict: filteredConflicts.filter((c) => c.type === 'resource_conflict').length,
    };

    return NextResponse.json({
      conflicts: filteredConflicts,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error detecting conflicts:', error);
    return NextResponse.json(
      { error: 'Failed to detect conflicts' },
      { status: 500 }
    );
  }
}
