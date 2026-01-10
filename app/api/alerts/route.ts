import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/alerts
 * Retourne la liste des alertes avec filtres optionnels
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queue = searchParams.get('queue') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 400));

    // Générer des alertes réalistes
    const allAlerts = generateAlerts(100);
    
    // Filtrer par queue
    let filtered = allAlerts;
    if (queue !== 'all') {
      filtered = allAlerts.filter(alert => {
        switch (queue) {
          case 'critical':
            return alert.severity === 'critical';
          case 'high':
            return alert.severity === 'high';
          case 'resolved':
            return alert.status === 'resolved';
          case 'pending':
            return alert.status === 'pending' || alert.status === 'in_progress';
          default:
            return true;
        }
      });
    }

    // Pagination
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      alerts: paginated,
      total: filtered.length,
      limit,
      offset,
      hasMore: offset + limit < filtered.length,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

function generateAlerts(count: number) {
  const types = ['technical', 'administrative', 'financial', 'quality'];
  const severities = ['critical', 'high', 'medium', 'low'];
  const statuses = ['pending', 'in_progress', 'resolved', 'escalated'];
  const bureaus = ['Dakar Centre', 'Dakar Plateau', 'Pikine', 'Guédiawaye', 'Rufisque'];
  const responsibles = ['Marie Diop', 'Amadou Seck', 'Fatou Ndiaye', 'Omar Ba', 'Aïssatou Fall'];

  const alerts = [];
  for (let i = 0; i < count; i++) {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdDaysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - createdDaysAgo);

    alerts.push({
      id: `ALT-2026-${String(count - i).padStart(3, '0')}`,
      title: generateAlertTitle(types[Math.floor(Math.random() * types.length)]),
      type: types[Math.floor(Math.random() * types.length)],
      severity,
      status,
      bureau: bureaus[Math.floor(Math.random() * bureaus.length)],
      responsible: responsibles[Math.floor(Math.random() * responsibles.length)],
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      daysBlocked: status === 'pending' ? Math.floor(Math.random() * 10) : 0,
      context: 'Contexte de l\'alerte...',
      priority: severity === 'critical' || severity === 'high' ? 'high' : 'normal',
    });
  }

  return alerts.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function generateAlertTitle(type: string): string {
  const titles = {
    technical: [
      'Retard livraison matériaux',
      'Problème qualité béton',
      'Panne équipement chantier',
      'Non-conformité technique',
    ],
    administrative: [
      'Document manquant dossier',
      'Retard validation administrative',
      'Conflit planning équipes',
      'Absence responsable chantier',
    ],
    financial: [
      'Dépassement budget prévisionnel',
      'Retard paiement fournisseur',
      'Écart coûts réels/prévisionnels',
      'Facture non conforme',
    ],
    quality: [
      'Non-conformité contrôle qualité',
      'Réclamation client qualité',
      'Défaut finitions',
      'Problème sécurité chantier',
    ],
  };

  const list = titles[type as keyof typeof titles] || titles.technical;
  return list[Math.floor(Math.random() * list.length)];
}

