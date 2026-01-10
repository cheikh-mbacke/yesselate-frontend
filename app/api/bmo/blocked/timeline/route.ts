export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bmo/blocked/timeline
 * Timeline des événements des dossiers bloqués
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // day, week, month, year
    const bureau = searchParams.get('bureau');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // Calculer la date de début selon la période
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    const where: any = {
      createdAt: { gte: startDate },
    };
    
    if (bureau) {
      where.dossierId = {
        in: (
          await prisma.blockedDossier.findMany({
            where: { bureauCode: bureau },
            select: { id: true },
          })
        ).map(d => d.id),
      };
    }
    
    // Récupérer les événements d'audit
    const auditLogs = await prisma.blockedAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        dossier: {
          select: {
            refNumber: true,
            subject: true,
            impact: true,
            bureauCode: true,
            status: true,
          },
        },
      },
    });
    
    // Grouper par jour pour les statistiques de tendance
    const dailyStats: Record<string, any> = {};
    
    auditLogs.forEach(log => {
      const dateKey = log.createdAt.toISOString().split('T')[0];
      
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          created: 0,
          resolved: 0,
          escalated: 0,
          commented: 0,
          updated: 0,
          total: 0,
        };
      }
      
      dailyStats[dateKey].total++;
      
      switch (log.action) {
        case 'created':
          dailyStats[dateKey].created++;
          break;
        case 'resolved':
          dailyStats[dateKey].resolved++;
          break;
        case 'escalated':
          dailyStats[dateKey].escalated++;
          break;
        case 'commented':
          dailyStats[dateKey].commented++;
          break;
        case 'updated':
          dailyStats[dateKey].updated++;
          break;
      }
    });
    
    // Convertir en array et trier par date
    const trends = Object.values(dailyStats).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );
    
    // Statistiques de période
    const createdCount = auditLogs.filter(l => l.action === 'created').length;
    const resolvedCount = auditLogs.filter(l => l.action === 'resolved').length;
    const escalatedCount = auditLogs.filter(l => l.action === 'escalated').length;
    const resolutionRate =
      createdCount > 0 ? Math.round((resolvedCount / createdCount) * 100) : 0;
    
    return NextResponse.json({
      events: auditLogs.map(log => ({
        id: log.id,
        action: log.action,
        actorId: log.actorId,
        actorName: log.actorName,
        actorRole: log.actorRole,
        summary: log.summary,
        details: log.details,
        createdAt: log.createdAt,
        dossier: log.dossier,
      })),
      trends,
      summary: {
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        totalEvents: auditLogs.length,
        created: createdCount,
        resolved: resolvedCount,
        escalated: escalatedCount,
        resolutionRate,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error fetching blocked timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked timeline', details: String(error) },
      { status: 500 }
    );
  }
}

