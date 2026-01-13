/**
 * GET/PUT /api/dashboard/preferences
 * Préférences utilisateur pour le Dashboard
 */

import { NextRequest, NextResponse } from 'next/server';

// Stockage temporaire en mémoire (en prod, utiliser DB)
let userPreferences: Record<string, any> = {};

/**
 * GET - Récupérer les préférences
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';

    const preferences = userPreferences[userId] || {
      // Valeurs par défaut
      theme: 'dark',
      viewMode: 'extended',
      focusMode: false,
      sidebarCollapsed: false,
      kpiBar: {
        visible: true,
        collapsed: false,
        refreshInterval: 30,
        autoRefresh: true,
      },
      sections: [
        { id: 'performance', visible: true, order: 0 },
        { id: 'actions', visible: true, order: 1 },
        { id: 'risks', visible: true, order: 2 },
        { id: 'decisions', visible: true, order: 3 },
        { id: 'realtime', visible: true, order: 4 },
        { id: 'analytics', visible: true, order: 5 },
      ],
      filters: {
        defaultPeriod: 'year',
        defaultBureaux: [],
      },
      notifications: {
        enabled: true,
        critical: true,
        warnings: true,
        email: false,
      },
    };

    return NextResponse.json({
      preferences,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Sauvegarder les préférences
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'default', preferences } = body;

    if (!preferences) {
      return NextResponse.json(
        { error: 'Preferences data is required' },
        { status: 400 }
      );
    }

    // Sauvegarder (en prod, dans la DB)
    userPreferences[userId] = {
      ...userPreferences[userId],
      ...preferences,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      preferences: userPreferences[userId],
      message: 'Préférences sauvegardées avec succès',
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Réinitialiser les préférences
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';

    delete userPreferences[userId];

    return NextResponse.json({
      success: true,
      message: 'Préférences réinitialisées',
    });
  } catch (error) {
    console.error('Error deleting preferences:', error);
    return NextResponse.json(
      { error: 'Failed to delete preferences' },
      { status: 500 }
    );
  }
}

