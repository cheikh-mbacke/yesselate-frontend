import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/projects/stats
 * ========================
 * Retourne les statistiques globales des projets
 * 
 * Headers optionnels:
 * - x-bmo-reason: 'manual' | 'auto' | 'init' (pour cache)
 * 
 * Query params optionnels:
 * - bureau: Filtrer par bureau
 * - status: Filtrer par statut
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bureau = searchParams.get('bureau');
    const status = searchParams.get('status');
    const reason = request.headers.get('x-bmo-reason') || 'manual';

    // Simuler délai réseau (plus court si auto-refresh)
    const delay = reason === 'auto' ? 200 : 400;
    await new Promise(resolve => setTimeout(resolve, delay));

    // TODO: Remplacer par appel BDD réel
    const stats = {
      total: 42,
      active: 28,
      completed: 10,
      blocked: 4,
      onHold: 0,
      
      // Budgets
      totalBudget: 15000000,
      budgetUsed: 8500000,
      budgetRemaining: 6500000,
      budgetUtilizationRate: 56.67,
      
      // Performance
      avgProgress: 65,
      onTrackProjects: 24,
      delayedProjects: 4,
      criticalProjects: 3,
      avgDelay: 8, // jours
      
      // Par bureau
      byBureau: [
        { 
          bureau: 'DAKAR', 
          count: 15, 
          budget: 5000000,
          active: 10,
          completed: 4,
          blocked: 1
        },
        { 
          bureau: 'THIES', 
          count: 12, 
          budget: 4000000,
          active: 8,
          completed: 3,
          blocked: 1
        },
        { 
          bureau: 'SAINT-LOUIS', 
          count: 10, 
          budget: 3500000,
          active: 7,
          completed: 2,
          blocked: 1
        },
        { 
          bureau: 'DIOURBEL', 
          count: 5, 
          budget: 2500000,
          active: 3,
          completed: 1,
          blocked: 1
        },
      ],
      
      // Par statut
      byStatus: [
        { status: 'En cours', count: 28, percentage: 66.67 },
        { status: 'Terminé', count: 10, percentage: 23.81 },
        { status: 'Bloqué', count: 4, percentage: 9.52 },
      ],
      
      // Par catégorie
      byCategory: [
        { category: 'Infrastructure', count: 18 },
        { category: 'Services', count: 12 },
        { category: 'Formation', count: 8 },
        { category: 'Équipement', count: 4 },
      ],
      
      // Tendances (30 derniers jours)
      trends: {
        newProjects: 5,
        completedProjects: 3,
        blockedIncrease: 1,
        budgetChange: +250000,
      },
      
      // Activité récente
      recentActivity: [
        {
          id: 'act-1',
          projectId: 'proj-123',
          projectName: 'Construction Lycée',
          action: 'updated',
          actorName: 'Amadou Diop',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15min ago
        },
        {
          id: 'act-2',
          projectId: 'proj-456',
          projectName: 'Réfection Route',
          action: 'blocked',
          actorName: 'Fatou Sall',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45min ago
        },
        {
          id: 'act-3',
          projectId: 'proj-789',
          projectName: 'Centre de Santé',
          action: 'completed',
          actorName: 'Moussa Kane',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
        },
      ],
      
      // Alertes
      alerts: {
        overBudget: 2,
        delayedTasks: 12,
        missingDocuments: 5,
        expiringSoon: 3,
      },
      
      // KPIs
      kpis: {
        timeToCompletion: 45, // jours moyen
        successRate: 85.7, // %
        budgetAccuracy: 92.3, // %
        stakeholderSatisfaction: 4.2, // /5
      },
      
      timestamp: new Date().toISOString(),
    };

    // Appliquer filtres si fournis
    let filteredStats = { ...stats };
    
    if (bureau) {
      const bureauData = stats.byBureau.find(b => b.bureau === bureau);
      if (bureauData) {
        filteredStats.total = bureauData.count;
        filteredStats.active = bureauData.active;
        filteredStats.completed = bureauData.completed;
        filteredStats.blocked = bureauData.blocked;
      }
    }

    if (status) {
      const statusData = stats.byStatus.find(s => 
        s.status.toLowerCase() === status.toLowerCase()
      );
      if (statusData) {
        filteredStats.total = statusData.count;
      }
    }

    return NextResponse.json(filteredStats, {
      headers: {
        'Cache-Control': reason === 'auto' 
          ? 'no-store, max-age=0'
          : 'no-store, max-age=60', // Cache 1min si manuel
      },
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project statistics' },
      { status: 500 }
    );
  }
}
