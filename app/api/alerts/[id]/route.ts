import { NextRequest, NextResponse } from 'next/server';
import { generateMockAlerts } from '@/lib/data/alerts';

/**
 * GET /api/alerts/[id]
 * Récupérer une alerte par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Générer les alertes mockées
    const alerts = generateMockAlerts(100);
    const alert = alerts.find(a => a.id === id);

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ alert });
  } catch (error) {
    console.error('Error fetching alert:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/alerts/[id]
 * Mettre à jour une alerte
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Simuler la mise à jour
    const updatedAlert = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
      message: 'Alert updated successfully',
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts/[id]
 * Supprimer une alerte (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Simuler la suppression
    return NextResponse.json({
      success: true,
      message: `Alert ${id} deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
