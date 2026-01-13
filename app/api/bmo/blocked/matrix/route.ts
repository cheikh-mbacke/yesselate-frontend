export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bmo/blocked/matrix
 * Matrice impact x délai pour visualisation heatmap
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bureau = searchParams.get('bureau');
    
    const where: any = {
      status: { in: ['pending', 'escalated'] }, // Dossiers actifs uniquement
    };
    
    if (bureau) {
      where.bureauCode = bureau;
    }
    
    // Récupérer tous les dossiers actifs
    const dossiers = await prisma.blockedDossier.findMany({
      where,
      select: {
        id: true,
        refNumber: true,
        subject: true,
        impact: true,
        delay: true,
        priority: true,
        amount: true,
        bureauCode: true,
      },
    });
    
    // Définir les buckets pour la matrice
    const impactLevels = ['critical', 'high', 'medium', 'low'];
    const delayBuckets = [
      { label: '0-3j', min: 0, max: 3 },
      { label: '4-7j', min: 4, max: 7 },
      { label: '8-14j', min: 8, max: 14 },
      { label: '15-30j', min: 15, max: 30 },
      { label: '>30j', min: 31, max: 9999 },
    ];
    
    // Construire la matrice
    const matrix: any[] = [];
    
    for (const impactLevel of impactLevels) {
      for (const delayBucket of delayBuckets) {
        const cellDossiers = dossiers.filter(
          d =>
            d.impact === impactLevel &&
            (d.delay || 0) >= delayBucket.min &&
            (d.delay || 0) <= delayBucket.max
        );
        
        const count = cellDossiers.length;
        const totalAmount = cellDossiers.reduce((sum, d) => sum + (d.amount || 0), 0);
        const avgPriority =
          count > 0
            ? cellDossiers.reduce((sum, d) => sum + d.priority, 0) / count
            : 0;
        
        matrix.push({
          impact: impactLevel,
          delayRange: delayBucket.label,
          delayMin: delayBucket.min,
          delayMax: delayBucket.max,
          count,
          totalAmount,
          avgPriority: Math.round(avgPriority * 100) / 100,
          dossiers: cellDossiers.slice(0, 10), // Top 10 par priorité
        });
      }
    }
    
    // Statistiques globales
    const totalCount = dossiers.length;
    const criticalCount = dossiers.filter(d => d.impact === 'critical').length;
    const urgentCount = dossiers.filter(d => (d.delay || 0) > 14).length;
    
    return NextResponse.json({
      matrix,
      summary: {
        totalCount,
        criticalCount,
        urgentCount,
        criticalPercentage: totalCount > 0 ? Math.round((criticalCount / totalCount) * 100) : 0,
        urgentPercentage: totalCount > 0 ? Math.round((urgentCount / totalCount) * 100) : 0,
      },
      impactLevels,
      delayBuckets,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error fetching blocked matrix:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked matrix', details: String(error) },
      { status: 500 }
    );
  }
}

