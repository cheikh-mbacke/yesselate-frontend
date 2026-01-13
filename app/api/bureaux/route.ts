import { NextRequest, NextResponse } from 'next/server';
import { bureauxGovernance } from '@/lib/data';

/**
 * GET /api/bureaux
 * ================
 * Liste de tous les bureaux avec leurs métriques
 * 
 * Query params:
 * - surcharge: 'true' pour filtrer uniquement les bureaux en surcharge (>85%)
 * - goulots: 'true' pour filtrer uniquement ceux avec des goulots
 * - limit: nombre max de résultats
 * - offset: pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surchargeOnly = searchParams.get('surcharge') === 'true';
    const goulotsOnly = searchParams.get('goulots') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let bureaux = [...bureauxGovernance];

    // Filtres
    if (surchargeOnly) {
      bureaux = bureaux.filter((b: any) => b.charge > 85);
    }

    if (goulotsOnly) {
      bureaux = bureaux.filter((b: any) => (b.goulots?.length || 0) > 0);
    }

    // Tri: surcharge puis charge décroissante
    bureaux.sort((a: any, b: any) => {
      const aSurcharge = a.charge > 85 ? 0 : 1;
      const bSurcharge = b.charge > 85 ? 0 : 1;
      if (aSurcharge !== bSurcharge) return aSurcharge - bSurcharge;
      return b.charge - a.charge;
    });

    const total = bureaux.length;
    const items = bureaux.slice(offset, offset + limit);

    return NextResponse.json({
      items,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching bureaux:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bureaux' },
      { status: 500 }
    );
  }
}
