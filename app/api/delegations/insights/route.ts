import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/delegations/insights
 * 
 * Fournit des insights "décision assistée" pour le tableau de bord direction:
 * - Délégations à traiter en priorité
 * - Risques identifiés
 * - Recommandations d'actions
 * - Timeline d'activité
 */

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // ============================================
    // 1. DÉLÉGATIONS À TRAITER EN PRIORITÉ
    // ============================================
    
    // Expirant dans les 7 jours
    const expiringSoon = await prisma.delegation.findMany({
      where: {
        status: 'active',
        endsAt: {
          lte: sevenDaysLater,
          gte: now,
        },
      },
      orderBy: { endsAt: 'asc' },
      take: 10,
      select: {
        id: true,
        code: true,
        title: true,
        type: true,
        delegateName: true,
        bureau: true,
        endsAt: true,
        maxAmount: true,
      },
    });

    // Délégations sans contrôleur assigné
    const withoutController = await prisma.delegation.findMany({
      where: {
        status: 'active',
        actors: {
          none: {
            roleType: { in: ['controller', 'auditor'] },
          },
        },
      },
      take: 10,
      select: {
        id: true,
        code: true,
        title: true,
        delegateName: true,
        bureau: true,
      },
    });

    // Délégations suspendues (à réactiver ou révoquer?)
    const suspended = await prisma.delegation.findMany({
      where: { status: 'suspended' },
      orderBy: { suspendedAt: 'asc' },
      take: 5,
      select: {
        id: true,
        code: true,
        title: true,
        delegateName: true,
        suspendedAt: true,
        suspendedReason: true,
        expectedReactivation: true,
      },
    });

    // ============================================
    // 2. ANALYSE DES RISQUES
    // ============================================

    // Usages récents avec montants élevés
    const highValueUsages = await prisma.delegationUsage.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        amount: { gte: 10000000 }, // 10M XOF
      },
      orderBy: { amount: 'desc' },
      take: 10,
      include: {
        delegation: {
          select: {
            id: true,
            code: true,
            title: true,
            delegateName: true,
            maxAmount: true,
          },
        },
      },
    });

    // Compter les usages par délégation (détecter fréquence élevée)
    const usageFrequency = await prisma.delegationUsage.groupBy({
      by: ['delegationId'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Charger les détails des délégations avec haute fréquence
    const highFrequencyDelegations = await prisma.delegation.findMany({
      where: {
        id: { in: usageFrequency.filter(u => u._count.id >= 5).map(u => u.delegationId) },
      },
      select: {
        id: true,
        code: true,
        title: true,
        delegateName: true,
      },
    });

    // ============================================
    // 3. ANOMALIES DÉTECTÉES
    // ============================================

    // Usages hors horaires (simulé - à implémenter avec vraies données)
    const unusualHoursUsages = await prisma.delegationUsage.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        // En production: filtrer par heure de création
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        delegationId: true,
        usedByName: true,
        amount: true,
        createdAt: true,
      },
    });

    // Événements de type refus ou anomalie
    const deniedEvents = await prisma.delegationEvent.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        eventType: { in: ['DENIED', 'ANOMALY', 'THRESHOLD_EXCEEDED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        delegation: {
          select: { id: true, code: true, title: true },
        },
      },
    });

    // ============================================
    // 4. RECOMMANDATIONS
    // ============================================

    const recommendations: Array<{
      priority: 'critical' | 'high' | 'medium' | 'low';
      type: string;
      title: string;
      description: string;
      action: string;
      delegationId?: string;
    }> = [];

    // Recommandations basées sur les données
    expiringSoon.forEach(d => {
      const daysLeft = Math.ceil((new Date(d.endsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      recommendations.push({
        priority: daysLeft <= 3 ? 'critical' : 'high',
        type: 'expiring',
        title: `Délégation ${d.code} expire dans ${daysLeft}j`,
        description: `${d.title} (${d.delegateName}, ${d.bureau})`,
        action: 'Prolonger ou remplacer avant expiration',
        delegationId: d.id,
      });
    });

    withoutController.forEach(d => {
      recommendations.push({
        priority: 'medium',
        type: 'no_controller',
        title: `Délégation ${d.code} sans contrôleur`,
        description: `${d.title} (${d.delegateName})`,
        action: 'Assigner un contrôleur pour la conformité',
        delegationId: d.id,
      });
    });

    suspended.forEach(d => {
      const daysSuspended = d.suspendedAt 
        ? Math.ceil((now.getTime() - new Date(d.suspendedAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      if (daysSuspended > 30) {
        recommendations.push({
          priority: 'medium',
          type: 'suspended_long',
          title: `Délégation ${d.code} suspendue depuis ${daysSuspended}j`,
          description: d.suspendedReason || 'Raison non spécifiée',
          action: 'Décider: réactiver ou révoquer',
          delegationId: d.id,
        });
      }
    });

    // ============================================
    // 5. TIMELINE D'ACTIVITÉ
    // ============================================

    const recentEvents = await prisma.delegationEvent.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        delegation: {
          select: { id: true, code: true, title: true },
        },
      },
    });

    // ============================================
    // 6. KPIs DE SANTÉ
    // ============================================

    const [
      totalActive,
      totalExpired,
      totalRevoked,
      totalSuspended,
      totalUsagesThisMonth,
      totalAmountThisMonth,
    ] = await Promise.all([
      prisma.delegation.count({ where: { status: 'active' } }),
      prisma.delegation.count({ where: { status: 'expired' } }),
      prisma.delegation.count({ where: { status: 'revoked' } }),
      prisma.delegation.count({ where: { status: 'suspended' } }),
      prisma.delegationUsage.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.delegationUsage.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo } },
        _sum: { amount: true },
      }),
    ]);

    // Score de santé (0-100)
    const healthScore = calculateHealthScore({
      expiringSoonCount: expiringSoon.length,
      withoutControllerCount: withoutController.length,
      suspendedCount: totalSuspended,
      revokedCount: totalRevoked,
      activeCount: totalActive,
      deniedEventsCount: deniedEvents.length,
    });

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json({
      // À décider
      toDecide: {
        expiringSoon: expiringSoon.map(d => ({
          ...d,
          daysLeft: Math.ceil((new Date(d.endsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        })),
        withoutController,
        suspended,
      },

      // Risques
      risks: {
        highValueUsages: highValueUsages.map(u => ({
          id: u.id,
          delegationId: u.delegationId,
          delegationCode: u.delegation.code,
          delegationTitle: u.delegation.title,
          amount: u.amount,
          maxAmount: u.delegation.maxAmount,
          usagePercentage: u.delegation.maxAmount 
            ? Math.round((u.amount / u.delegation.maxAmount) * 100) 
            : null,
          createdAt: u.createdAt,
        })),
        highFrequency: highFrequencyDelegations.map(d => {
          const freq = usageFrequency.find(u => u.delegationId === d.id);
          return {
            ...d,
            usageCount: freq?._count.id || 0,
          };
        }),
        deniedEvents: deniedEvents.map(e => ({
          id: e.id,
          delegationId: e.delegationId,
          delegationCode: e.delegation.code,
          eventType: e.eventType,
          summary: e.summary,
          createdAt: e.createdAt,
        })),
      },

      // Recommandations
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),

      // Timeline
      timeline: recentEvents.map(e => ({
        id: e.id,
        delegationId: e.delegationId,
        delegationCode: e.delegation.code,
        delegationTitle: e.delegation.title,
        eventType: e.eventType,
        summary: e.summary,
        actorName: e.actorName,
        createdAt: e.createdAt,
      })),

      // KPIs
      kpis: {
        healthScore,
        active: totalActive,
        expired: totalExpired,
        revoked: totalRevoked,
        suspended: totalSuspended,
        usagesThisMonth: totalUsagesThisMonth,
        amountThisMonth: totalAmountThisMonth._sum.amount || 0,
      },

      ts: now.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching delegation insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

// ============================================
// HELPERS
// ============================================

function calculateHealthScore(params: {
  expiringSoonCount: number;
  withoutControllerCount: number;
  suspendedCount: number;
  revokedCount: number;
  activeCount: number;
  deniedEventsCount: number;
}): number {
  const {
    expiringSoonCount,
    withoutControllerCount,
    suspendedCount,
    revokedCount,
    activeCount,
    deniedEventsCount,
  } = params;

  let score = 100;

  // Pénalités
  score -= expiringSoonCount * 3; // -3 points par délégation expirant bientôt
  score -= withoutControllerCount * 2; // -2 points par délégation sans contrôleur
  score -= suspendedCount * 1; // -1 point par délégation suspendue
  score -= deniedEventsCount * 2; // -2 points par événement refusé

  // Bonus
  if (activeCount > 0 && expiringSoonCount === 0) score += 5;
  if (withoutControllerCount === 0) score += 5;

  // Limiter entre 0 et 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

