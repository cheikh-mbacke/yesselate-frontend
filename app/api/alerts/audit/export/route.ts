import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/alerts/audit/export
 * Exporter l'audit trail (CSV, JSON, PDF)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Données mockées pour l'export
    const data = [
      {
        id: 'audit-1',
        alertId: 'alert-001',
        action: 'created',
        actor: 'Jean Dupont',
        timestamp: new Date().toISOString(),
        changes: '',
        note: 'Création automatique',
      },
      {
        id: 'audit-2',
        alertId: 'alert-001',
        action: 'acknowledged',
        actor: 'Marie Martin',
        timestamp: new Date().toISOString(),
        changes: 'status: open → acknowledged',
        note: 'Prise en charge',
      },
      // ... plus de données
    ];

    // Format CSV
    if (format === 'csv') {
      const headers = ['ID', 'Alert ID', 'Action', 'Actor', 'Timestamp', 'Changes', 'Note'];
      const rows = data.map((entry) => [
        entry.id,
        entry.alertId,
        entry.action,
        entry.actor,
        entry.timestamp,
        entry.changes,
        entry.note,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-trail-${Date.now()}.csv"`,
        },
      });
    }

    // Format JSON
    if (format === 'json') {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="audit-trail-${Date.now()}.json"`,
        },
      });
    }

    // Format PDF (simulé)
    if (format === 'pdf') {
      return NextResponse.json({
        message: 'PDF generation would be implemented here using a library like jsPDF or puppeteer',
        data,
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting audit:', error);
    return NextResponse.json(
      { error: 'Failed to export audit', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

