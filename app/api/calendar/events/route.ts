/**
 * GET/POST /api/calendar/events
 * Gestion des événements du calendrier
 */

import { NextRequest, NextResponse } from 'next/server';

// Stockage temporaire en mémoire (en prod, utiliser DB)
let events: any[] = [
  {
    id: 'EVT-001',
    title: 'Comité de pilotage',
    date: new Date().toISOString(),
    startTime: '09:00',
    endTime: '11:00',
    type: 'meeting',
    priority: 'high',
    project: 'Projet Alpha',
    participants: ['M. Dupont', 'Mme Martin', 'M. Koné'],
    location: 'Salle A',
    createdAt: new Date().toISOString(),
    createdBy: 'user-001',
  },
];

/**
 * GET - Liste des événements
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type'); // 'meeting' | 'deadline' | 'milestone' | 'task'

    let filteredEvents = [...events];

    // Filtrer par date
    if (startDate) {
      const start = new Date(startDate);
      filteredEvents = filteredEvents.filter((e) => new Date(e.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filteredEvents = filteredEvents.filter((e) => new Date(e.date) <= end);
    }

    // Filtrer par type
    if (type) {
      filteredEvents = filteredEvents.filter((e) => e.type === type);
    }

    // Trier par date
    filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      events: filteredEvents,
      count: filteredEvents.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer un événement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      date,
      startTime,
      endTime,
      type = 'task',
      priority = 'medium',
      project,
      participants,
      location,
      userId = 'user-001',
    } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      );
    }

    // Créer événement
    const newEvent = {
      id: `EVT-${Date.now()}`,
      title,
      date: new Date(date).toISOString(),
      startTime,
      endTime,
      type,
      priority,
      project,
      participants: participants || [],
      location,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      updatedAt: new Date().toISOString(),
    };

    events.push(newEvent);

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: 'Événement créé avec succès',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
