import { NextRequest, NextResponse } from 'next/server';
import { bureauxGovernance } from '@/lib/data';

/**
 * GET /api/bureaux/stats
 * ======================
 * Statistiques globales des bureaux
 */
export async function GET(request: NextRequest) {
  try {
    const totalBureaux = bureauxGovernance.length;
    const surcharge = bureauxGovernance.filter((b: any) => b.charge > 85).length;
    const chargeNormale = bureauxGovernance.filter((b: any) => b.charge >= 60 && b.charge <= 85).length;
    const sousCharge = bureauxGovernance.filter((b: any) => b.charge < 60).length;
    
    const totalGoulots = bureauxGovernance.reduce((acc: number, b: any) => acc + (b.goulots?.length || 0), 0);
    const bureauxAvecGoulots = bureauxGovernance.filter((b: any) => (b.goulots?.length || 0) > 0).length;

    const chargeMoyenne = Math.round(
      bureauxGovernance.reduce((acc: number, b: any) => acc + b.charge, 0) / totalBureaux
    );

    const completionMoyenne = Math.round(
      bureauxGovernance.reduce((acc: number, b: any) => acc + b.completion, 0) / totalBureaux
    );

    const stats = {
      totalBureaux,
      surcharge,
      chargeNormale,
      sousCharge,
      totalGoulots,
      bureauxAvecGoulots,
      chargeMoyenne,
      completionMoyenne,
      ts: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching bureaux stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bureaux statistics' },
      { status: 500 }
    );
  }
}
