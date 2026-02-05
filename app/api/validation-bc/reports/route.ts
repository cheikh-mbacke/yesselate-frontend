// API Route: /api/validation-bc/reports
// Génération et planification de rapports automatiques

import { NextRequest, NextResponse } from 'next/server';

interface Report {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6 pour weekly
    dayOfMonth?: number; // 1-31 pour monthly
    time: string; // HH:mm
  };
  filters?: Record<string, any>;
  recipients: string[]; // Emails
  active: boolean;
  lastGeneratedAt?: string;
  nextGenerationAt?: string;
  createdAt: string;
}

const mockReports: Report[] = [];

/**
 * GET - Liste tous les rapports planifiés
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    let reports = mockReports;
    if (active !== null) {
      reports = reports.filter((r) => r.active === (active === 'true'));
    }

    return NextResponse.json({
      reports,
      total: reports.length,
    });
  } catch (error) {
    console.error('[validation-bc/reports] Error:', error);
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 });
  }
}

/**
 * POST - Crée un rapport planifié
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, format, schedule, filters, recipients } = body;

    if (!name || !type || !format || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'name, type, format et recipients requis' },
        { status: 400 }
      );
    }

    // Calculer la prochaine génération
    const nextGenerationAt = schedule
      ? calculateNextGeneration(schedule)
      : undefined;

    const report: Report = {
      id: `rpt-${Date.now()}`,
      name,
      type,
      format,
      schedule,
      filters,
      recipients,
      active: true,
      createdAt: new Date().toISOString(),
      nextGenerationAt,
    };

    mockReports.push(report);

    console.log(`[validation-bc/reports] Created report: ${name}`);

    return NextResponse.json({
      success: true,
      report,
      message: 'Rapport créé avec succès',
    });
  } catch (error) {
    console.error('[validation-bc/reports] Error:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

/**
 * POST /generate - Génère un rapport à la demande
 */
export async function generateReport(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'reportId requis' }, { status: 400 });
    }

    const report = mockReports.find((r) => r.id === reportId);
    if (!report) {
      return NextResponse.json({ error: 'Rapport introuvable' }, { status: 404 });
    }

    // Simuler la génération
    console.log(`[validation-bc/reports] Generating report: ${report.name}`);

    const reportUrl = `/reports/validation-bc/${reportId}-${Date.now()}.${report.format}`;

    // Mettre à jour la date de dernière génération
    const index = mockReports.findIndex((r) => r.id === reportId);
    if (index !== -1) {
      mockReports[index].lastGeneratedAt = new Date().toISOString();
    }

    return NextResponse.json({
      success: true,
      message: 'Rapport généré avec succès',
      reportUrl,
      sentTo: report.recipients,
    });
  } catch (error) {
    console.error('[validation-bc/reports/generate] Error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

/**
 * Calcule la prochaine date de génération
 */
function calculateNextGeneration(schedule: Report['schedule']): string {
  if (!schedule) return '';

  const now = new Date();
  const [hour, minute] = schedule.time.split(':').map(Number);

  let next = new Date(now);
  next.setHours(hour, minute, 0, 0);

  switch (schedule.frequency) {
    case 'daily':
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      break;

    case 'weekly':
      if (schedule.dayOfWeek !== undefined) {
        const currentDay = next.getDay();
        const daysUntilNext =
          (schedule.dayOfWeek - currentDay + 7) % 7 || (next <= now ? 7 : 0);
        next.setDate(next.getDate() + daysUntilNext);
      }
      break;

    case 'monthly':
      if (schedule.dayOfMonth !== undefined) {
        next.setDate(schedule.dayOfMonth);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
      }
      break;
  }

  return next.toISOString();
}

