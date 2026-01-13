// API Route: GET /api/validation-bc/validators
// Retourne la liste des validateurs avec leurs statistiques

import { NextRequest, NextResponse } from 'next/server';

// Mock data - à remplacer par de vraies requêtes DB
const generateValidators = () => {
  const bureaux = ['DRE', 'DAAF', 'DSI', 'DG', 'DAG', 'DRHC'];
  const validators = [
    {
      id: 'val-1',
      name: 'Amadou DIALLO',
      email: 'adiallo@example.com',
      bureau: 'DRE',
      role: 'Validateur Principal',
      avatar: null,
      stats: {
        validated: 45,
        rejected: 8,
        pending: 12,
        avgTime: '2.3h',
        performance: 92,
        totalProcessed: 53,
        successRate: 84.9,
      },
      activity: {
        today: 3,
        thisWeek: 12,
        thisMonth: 45,
        lastAction: new Date(Date.now() - 3600000).toISOString(),
      },
      workload: {
        current: 12,
        capacity: 20,
        utilizationRate: 60,
      },
      specializations: ['Bons de commande', 'Contrats'],
      status: 'active',
      createdAt: new Date('2023-01-15').toISOString(),
    },
    {
      id: 'val-2',
      name: 'Mariama KANE',
      email: 'mkane@example.com',
      bureau: 'DAAF',
      role: 'Validateur',
      avatar: null,
      stats: {
        validated: 38,
        rejected: 5,
        pending: 8,
        avgTime: '1.8h',
        performance: 95,
        totalProcessed: 43,
        successRate: 88.4,
      },
      activity: {
        today: 5,
        thisWeek: 18,
        thisMonth: 38,
        lastAction: new Date(Date.now() - 7200000).toISOString(),
      },
      workload: {
        current: 8,
        capacity: 15,
        utilizationRate: 53,
      },
      specializations: ['Factures', 'Avenants'],
      status: 'active',
      createdAt: new Date('2023-03-20').toISOString(),
    },
    {
      id: 'val-3',
      name: 'Boubacar SOW',
      email: 'bsow@example.com',
      bureau: 'DSI',
      role: 'Validateur Senior',
      avatar: null,
      stats: {
        validated: 62,
        rejected: 12,
        pending: 15,
        avgTime: '3.1h',
        performance: 88,
        totalProcessed: 74,
        successRate: 83.8,
      },
      activity: {
        today: 2,
        thisWeek: 10,
        thisMonth: 62,
        lastAction: new Date(Date.now() - 1800000).toISOString(),
      },
      workload: {
        current: 15,
        capacity: 25,
        utilizationRate: 60,
      },
      specializations: ['Bons de commande', 'Factures', 'Contrats'],
      status: 'active',
      createdAt: new Date('2022-06-10').toISOString(),
    },
    {
      id: 'val-4',
      name: 'Fatou NDIAYE',
      email: 'fndiaye@example.com',
      bureau: 'DG',
      role: 'Validateur Principal',
      avatar: null,
      stats: {
        validated: 52,
        rejected: 9,
        pending: 6,
        avgTime: '2.5h',
        performance: 90,
        totalProcessed: 61,
        successRate: 85.2,
      },
      activity: {
        today: 4,
        thisWeek: 15,
        thisMonth: 52,
        lastAction: new Date(Date.now() - 900000).toISOString(),
      },
      workload: {
        current: 6,
        capacity: 18,
        utilizationRate: 33,
      },
      specializations: ['Avenants', 'Contrats'],
      status: 'active',
      createdAt: new Date('2023-02-01').toISOString(),
    },
    {
      id: 'val-5',
      name: 'Ibrahima FALL',
      email: 'ifall@example.com',
      bureau: 'DAG',
      role: 'Validateur',
      avatar: null,
      stats: {
        validated: 28,
        rejected: 6,
        pending: 10,
        avgTime: '2.7h',
        performance: 85,
        totalProcessed: 34,
        successRate: 82.4,
      },
      activity: {
        today: 1,
        thisWeek: 8,
        thisMonth: 28,
        lastAction: new Date(Date.now() - 14400000).toISOString(),
      },
      workload: {
        current: 10,
        capacity: 15,
        utilizationRate: 67,
      },
      specializations: ['Bons de commande'],
      status: 'active',
      createdAt: new Date('2023-09-15').toISOString(),
    },
    {
      id: 'val-6',
      name: 'Aïssatou BA',
      email: 'aba@example.com',
      bureau: 'DRHC',
      role: 'Validateur',
      avatar: null,
      stats: {
        validated: 35,
        rejected: 4,
        pending: 7,
        avgTime: '2.0h',
        performance: 93,
        totalProcessed: 39,
        successRate: 89.7,
      },
      activity: {
        today: 3,
        thisWeek: 11,
        thisMonth: 35,
        lastAction: new Date(Date.now() - 5400000).toISOString(),
      },
      workload: {
        current: 7,
        capacity: 15,
        utilizationRate: 47,
      },
      specializations: ['Factures', 'Avenants'],
      status: 'active',
      createdAt: new Date('2023-07-01').toISOString(),
    },
  ];

  return validators;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtres
    const bureau = searchParams.get('bureau');
    const status = searchParams.get('status') || 'active';
    const sortBy = searchParams.get('sortBy') || 'performance'; // performance | validated | pending | avgTime
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let validators = generateValidators();

    // Appliquer les filtres
    if (bureau && bureau !== 'all') {
      validators = validators.filter((v) => v.bureau === bureau);
    }

    if (status && status !== 'all') {
      validators = validators.filter((v) => v.status === status);
    }

    // Tri
    validators.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'performance':
          aValue = a.stats.performance;
          bValue = b.stats.performance;
          break;
        case 'validated':
          aValue = a.stats.validated;
          bValue = b.stats.validated;
          break;
        case 'pending':
          aValue = a.stats.pending;
          bValue = b.stats.pending;
          break;
        case 'avgTime':
          aValue = parseFloat(a.stats.avgTime);
          bValue = parseFloat(b.stats.avgTime);
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          aValue = a.stats.performance;
          bValue = b.stats.performance;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Statistiques globales
    const globalStats = {
      totalValidators: validators.length,
      activeValidators: validators.filter((v) => v.status === 'active').length,
      totalValidated: validators.reduce((sum, v) => sum + v.stats.validated, 0),
      totalPending: validators.reduce((sum, v) => sum + v.stats.pending, 0),
      avgPerformance: Math.round(
        validators.reduce((sum, v) => sum + v.stats.performance, 0) / validators.length
      ),
      avgWorkload: Math.round(
        validators.reduce((sum, v) => sum + v.workload.utilizationRate, 0) / validators.length
      ),
    };

    console.log(`[validation-bc/validators] Loaded ${validators.length} validators`, {
      bureau,
      status,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      validators,
      globalStats,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[validation-bc/validators] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load validators' },
      { status: 500 }
    );
  }
}

