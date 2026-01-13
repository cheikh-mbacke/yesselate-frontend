// API Route: POST /api/validation-bc/documents/[id]/validate
// Valide un document avec signature électronique

import { NextRequest, NextResponse } from 'next/server';

interface ValidateDocumentBody {
  comment: string;
  signature: string;
  signatureMethod: 'pin' | 'otp' | 'graphique';
  nextValidator?: string;
  conditions: {
    montantsVerifies: boolean;
    piecesConformes: boolean;
    budgetDisponible: boolean;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: ValidateDocumentBody = await request.json();

    // Validation des champs
    if (!body.comment || !body.signature) {
      return NextResponse.json(
        { error: 'Comment and signature are required' },
        { status: 400 }
      );
    }

    if (!body.conditions.montantsVerifies || !body.conditions.piecesConformes || !body.conditions.budgetDisponible) {
      return NextResponse.json(
        { error: 'All conditions must be checked' },
        { status: 400 }
      );
    }

    // TODO: Vérifier la signature électronique
    // TODO: Récupérer l'utilisateur courant
    // TODO: Vérifier les permissions
    // TODO: Mettre à jour le document en DB
    // TODO: Créer l'entrée dans la timeline
    // TODO: Notifier le prochain validateur
    // TODO: Envoyer email

    // Mock response
    const validatedDocument = {
      id,
      status: 'validated',
      validatedAt: new Date().toISOString(),
      validatedBy: {
        id: 'val-2',
        name: 'M. KANE',
        fonction: 'DAF',
      },
      comment: body.comment,
      signature: {
        method: body.signatureMethod,
        timestamp: new Date().toISOString(),
        verified: true,
      },
      workflow: {
        currentLevel: body.nextValidator ? 3 : 'completed',
        nextValidator: body.nextValidator ? {
          id: body.nextValidator,
          name: 'B. SOW',
          fonction: 'DG',
        } : null,
      },
    };

    // Log de l'action
    console.log(`[validation-bc/documents/${id}/validate] Document validated`, {
      validatedBy: 'M. KANE',
      comment: body.comment,
      signatureMethod: body.signatureMethod,
    });

    // Créer notification
    // await createNotification({
    //   type: 'document_validated',
    //   documentId: id,
    //   userId: nextValidatorId,
    //   message: `Document ${id} validé par M. KANE`,
    // });

    return NextResponse.json({
      success: true,
      message: 'Document validé avec succès',
      document: validatedDocument,
      nextStep: body.nextValidator 
        ? `En attente de validation niveau 3 (DG)` 
        : 'Validation complète',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[validation-bc/documents/[id]/validate] Error:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to validate document',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
