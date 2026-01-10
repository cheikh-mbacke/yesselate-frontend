// API Route: GET /api/validation-bc/stats
// Retourne les statistiques globales de validation

import { NextRequest, NextResponse } from 'next/server';

// Mock data - à remplacer par de vraies requêtes DB
const mockDocuments = [
  { id: 'BC-2024-001', type: 'bc', status: 'pending', bureau: 'DRE', amount: 5000000, createdAt: new Date('2024-01-15') },
  { id: 'BC-2024-002', type: 'bc', status: 'validated', bureau: 'DAAF', amount: 3000000, createdAt: new Date('2024-01-14') },
  { id: 'FC-2024-001', type: 'facture', status: 'pending', bureau: 'DSI', amount: 2000000, createdAt: new Date('2024-01-13') },
  { id: 'AV-2024-001', type: 'avenant', status: 'rejected', bureau: 'DG', amount: 1000000, createdAt: new Date('2024-01-12') },
  { id: 'BC-2024-003', type: 'bc', status: 'pending', bureau: 'DRE', amount: 8000000, createdAt: new Date('2024-01-11'), urgent: true },
  { id: 'BC-2024-004', type: 'bc', status: 'anomaly', bureau: 'DAAF', amount: 4500000, createdAt: new Date('2024-01-10') },
];

const mockActivity = [
  {
    id: 'act-1',
    documentId: 'BC-2024-002',
    documentType: 'BC',
    action: 'Validé',
    actorName: 'A. DIALLO',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'act-2',
    documentId: 'FC-2024-001',
    documentType: 'Facture',
    action: 'Soumis',
    actorName: 'M. KANE',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'act-3',
    documentId: 'AV-2024-001',
    documentType: 'Avenant',
    action: 'Rejeté',
    actorName: 'B. SOW',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const reason = request.headers.get('x-bmo-reason') || 'manual';

    // Calcul des stats
    const total = mockDocuments.length;
    const pending = mockDocuments.filter((d) => d.status === 'pending').length;
    const validated = mockDocuments.filter((d) => d.status === 'validated').length;
    const rejected = mockDocuments.filter((d) => d.status === 'rejected').length;
    const anomalies = mockDocuments.filter((d) => d.status === 'anomaly').length;
    const urgent = mockDocuments.filter((d) => d.urgent).length;

    // Stats par bureau
    const bureauCounts = mockDocuments.reduce((acc, doc) => {
      acc[doc.bureau] = (acc[doc.bureau] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byBureau = Object.entries(bureauCounts)
      .map(([bureau, count]) => ({ bureau, count }))
      .sort((a, b) => b.count - a.count);

    // Stats par type
    const typeCounts = mockDocuments.reduce((acc, doc) => {
      const typeName = doc.type === 'bc' ? 'Bon de commande' : doc.type === 'facture' ? 'Facture' : 'Avenant';
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const stats = {
      total,
      pending,
      validated,
      rejected,
      anomalies,
      urgent,
      byBureau,
      byType,
      recentActivity: mockActivity,
      ts: new Date().toISOString(),
    };

    // Log pour debug
    console.log(`[validation-bc/stats] Loaded stats (reason: ${reason})`, {
      total,
      pending,
      validated,
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[validation-bc/stats] Error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}

