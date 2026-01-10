// API Route: POST /api/validation-bc/documents
// Création d'un nouveau document (BC, Facture, Avenant)

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      fournisseur,
      montant,
      objet,
      bureau,
      projet,
      dateEcheance,
    } = body;

    // Validation des champs requis
    if (!type || !fournisseur || !montant || !objet || !bureau) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validation du type
    if (!['bc', 'facture', 'avenant'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Simuler la création
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Générer un ID unique
    const prefix = type === 'bc' ? 'BC' : type === 'facture' ? 'FC' : 'AV';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const id = `${prefix}-${year}-${randomNum}`;

    // Calculer montants HT et TTC
    const montantTTC = Number(montant);
    const montantHT = Math.round(montantTTC / 1.2); // TVA 20%
    const tva = 20;

    const newDocument = {
      id,
      type,
      status: 'pending',
      bureau,
      fournisseur,
      objet,
      montantHT,
      montantTTC,
      tva,
      projet: projet || null,
      dateEmission: new Date().toISOString().split('T')[0],
      dateLimite: dateEcheance || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      urgent: false,
      demandeur: {
        nom: 'Utilisateur Connecté', // À remplacer par l'utilisateur réel
        fonction: 'Agent',
        bureau,
      },
    };

    console.log('[validation-bc/documents] Document created:', {
      id,
      type,
      bureau,
      montant: montantTTC,
    });

    return NextResponse.json(
      {
        success: true,
        document: newDocument,
        message: `Document ${id} créé avec succès`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[validation-bc/documents] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

