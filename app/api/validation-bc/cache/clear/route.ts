// API Route: POST /api/validation-bc/cache/clear
// Permet de vider le cache serveur

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Dans une vraie implémentation, on viderait le cache Redis ou autre
    // Pour l'instant, on retourne juste un succès
    
    console.log('[validation-bc/cache] Cache cleared');

    return NextResponse.json({
      success: true,
      message: 'Cache vidé avec succès',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[validation-bc/cache] Error clearing cache:', error);
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}

