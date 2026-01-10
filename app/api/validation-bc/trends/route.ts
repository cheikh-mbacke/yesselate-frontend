// API Route: GET /api/validation-bc/trends
// Retourne les tendances temporelles (évolution sur 7 derniers jours)

import { NextRequest, NextResponse } from 'next/server';

// Mock data - simule l'évolution sur 7 jours
const generateTrendData = () => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  return {
    pending: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(now - (6 - i) * oneDayMs).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 20) + 35, // 35-55
    })),
    validated: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(now - (6 - i) * oneDayMs).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 30) + 50, // 50-80
    })),
    rejected: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(now - (6 - i) * oneDayMs).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 10) + 5, // 5-15
    })),
    anomalies: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(now - (6 - i) * oneDayMs).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 8) + 2, // 2-10
    })),
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    const metric = searchParams.get('metric') || 'all'; // pending | validated | rejected | anomalies | all

    const trends = generateTrendData();

    // Retourner uniquement la métrique demandée ou toutes
    const result = metric === 'all' ? trends : { [metric]: trends[metric as keyof typeof trends] };

    console.log(`[validation-bc/trends] Generated trends for ${days} days (metric: ${metric})`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[validation-bc/trends] Error:', error);
    return NextResponse.json({ error: 'Failed to load trends' }, { status: 500 });
  }
}

