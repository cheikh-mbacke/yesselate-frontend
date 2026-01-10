/**
 * GET /api/dashboard/trends
 * Tendances historiques sur 12 mois
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kpiId = searchParams.get('kpi'); // Filtrer par KPI spécifique
    const months = parseInt(searchParams.get('months') || '12', 10); // 3, 6, 12

    // Générer tendances pour les N derniers mois
    const trends = Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));

      const baseMonth = {
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
      };

      // Valeurs simulées avec tendance croissante
      const progressFactor = i / months;
      
      return {
        ...baseMonth,
        demandes: Math.floor(150 + progressFactor * 100 + Math.random() * 20),
        validations: Math.floor(130 + progressFactor * 90 + Math.random() * 15),
        rejets: Math.floor(20 + Math.random() * 10),
        budget: Math.round((2.5 + progressFactor * 2 + Math.random() * 0.3) * 10) / 10,
        tauxValidation: Math.floor(82 + progressFactor * 10 + Math.random() * 3),
        delaiMoyen: Math.round((3.5 - progressFactor * 1 + Math.random() * 0.5) * 10) / 10,
        blocages: Math.floor(8 - progressFactor * 3 + Math.random() * 2),
        risquesCritiques: Math.floor(5 - progressFactor * 2 + Math.random() * 2),
        decisionsEnAttente: Math.floor(10 - progressFactor * 2 + Math.random() * 3),
        conformiteSLA: Math.floor(88 + progressFactor * 6 + Math.random() * 2),
      };
    });

    // Calculer les statistiques de tendance
    const firstMonth = trends[0];
    const lastMonth = trends[trends.length - 1];

    const calculateTrend = (start: number, end: number) => {
      const change = ((end - start) / start) * 100;
      return {
        change: Math.round(change * 10) / 10,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        isPositive: change > 0,
      };
    };

    const trendAnalysis = {
      demandes: calculateTrend(firstMonth.demandes, lastMonth.demandes),
      validations: calculateTrend(firstMonth.validations, lastMonth.validations),
      tauxValidation: calculateTrend(firstMonth.tauxValidation, lastMonth.tauxValidation),
      delaiMoyen: {
        ...calculateTrend(firstMonth.delaiMoyen, lastMonth.delaiMoyen),
        isPositive: lastMonth.delaiMoyen < firstMonth.delaiMoyen, // Inverse pour délai
      },
      blocages: {
        ...calculateTrend(firstMonth.blocages, lastMonth.blocages),
        isPositive: lastMonth.blocages < firstMonth.blocages, // Inverse pour blocages
      },
    };

    // Prédictions simples (moyenne mobile + tendance)
    const predictNext = (values: number[]) => {
      const lastThree = values.slice(-3);
      const avg = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
      const trend = lastThree[2] - lastThree[0];
      return Math.round(avg + trend);
    };

    const predictions = {
      nextMonth: {
        demandes: predictNext(trends.map((t) => t.demandes)),
        validations: predictNext(trends.map((t) => t.validations)),
        budget: Math.round(predictNext(trends.map((t) => t.budget * 10)) / 10),
      },
    };

    // Filtrer par KPI si spécifié
    let result: any = { trends, trendAnalysis, predictions };
    
    if (kpiId) {
      const kpiKey = kpiId as keyof typeof firstMonth;
      if (kpiKey in firstMonth) {
        result = {
          kpi: kpiId,
          values: trends.map((t) => ({
            period: t.month,
            value: t[kpiKey],
          })),
          analysis: trendAnalysis[kpiKey as keyof typeof trendAnalysis] || null,
        };
      }
    }

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching dashboard trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard trends' },
      { status: 500 }
    );
  }
}

