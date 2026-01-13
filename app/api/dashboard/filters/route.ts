/**
 * GET/POST/DELETE /api/dashboard/filters
 * Gestion des filtres sauvegardés
 */

import { NextRequest, NextResponse } from 'next/server';

// Stockage temporaire en mémoire (en prod, utiliser DB)
let savedFilters: Record<string, any[]> = {};

/**
 * GET - Liste des filtres sauvegardés
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';

    const userFilters = savedFilters[userId] || [];

    return NextResponse.json({
      filters: userFilters,
      count: userFilters.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer un filtre sauvegardé
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'default', name, filters } = body;

    if (!name || !filters) {
      return NextResponse.json(
        { error: 'Name and filters are required' },
        { status: 400 }
      );
    }

    // Initialiser si nécessaire
    if (!savedFilters[userId]) {
      savedFilters[userId] = [];
    }

    // Vérifier si nom existe déjà
    const existingIndex = savedFilters[userId].findIndex((f) => f.name === name);
    
    const newFilter = {
      id: `filter-${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Mettre à jour
      savedFilters[userId][existingIndex] = {
        ...savedFilters[userId][existingIndex],
        filters,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Créer nouveau
      savedFilters[userId].push(newFilter);
    }

    return NextResponse.json({
      success: true,
      filter: newFilter,
      message: existingIndex >= 0 ? 'Filtre mis à jour' : 'Filtre créé',
    });
  } catch (error) {
    console.error('Error saving filter:', error);
    return NextResponse.json(
      { error: 'Failed to save filter' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer un filtre sauvegardé
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    const filterName = searchParams.get('name');

    if (!filterName) {
      return NextResponse.json(
        { error: 'Filter name is required' },
        { status: 400 }
      );
    }

    if (!savedFilters[userId]) {
      return NextResponse.json(
        { error: 'No saved filters found' },
        { status: 404 }
      );
    }

    savedFilters[userId] = savedFilters[userId].filter((f) => f.name !== filterName);

    return NextResponse.json({
      success: true,
      message: 'Filtre supprimé',
    });
  } catch (error) {
    console.error('Error deleting filter:', error);
    return NextResponse.json(
      { error: 'Failed to delete filter' },
      { status: 500 }
    );
  }
}

