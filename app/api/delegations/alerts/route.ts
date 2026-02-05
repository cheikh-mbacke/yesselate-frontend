/**
 * API Alertes délégations
 * =======================
 * 
 * GET /api/delegations/alerts
 * 
 * Retourne les alertes actives concernant les délégations :
 * - Expirations imminentes
 * - Contrôles en attente
 * - Anomalies détectées
 * - Dépassements de seuils
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL';
type AlertType = 
  | 'EXPIRING_SOON' 
  | 'EXPIRED' 
  | 'PENDING_CONTROL' 
  | 'THRESHOLD_WARNING' 
  | 'THRESHOLD_EXCEEDED'
  | 'NO_CONTROLLER'
  | 'ANOMALY'
  | 'SUSPENDED';

interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  delegationId: string;
  delegationTitle: string;
  bureau: string;
  message: string;
  actionLabel: string;
  actionUrl?: string;
  createdAt: Date;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const bureauFilter = url.searchParams.get('bureau');
    
    const now = new Date();
    const alerts: Alert[] = [];

    // ========================================
    // DÉLÉGATIONS EXPIRANT BIENTÔT (< 14 jours)
    // ========================================
    const expiringSoon = await prisma.delegation.findMany({
      where: {
        status: 'active',
        endsAt: {
          gt: now,
          lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        },
        ...(bureauFilter ? { bureau: bureauFilter } : {}),
      },
      orderBy: { endsAt: 'asc' },
      take: 10,
    });

    for (const d of expiringSoon) {
      const daysLeft = Math.ceil((d.endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `expiring:${d.id}`,
        type: 'EXPIRING_SOON',
        level: daysLeft <= 3 ? 'CRITICAL' : 'WARNING',
        delegationId: d.id,
        delegationTitle: d.title,
        bureau: d.bureau,
        message: `Expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`,
        actionLabel: 'Voir',
        createdAt: now,
      });
    }

    // ========================================
    // DÉLÉGATIONS EXPIRÉES RÉCEMMENT (< 7 jours)
    // ========================================
    const recentlyExpired = await prisma.delegation.findMany({
      where: {
        status: 'expired',
        endsAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        ...(bureauFilter ? { bureau: bureauFilter } : {}),
      },
      take: 5,
    });

    for (const d of recentlyExpired) {
      alerts.push({
        id: `expired:${d.id}`,
        type: 'EXPIRED',
        level: 'WARNING',
        delegationId: d.id,
        delegationTitle: d.title,
        bureau: d.bureau,
        message: 'Délégation expirée - action requise',
        actionLabel: 'Prolonger ou remplacer',
        createdAt: d.endsAt,
      });
    }

    // ========================================
    // CONTRÔLES EN ATTENTE
    // ========================================
    const pendingControls = await prisma.delegationUsage.findMany({
      where: {
        status: 'PENDING_CONTROL',
        ...(bureauFilter ? { bureau: bureauFilter } : {}),
      },
      include: {
        delegation: {
          select: { id: true, title: true, bureau: true },
        },
      },
      take: 10,
    });

    for (const u of pendingControls) {
      const ageHours = Math.round((now.getTime() - u.createdAt.getTime()) / (1000 * 60 * 60));
      alerts.push({
        id: `pending:${u.id}`,
        type: 'PENDING_CONTROL',
        level: ageHours > 24 ? 'CRITICAL' : 'WARNING',
        delegationId: u.delegation.id,
        delegationTitle: u.delegation.title,
        bureau: u.delegation.bureau,
        message: `Contrôle en attente depuis ${ageHours}h - ${u.documentRef}`,
        actionLabel: 'Valider',
        createdAt: u.createdAt,
      });
    }

    // ========================================
    // SEUILS PROCHES (> 80% utilisé)
    // ========================================
    const thresholdWarnings = await prisma.delegation.findMany({
      where: {
        status: 'active',
        maxTotalAmount: { gt: 0 },
        ...(bureauFilter ? { bureau: bureauFilter } : {}),
      },
      select: {
        id: true,
        title: true,
        bureau: true,
        maxTotalAmount: true,
        usageTotalAmount: true,
      },
    });

    for (const d of thresholdWarnings) {
      if (!d.maxTotalAmount) continue;
      const usage = d.usageTotalAmount / d.maxTotalAmount;
      
      if (usage >= 0.95) {
        alerts.push({
          id: `threshold:${d.id}`,
          type: 'THRESHOLD_EXCEEDED',
          level: 'CRITICAL',
          delegationId: d.id,
          delegationTitle: d.title,
          bureau: d.bureau,
          message: `Plafond atteint (${Math.round(usage * 100)}%)`,
          actionLabel: 'Augmenter ou suspendre',
          createdAt: now,
        });
      } else if (usage >= 0.80) {
        alerts.push({
          id: `threshold:${d.id}`,
          type: 'THRESHOLD_WARNING',
          level: 'WARNING',
          delegationId: d.id,
          delegationTitle: d.title,
          bureau: d.bureau,
          message: `Plafond bientôt atteint (${Math.round(usage * 100)}%)`,
          actionLabel: 'Surveiller',
          createdAt: now,
        });
      }
    }

    // ========================================
    // DÉLÉGATIONS SUSPENDUES
    // ========================================
    const suspended = await prisma.delegation.findMany({
      where: {
        status: 'suspended',
        ...(bureauFilter ? { bureau: bureauFilter } : {}),
      },
      take: 5,
    });

    for (const d of suspended) {
      alerts.push({
        id: `suspended:${d.id}`,
        type: 'SUSPENDED',
        level: 'INFO',
        delegationId: d.id,
        delegationTitle: d.title,
        bureau: d.bureau,
        message: 'Délégation suspendue',
        actionLabel: 'Réactiver',
        createdAt: d.updatedAt,
      });
    }

    // ========================================
    // TRIER PAR NIVEAU ET DATE
    // ========================================
    const levelOrder: Record<AlertLevel, number> = {
      CRITICAL: 0,
      WARNING: 1,
      INFO: 2,
    };

    alerts.sort((a, b) => {
      const levelDiff = levelOrder[a.level] - levelOrder[b.level];
      if (levelDiff !== 0) return levelDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // ========================================
    // SUMMARY
    // ========================================
    const summary = {
      total: alerts.length,
      critical: alerts.filter(a => a.level === 'CRITICAL').length,
      warning: alerts.filter(a => a.level === 'WARNING').length,
      info: alerts.filter(a => a.level === 'INFO').length,
    };

    return NextResponse.json({
      alerts: alerts.slice(0, 20),
      summary,
      ts: now.toISOString(),
    });
  } catch (error) {
    console.error('[API] Erreur alertes délégations:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des alertes.' },
      { status: 500 }
    );
  }
}

