export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bmo/blocked/bureaux
 * Statistiques par bureau
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const where: any = {
      status: { in: ['pending', 'escalated'] }, // Dossiers actifs uniquement
    };
    
    // Grouper par bureau
    const bureauStats = await prisma.blockedDossier.groupBy({
      by: ['bureauCode'],
      where,
      _count: {
        id: true,
      },
      _avg: {
        delay: true,
        priority: true,
      },
      _sum: {
        amount: true,
      },
      _max: {
        delay: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });
    
    // Pour chaque bureau, récupérer les détails par impact
    const enrichedStats = await Promise.all(
      bureauStats.map(async (bureau) => {
        const [critical, high, medium, low, slaBreached, resolved24h] = await Promise.all([
          prisma.blockedDossier.count({
            where: { ...where, bureauCode: bureau.bureauCode, impact: 'critical' },
          }),
          prisma.blockedDossier.count({
            where: { ...where, bureauCode: bureau.bureauCode, impact: 'high' },
          }),
          prisma.blockedDossier.count({
            where: { ...where, bureauCode: bureau.bureauCode, impact: 'medium' },
          }),
          prisma.blockedDossier.count({
            where: { ...where, bureauCode: bureau.bureauCode, impact: 'low' },
          }),
          prisma.blockedDossier.count({
            where: { bureauCode: bureau.bureauCode, slaBreached: 1 },
          }),
          prisma.blockedDossier.count({
            where: {
              bureauCode: bureau.bureauCode,
              status: 'resolved',
              resolvedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
          }),
        ]);
        
        // Top 5 dossiers par priorité pour ce bureau
        const topDossiers = await prisma.blockedDossier.findMany({
          where: { ...where, bureauCode: bureau.bureauCode },
          orderBy: { priority: 'desc' },
          take: 5,
          select: {
            id: true,
            refNumber: true,
            subject: true,
            impact: true,
            priority: true,
            delay: true,
          },
        });
        
        // Calculer le score du bureau (inverse de la performance)
        // Score = (critical * 4 + high * 3 + medium * 2 + low * 1) / total
        // Plus le score est élevé, plus le bureau a des blocages graves
        const totalCount = bureau._count.id;
        const weightedScore =
          totalCount > 0
            ? ((critical * 4 + high * 3 + medium * 2 + low * 1) / totalCount) * 100
            : 0;
        
        // Performance = 100 - score (pour que 100 = excellent, 0 = critique)
        const performance = Math.max(0, Math.round(100 - weightedScore));
        
        return {
          bureauCode: bureau.bureauCode,
          totalCount: totalCount,
          critical,
          high,
          medium,
          low,
          avgDelay: Math.round(bureau._avg.delay || 0),
          maxDelay: bureau._max.delay || 0,
          avgPriority: Math.round((bureau._avg.priority || 0) * 100) / 100,
          totalAmount: bureau._sum.amount || 0,
          slaBreached,
          resolved24h,
          performance, // Score de 0 (critique) à 100 (excellent)
          topDossiers,
        };
      })
    );
    
    // Trier par performance (les bureaux en difficulté en premier)
    enrichedStats.sort((a, b) => a.performance - b.performance);
    
    // Statistiques globales
    const totalBlocked = enrichedStats.reduce((sum, b) => sum + b.totalCount, 0);
    const avgPerformance =
      enrichedStats.length > 0
        ? Math.round(enrichedStats.reduce((sum, b) => sum + b.performance, 0) / enrichedStats.length)
        : 0;
    
    return NextResponse.json({
      bureaux: enrichedStats,
      summary: {
        totalBureaux: enrichedStats.length,
        totalBlocked,
        avgPerformance,
        worstBureau: enrichedStats[0]?.bureauCode || null,
        bestBureau: enrichedStats[enrichedStats.length - 1]?.bureauCode || null,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error fetching bureaux stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bureaux stats', details: String(error) },
      { status: 500 }
    );
  }
}

