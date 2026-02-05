import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/export/:exportId
 * 
 * Récupère le statut détaillé d'un export
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exportId: string }> }
) {
  try {
    const { exportId } = await params;

    // Simuler le statut de l'export
    const exportStatus = {
      id: exportId,
      status: 'completed', // processing, completed, failed
      progress: 100,
      downloadUrl: `/downloads/analytics-${exportId}.xlsx`,
      error: null,
      createdAt: new Date(Date.now() - 120000).toISOString(),
      completedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 24).toISOString(), // 24h
      metadata: {
        format: 'excel',
        scope: 'dashboard',
        fileSize: '2.4 MB',
        recordCount: 1250,
      },
    };

    return NextResponse.json(exportStatus, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/export/:exportId:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du statut d\'export' },
      { status: 500 }
    );
  }
}

