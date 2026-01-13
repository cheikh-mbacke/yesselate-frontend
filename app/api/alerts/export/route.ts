import { NextRequest, NextResponse } from 'next/server';
import { generateMockAlerts } from '@/lib/data/alerts';

/**
 * POST /api/alerts/export
 * Exporter les alertes dans différents formats
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, format, includeTimeline } = body;

    if (!format) {
      return NextResponse.json(
        { error: 'Missing required field: format' },
        { status: 400 }
      );
    }

    const validFormats = ['csv', 'excel', 'pdf', 'json'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format: ${format}. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // Générer les alertes à exporter
    let alerts = generateMockAlerts(100);

    // Appliquer les filtres si fournis
    if (filters) {
      if (filters.status) {
        alerts = alerts.filter(a => a.status === filters.status);
      }
      if (filters.severity) {
        alerts = alerts.filter(a => a.type === filters.severity);
      }
      if (filters.queue) {
        alerts = alerts.filter(a => a.queue === filters.queue);
      }
    }

    // Simuler la génération du fichier
    const filename = `alerts-export-${Date.now()}.${format}`;
    const url = `/exports/${filename}`;
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // Expire dans 1h

    return NextResponse.json({
      url,
      filename,
      expiresAt,
      count: alerts.length,
      format,
      message: `Export ${format} generated successfully`,
    });
  } catch (error) {
    console.error('Error exporting alerts:', error);
    return NextResponse.json(
      { error: 'Failed to export alerts', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
