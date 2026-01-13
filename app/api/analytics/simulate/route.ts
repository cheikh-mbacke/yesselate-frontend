import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/analytics/simulate
 * Exécute une simulation avec les paramètres fournis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parameters, context } = body;

    if (!parameters || !Array.isArray(parameters)) {
      return NextResponse.json(
        { error: 'Parameters array is required' },
        { status: 400 }
      );
    }

    // Transformer les paramètres en objet
    const paramsMap: Record<string, number> = {};
    parameters.forEach((param: { id: string; value: number }) => {
      paramsMap[param.id] = param.value;
    });

    // Simulation basique (à remplacer par des calculs métier réels)
    const results: Record<string, number> = {};
    
    // Logique de simulation selon le contexte
    if (context?.type === 'budget') {
      // Simulation budgétaire
      const budget = paramsMap.budget || 0;
      const delai = paramsMap.delai || 0;
      
      results.coutTotal = budget * (1 + (delai / 365) * 0.1); // 10% d'augmentation par année
      results.marge = budget * 0.15; // 15% de marge par défaut
      results.depenses = budget - results.marge;
    } else if (context?.type === 'delai') {
      // Simulation de délai
      const delai = paramsMap.delai || 0;
      const budget = paramsMap.budget || 0;
      
      results.delaiEstime = delai;
      results.coutSupplementaire = budget * (delai / 30) * 0.05; // 5% par mois
      results.impactBudget = results.coutSupplementaire;
    } else {
      // Simulation générique
      parameters.forEach((param: { id: string; value: number }) => {
        // Calcul simple avec variation de ±10%
        results[param.id] = param.value * (1 + (Math.random() * 0.2 - 0.1));
      });
    }

    return NextResponse.json({
      results,
      parameters: paramsMap,
      context,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error executing simulation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

