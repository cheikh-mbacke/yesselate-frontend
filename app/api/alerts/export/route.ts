import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/alerts/export
 * Exporte les alertes dans différents formats
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const queue = searchParams.get('queue') || 'all';

    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 500));

    // Générer des données d'export
    const alerts = await generateExportData(queue);

    switch (format) {
      case 'csv':
        return exportAsCSV(alerts);
      case 'json':
        return exportAsJSON(alerts);
      case 'excel':
        return exportAsExcel(alerts);
      case 'pdf':
        return exportAsPDF(alerts);
      default:
        return NextResponse.json(
          { error: 'Format non supporté' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error exporting alerts:', error);
    return NextResponse.json(
      { error: 'Failed to export alerts' },
      { status: 500 }
    );
  }
}

async function generateExportData(queue: string) {
  // Générer des alertes pour l'export
  const alerts = [];
  const count = queue === 'all' ? 50 : 20;
  
  for (let i = 0; i < count; i++) {
    alerts.push({
      id: `ALT-2026-${String(i + 1).padStart(3, '0')}`,
      title: `Alerte ${i + 1}`,
      type: ['technical', 'administrative', 'financial'][i % 3],
      severity: ['critical', 'high', 'medium', 'low'][i % 4],
      status: ['pending', 'in_progress', 'resolved'][i % 3],
      bureau: ['Dakar Centre', 'Pikine', 'Rufisque'][i % 3],
      responsible: ['Marie Diop', 'Amadou Seck', 'Fatou Ndiaye'][i % 3],
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      priority: i % 3 === 0 ? 'high' : 'normal',
    });
  }
  
  return alerts;
}

function exportAsCSV(alerts: any[]) {
  // Créer le CSV
  const headers = ['ID', 'Titre', 'Type', 'Sévérité', 'Statut', 'Bureau', 'Responsable', 'Date création', 'Priorité'];
  const rows = alerts.map(a => [
    a.id,
    a.title,
    a.type,
    a.severity,
    a.status,
    a.bureau,
    a.responsible,
    new Date(a.createdAt).toLocaleDateString('fr-FR'),
    a.priority,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="alerts_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

function exportAsJSON(alerts: any[]) {
  return NextResponse.json(
    {
      exported_at: new Date().toISOString(),
      count: alerts.length,
      alerts,
    },
    {
      headers: {
        'Content-Disposition': `attachment; filename="alerts_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    }
  );
}

function exportAsExcel(alerts: any[]) {
  // Simuler un export Excel (en pratique, utiliser une bibliothèque comme xlsx)
  const csv = exportAsCSV(alerts);
  return new NextResponse(csv.body, {
    headers: {
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': `attachment; filename="alerts_${new Date().toISOString().slice(0, 10)}.xls"`,
    },
  });
}

function exportAsPDF(alerts: any[]) {
  // Retourner une page HTML pour impression/PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Export Alertes</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #e11d48; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f8fafc; font-weight: bold; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .critical { color: #dc2626; font-weight: bold; }
    .high { color: #ea580c; }
    @media print {
      button { display: none; }
    }
  </style>
</head>
<body>
  <h1>📋 Export Alertes & Risques</h1>
  <p><strong>Date d'export :</strong> ${new Date().toLocaleString('fr-FR')}</p>
  <p><strong>Nombre d'alertes :</strong> ${alerts.length}</p>
  
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Titre</th>
        <th>Type</th>
        <th>Sévérité</th>
        <th>Statut</th>
        <th>Bureau</th>
        <th>Responsable</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      ${alerts.map(a => `
        <tr>
          <td>${a.id}</td>
          <td>${a.title}</td>
          <td>${a.type}</td>
          <td class="${a.severity}">${a.severity}</td>
          <td>${a.status}</td>
          <td>${a.bureau}</td>
          <td>${a.responsible}</td>
          <td>${new Date(a.createdAt).toLocaleDateString('fr-FR')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #e11d48; color: white; border: none; border-radius: 4px; cursor: pointer;">
    🖨️ Imprimer / Sauvegarder en PDF
  </button>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

