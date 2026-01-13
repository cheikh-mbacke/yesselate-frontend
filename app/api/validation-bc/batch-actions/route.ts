// API Route: POST /api/validation-bc/batch-actions
// Actions en masse sur plusieurs documents

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, documentIds, reason } = body;

    if (!action || !documentIds || !Array.isArray(documentIds)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (documentIds.length === 0) {
      return NextResponse.json(
        { error: 'No documents selected' },
        { status: 400 }
      );
    }

    // Simuler le traitement en masse
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { id: string; error: string }[],
    };

    // Simuler le traitement de chaque document
    for (const docId of documentIds) {
      try {
        // Simuler un succès aléatoire (90% de succès)
        if (Math.random() > 0.1) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            id: docId,
            error: 'Échec de traitement (simulation)',
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          id: docId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`[validation-bc/batch-actions] Batch action completed`, {
      action,
      total: documentIds.length,
      success: results.success,
      failed: results.failed,
    });

    return NextResponse.json({
      success: results.success,
      failed: results.failed,
      errors: results.errors,
      message: `Action "${action}" appliquée: ${results.success} réussi(s), ${results.failed} échoué(s)`,
    });
  } catch (error) {
    console.error('[validation-bc/batch-actions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute batch action' },
      { status: 500 }
    );
  }
}

