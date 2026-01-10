// API Route: POST /api/bmo/blocked/[id]/substitute
// Substitution BMO - Remplace un validateur (pouvoir suprême)

import { NextRequest, NextResponse } from 'next/server';

export interface SubstituteBody {
  remplacantId: string;
  justification: string;
  duree: string; // '3' | '7' | '14' | '30' | 'indefini'
  conditions: string;
  signature: {
    password: string;
    certificat?: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: SubstituteBody = await request.json();

    // Validations
    if (!body.remplacantId || !body.justification || !body.duree || !body.conditions) {
      return NextResponse.json(
        { error: 'remplacantId, justification, duree, and conditions are required' },
        { status: 400 }
      );
    }

    if (body.justification.length < 50) {
      return NextResponse.json(
        { error: 'Justification must be at least 50 characters' },
        { status: 400 }
      );
    }

    if (!body.signature.password) {
      return NextResponse.json(
        { error: 'Signature password is required for BMO substitution' },
        { status: 400 }
      );
    }

    // TODO: Récupérer dossier
    const existingDossier = {
      id,
      status: 'pending',
      reference: 'BLOCK-2026-001',
    };

    if (!existingDossier) {
      return NextResponse.json(
        { error: 'Dossier not found' },
        { status: 404 }
      );
    }

    // TODO: Vérifier permissions BMO uniquement
    // TODO: Vérifier password signature
    // TODO: Vérifier que le remplaçant existe et est autorisé
    // TODO: Vérifier qu'il n'y a pas déjà une substitution active

    // Calculer date fin substitution
    const dateFin = body.duree === 'indefini' 
      ? null 
      : new Date(Date.now() + parseInt(body.duree) * 24 * 60 * 60 * 1000).toISOString();

    // TODO: Créer substitution en DB
    // await prisma.substitution.create({
    //   data: {
    //     dossierId: id,
    //     remplacantId: body.remplacantId,
    //     justification: body.justification,
    //     duree: body.duree,
    //     dateFin,
    //     conditions: body.conditions,
    //     signatureHash: hashSignature(body.signature.password),
    //     certificat: body.signature.certificat,
    //     createdBy: currentUserId,
    //   }
    // });

    // TODO: Mettre à jour statut dossier
    // await prisma.blockedDossier.update({
    //   where: { id },
    //   data: { status: 'substituted' }
    // });

    // TODO: Créer timeline entry
    // TODO: Notifier toutes les parties (validateur remplacé, remplaçant, DAF, DG)
    // TODO: Créer rappel automatique pour fin substitution
    // TODO: Enregistrer audit trail (signature BMO)

    const substitution = {
      id: `sub-${Date.now()}`,
      dossierId: id,
      remplacantId: body.remplacantId,
      justification: body.justification,
      duree: body.duree,
      dateFin,
      conditions: body.conditions,
      status: 'active',
      createdAt: new Date().toISOString(),
      signedBy: 'BMO',
      auditTrail: {
        action: 'substitution',
        timestamp: new Date().toISOString(),
        signature: 'SHA256_HASH',
      },
    };

    console.log(`[blocked/${id}/substitute] Substitution BMO créée:`, {
      id,
      remplacantId: body.remplacantId,
      duree: body.duree,
    });

    return NextResponse.json({
      success: true,
      message: 'Substitution BMO effectuée avec succès',
      substitution,
      notifications: {
        sent: ['validateur_remplace', 'remplacant', 'daf', 'dg'],
        auditTrail: true,
      },
    });
  } catch (error) {
    console.error(`[blocked/${params.id}/substitute] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to create substitution', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET pour voir substitution active
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Récupérer substitution active
    const substitution = {
      id: 'sub-123',
      dossierId: id,
      remplacantId: 'user-val-001',
      remplacantName: 'Ibrahima BA',
      validateurRemplace: 'Marie FALL',
      justification: 'Validateur principal absent (congé maladie)',
      duree: '7',
      dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      conditions: 'Montants < 10M FCFA uniquement',
      status: 'active',
      createdAt: '2026-01-09T10:30:00.000Z',
      createdBy: 'Amadou SECK (BMO)',
    };

    return NextResponse.json(substitution);
  } catch (error) {
    console.error(`[blocked/${params.id}/substitute] Get error:`, error);
    return NextResponse.json(
      { error: 'Failed to get substitution' },
      { status: 500 }
    );
  }
}

// DELETE pour révoquer substitution (BMO uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!body.reason) {
      return NextResponse.json(
        { error: 'Reason is required for revocation' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permission BMO
    // TODO: Révoquer substitution
    // await prisma.substitution.update({
    //   where: { dossierId: id, status: 'active' },
    //   data: {
    //     status: 'revoked',
    //     revokedAt: new Date(),
    //     revocationReason: body.reason,
    //   }
    // });

    console.log(`[blocked/${id}/substitute] Substitution révoquée par BMO`);

    return NextResponse.json({
      success: true,
      message: 'Substitution révoquée avec succès',
      revocation: {
        revokedAt: new Date().toISOString(),
        reason: body.reason,
      },
    });
  } catch (error) {
    console.error(`[blocked/${params.id}/substitute] Revoke error:`, error);
    return NextResponse.json(
      { error: 'Failed to revoke substitution' },
      { status: 500 }
    );
  }
}

