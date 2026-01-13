import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/bureaux/[code]/report-goulot
 * ======================================
 * Remonter un goulot au DG
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { goulot, severity, proposedSolution, reportedBy } = body;

    if (!goulot) {
      return NextResponse.json(
        { error: 'goulot is required' },
        { status: 400 }
      );
    }

    // TODO: Créer une alerte/notification pour le DG
    
    return NextResponse.json({
      success: true,
      message: 'Goulot remonté au DG',
      reportId: `RPT-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      reportedBy: reportedBy || 'System',
      severity: severity || 'medium',
    });
  } catch (error) {
    console.error('Error reporting goulot:', error);
    return NextResponse.json(
      { error: 'Failed to report goulot' },
      { status: 500 }
    );
  }
}

