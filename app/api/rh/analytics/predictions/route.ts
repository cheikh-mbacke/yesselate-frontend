import { NextRequest, NextResponse } from 'next/server';

export interface Prediction {
  id: string;
  type: 'peak_period' | 'budget_alert' | 'staff_shortage' | 'trend_change';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  recommendations: string[];
  metrics: Array<{
    label: string;
    current: number;
    predicted: number;
    unit: string;
    change: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Simulation de prédictions IA
let predictions: Prediction[] = [
  {
    id: 'pred-1',
    type: 'peak_period',
    title: 'Pic de demandes prévu - Été 2026',
    description: 'Une augmentation de 45% des demandes de congés est prévue pour la période juin-août 2026',
    confidence: 92.5,
    impact: 'high',
    date: '2026-06-01',
    recommendations: [
      'Anticiper les validations dès mai',
      'Prévoir des remplacements temporaires',
      'Communiquer les dates limites de dépôt',
      'Augmenter la capacité de traitement',
    ],
    metrics: [
      { label: 'Demandes/mois', current: 45, predicted: 65, unit: 'demandes', change: 44.4 },
      { label: 'Taux occupation', current: 75, predicted: 92, unit: '%', change: 22.7 },
      { label: 'Délai moyen', current: 2.5, predicted: 4.2, unit: 'jours', change: 68 },
    ],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'pred-2',
    type: 'budget_alert',
    title: 'Risque dépassement budget déplacements',
    description: 'Le budget déplacements pourrait être dépassé de 18% d\'ici fin mars 2026',
    confidence: 87.3,
    impact: 'critical',
    date: '2026-03-31',
    recommendations: [
      'Réviser les priorités de déplacement',
      'Privilégier les visioconférences',
      'Négocier des tarifs préférentiels',
      'Demander un budget supplémentaire',
    ],
    metrics: [
      { label: 'Budget utilisé', current: 68, predicted: 118, unit: '%', change: 73.5 },
      { label: 'Coût moyen/déplacement', current: 12500, predicted: 15200, unit: 'DZD', change: 21.6 },
      { label: 'Déplacements/mois', current: 18, predicted: 23, unit: 'missions', change: 27.8 },
    ],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
];

// GET /api/rh/analytics/predictions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const impact = searchParams.get('impact');
    const id = searchParams.get('id');

    let filtered = [...predictions];

    if (id) {
      const prediction = filtered.find((p) => p.id === id);
      if (!prediction) {
        return NextResponse.json(
          { error: 'Prédiction non trouvée' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: prediction, success: true });
    }

    if (type) {
      filtered = filtered.filter((p) => p.type === type);
    }
    if (impact) {
      filtered = filtered.filter((p) => p.impact === impact);
    }

    // Trier par impact puis par confiance
    const impactOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    filtered.sort((a, b) => {
      const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
      if (impactDiff !== 0) return impactDiff;
      return b.confidence - a.confidence;
    });

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      averageConfidence: filtered.reduce((sum, p) => sum + p.confidence, 0) / filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/analytics/predictions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/analytics/predictions - Générer une nouvelle prédiction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.type || !body.title) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    const newPrediction: Prediction = {
      id: `pred-${Date.now()}`,
      type: body.type,
      title: body.title,
      description: body.description || '',
      confidence: body.confidence || 80,
      impact: body.impact || 'medium',
      date: body.date || new Date().toISOString(),
      recommendations: body.recommendations || [],
      metrics: body.metrics || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    predictions.push(newPrediction);

    return NextResponse.json(
      {
        data: newPrediction,
        message: 'Prédiction créée avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/analytics/predictions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/analytics/predictions?id=pred-1
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis', success: false },
        { status: 400 }
      );
    }

    const index = predictions.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Prédiction non trouvée', success: false },
        { status: 404 }
      );
    }

    predictions.splice(index, 1);

    return NextResponse.json({
      message: 'Prédiction supprimée avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/analytics/predictions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

