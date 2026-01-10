import { NextRequest, NextResponse } from 'next/server';
import { arbitragesVivants, arbitrages, bureauxGovernance } from '@/lib/data';

/**
 * GET /api/arbitrages
 * ===================
 * Liste paginée et filtrée des arbitrages
 * 
 * Query params:
 * - queue: 'all' | 'ouverts' | 'critiques' | 'urgents' | 'tranches' | 'pending' | 'resolved'
 * - type: 'arbitrages' | 'bureaux' | 'all'
 * - limit: nombre max de résultats (défaut: 50)
 * - offset: pagination (défaut: 0)
 * - search: recherche textuelle
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queue = searchParams.get('queue') || 'all';
    const type = searchParams.get('type') || 'arbitrages';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || '';

    if (type === 'bureaux') {
      // Retourner les bureaux
      let bureaux = [...bureauxGovernance];

      // Filtrage
      if (queue === 'surcharge') {
        bureaux = bureaux.filter((b: any) => b.charge > 85);
      } else if (queue === 'goulots') {
        bureaux = bureaux.filter((b: any) => (b.goulots?.length || 0) > 0);
      }

      // Recherche
      if (search) {
        const q = search.toLowerCase();
        bureaux = bureaux.filter((b: any) => 
          b.code?.toLowerCase().includes(q) ||
          b.name?.toLowerCase().includes(q) ||
          b.head?.toLowerCase().includes(q)
        );
      }

      // Tri: surcharge d'abord
      bureaux.sort((a: any, b: any) => {
        const ao = a.charge > 85 ? 0 : 1;
        const bo = b.charge > 85 ? 0 : 1;
        if (ao !== bo) return ao - bo;
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
    }

    // Type = arbitrages
    const vivants = arbitragesVivants.map((a: any) => ({ ...a, _type: 'vivant' }));
    const simples = arbitrages.map((a: any) => ({ ...a, _type: 'simple' }));
    let allArbitrages = [...vivants, ...simples];

    // Filtrage par queue
    if (queue === 'ouverts') {
      allArbitrages = allArbitrages.filter((a: any) => 
        a._type === 'vivant' && ['ouvert', 'en_deliberation', 'decision_requise'].includes(a.status)
      );
    } else if (queue === 'critiques') {
      allArbitrages = allArbitrages.filter((a: any) => 
        a._type === 'vivant' && 
        (a.context?.riskLevel === 'critique' || a.context?.riskLevel === 'eleve')
      );
    } else if (queue === 'urgents') {
      allArbitrages = allArbitrages.filter((a: any) => {
        if (a._type !== 'simple' || a.status !== 'pending') return false;
        if (!a.deadline) return false;
        
        const parts = a.deadline.split('/');
        if (parts.length !== 3) return false;
        const [dd, mm, yyyy] = parts.map((x: string) => Number(x));
        const date = new Date(`${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`);
        const in3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        return date <= in3;
      });
    } else if (queue === 'tranches') {
      allArbitrages = allArbitrages.filter((a: any) => a.status === 'tranche');
    } else if (queue === 'pending') {
      allArbitrages = allArbitrages.filter((a: any) => 
        (a._type === 'simple' && a.status === 'pending') ||
        (a._type === 'vivant' && ['ouvert', 'en_deliberation', 'decision_requise'].includes(a.status))
      );
    } else if (queue === 'resolved') {
      allArbitrages = allArbitrages.filter((a: any) => 
        (a._type === 'simple' && a.status === 'resolved') ||
        (a._type === 'vivant' && a.status === 'tranche')
      );
    }

    // Recherche
    if (search) {
      const q = search.toLowerCase();
      allArbitrages = allArbitrages.filter((a: any) => 
        a.id?.toLowerCase().includes(q) ||
        a.subject?.toLowerCase().includes(q) ||
        a.status?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q)
      );
    }

    // Tri
    allArbitrages.sort((a: any, b: any) => {
      // Critiques d'abord
      const aCritical = a._type === 'vivant' && (a.context?.riskLevel === 'critique');
      const bCritical = b._type === 'vivant' && (b.context?.riskLevel === 'critique');
      if (aCritical !== bCritical) return aCritical ? -1 : 1;

      // Puis par date/urgence
      if (a._type === 'vivant' && b._type === 'vivant') {
        return (a.timing?.daysRemaining || 999) - (b.timing?.daysRemaining || 999);
      }

      return 0;
    });

    const total = allArbitrages.length;
    const items = allArbitrages.slice(offset, offset + limit);

    return NextResponse.json({
      items,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching arbitrages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arbitrages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/arbitrages
 * ====================
 * Créer un nouvel arbitrage
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Validation et création réelle
    // Pour l'instant, on retourne un mock
    
    const newArbitrage = {
      id: `ARB-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      status: 'ouvert',
    };

    return NextResponse.json(newArbitrage, { status: 201 });
  } catch (error) {
    console.error('Error creating arbitrage:', error);
    return NextResponse.json(
      { error: 'Failed to create arbitrage' },
      { status: 500 }
    );
  }
}

