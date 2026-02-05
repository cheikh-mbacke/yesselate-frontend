/**
 * GET /api/dashboard/bureaux
 * Stats détaillées par bureau pour le Dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { bureaux, blockedDossiers } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'score'; // 'score' | 'charge' | 'blocages'
    const order = searchParams.get('order') || 'desc'; // 'asc' | 'desc'

    // Enrichir les données bureaux avec stats détaillées
    const enrichedBureaux = bureaux.map((bureau) => {
      const blocages = blockedDossiers.filter((d) => d.bureau === bureau.code);
      const blocagesCritiques = blocages.filter((d) => d.delay >= 5);

      // Calcul du score de performance (0-100)
      const score = Math.round(
        (bureau.completion * 0.6) + // 60% basé sur completion
        ((100 - (blocages.length * 5)) * 0.3) + // 30% basé sur absence de blocages
        (0) // 10% bonus si charge raisonnable (charge non disponible)
      );

      // Tendance simulée (basée sur score vs completion)
      const trend = 
        bureau.completion > 85 ? 'up' :
        bureau.completion < 60 ? 'down' :
        'stable';

      return {
        code: bureau.code,
        name: bureau.name || bureau.code,
        score: Math.min(100, Math.max(0, score)),
        charge: 0, // charge non disponible
        completion: bureau.completion,
        blocages: blocages.length,
        blocagesCritiques: blocagesCritiques.length,
        trend,
        validations: Math.floor(Math.random() * 50) + 20, // Simulation
        rejets: Math.floor(Math.random() * 10), // Simulation
        delaiMoyen: Math.round((Math.random() * 3 + 1) * 10) / 10, // 1-4 jours
        budgetTraite: Math.floor(Math.random() * 500) + 100, // Millions FCFA
        equipe: Math.floor(Math.random() * 15) + 5, // Nombre d'agents
        projetsActifs: Math.floor(Math.random() * 8) + 2,
        satisfaction: Math.floor(Math.random() * 30) + 70, // 70-100%
      };
    });

    // Tri
    const sortFunctions = {
      score: (a: typeof enrichedBureaux[0], b: typeof enrichedBureaux[0]) => b.score - a.score,
      charge: (a: typeof enrichedBureaux[0], b: typeof enrichedBureaux[0]) => b.charge - a.charge,
      blocages: (a: typeof enrichedBureaux[0], b: typeof enrichedBureaux[0]) => b.blocages - a.blocages,
    };

    const sortFn = sortFunctions[sortBy as keyof typeof sortFunctions] || sortFunctions.score;
    enrichedBureaux.sort(sortFn);
    
    if (order === 'asc') {
      enrichedBureaux.reverse();
    }

    // Stats agrégées
    const stats = {
      total: enrichedBureaux.length,
      performanceExcellente: enrichedBureaux.filter((b) => b.score >= 90).length,
      performanceBonne: enrichedBureaux.filter((b) => b.score >= 75 && b.score < 90).length,
      performanceFaible: enrichedBureaux.filter((b) => b.score < 75).length,
      enSurcharge: enrichedBureaux.filter((b) => b.charge > 85).length,
      avecBlocages: enrichedBureaux.filter((b) => b.blocages > 0).length,
      scoreMoyen: Math.round(enrichedBureaux.reduce((acc, b) => acc + b.score, 0) / enrichedBureaux.length),
      chargeMoyenne: Math.round(enrichedBureaux.reduce((acc, b) => acc + b.charge, 0) / enrichedBureaux.length),
    };

    return NextResponse.json({
      bureaux: enrichedBureaux,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching dashboard bureaux:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard bureaux' },
      { status: 500 }
    );
  }
}

