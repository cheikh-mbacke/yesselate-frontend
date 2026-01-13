// API Route: POST /api/validation-bc/documents/create
// Crée un nouveau document (BC/Facture/Avenant)

import { NextRequest, NextResponse } from 'next/server';

export interface CreateDocumentBody {
  type: 'bc' | 'facture' | 'avenant';
  objet: string;
  fournisseurId: string;
  bureau: string;
  projetId?: string;
  montantHT: number;
  tva: number;
  dateEmission: string;
  dateLimite?: string;
  urgent?: boolean;
  demandeur: {
    nom: string;
    fonction: string;
    bureau: string;
    email: string;
    telephone?: string;
  };
  lignes: Array<{
    designation: string;
    quantite: number;
    unite: string;
    prixUnitaire: number;
    montant: number;
    categorie?: string;
  }>;
  commentaire?: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateDocumentBody = await request.json();

    // Validations
    if (!body.type || !body.objet || !body.fournisseurId || !body.bureau) {
      return NextResponse.json(
        { error: 'Type, objet, fournisseurId, and bureau are required' },
        { status: 400 }
      );
    }

    if (!body.montantHT || body.montantHT <= 0) {
      return NextResponse.json(
        { error: 'MontantHT must be positive' },
        { status: 400 }
      );
    }

    if (!body.demandeur || !body.demandeur.nom || !body.demandeur.email) {
      return NextResponse.json(
        { error: 'Demandeur information is required' },
        { status: 400 }
      );
    }

    if (!body.lignes || body.lignes.length === 0) {
      return NextResponse.json(
        { error: 'At least one ligne is required' },
        { status: 400 }
      );
    }

    // Vérifier cohérence montants
    const totalLignes = body.lignes.reduce((sum, ligne) => sum + ligne.montant, 0);
    if (Math.abs(totalLignes - body.montantHT) > 0.01) {
      return NextResponse.json(
        { error: 'Sum of lignes does not match montantHT' },
        { status: 400 }
      );
    }

    const montantTTC = body.montantHT * (1 + body.tva / 100);

    // Générer ID document
    const year = new Date().getFullYear();
    const typePrefix = body.type === 'bc' ? 'BC' : body.type === 'facture' ? 'FC' : 'AV';
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const documentId = `${typePrefix}-${year}-${randomNum}`;

    // TODO: Vérifier budget disponible si projetId fourni
    // TODO: Vérifier que le fournisseur existe et est agréé
    // TODO: Récupérer l'utilisateur courant (authentification)
    // TODO: Créer le document en DB (Prisma)
    // TODO: Créer les lignes en DB
    // TODO: Uploader les attachments (S3/storage)
    // TODO: Déterminer le circuit de validation (workflow engine)
    // TODO: Assigner le premier validateur
    // TODO: Créer l'entrée dans la timeline
    // TODO: Envoyer notification au premier validateur
    // TODO: Créer l'audit log

    // Mock response - document créé
    const newDocument = {
      id: documentId,
      type: body.type,
      status: 'pending',
      bureau: body.bureau,
      fournisseur: body.fournisseurId, // En prod, récupérer le nom depuis DB
      objet: body.objet,
      montantHT: body.montantHT,
      montantTTC,
      tva: body.tva,
      projet: body.projetId,
      dateEmission: body.dateEmission,
      dateLimite: body.dateLimite,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      urgent: body.urgent || false,
      demandeur: body.demandeur,
      lignes: body.lignes,
      commentaire: body.commentaire,
      attachments: body.attachments || [],
      workflow: {
        currentLevel: 1,
        currentValidator: {
          id: 'val-1',
          name: 'Chef de Service',
          fonction: 'Chef Service',
          bureau: body.bureau,
        },
        nextValidators: [
          {
            level: 2,
            name: 'DAF',
            condition: montantTTC > 5000000 ? 'required' : 'optional',
          },
          {
            level: 3,
            name: 'DG',
            condition: montantTTC > 20000000 ? 'required' : 'optional',
          },
        ],
      },
      controls: {
        budgetDisponible: body.projetId ? true : null, // TODO: Vérifier réellement
        fournisseurAgree: true, // TODO: Vérifier réellement
        montantsCoherents: true, // Vérifié ci-dessus
        piecesCompletes: body.attachments && body.attachments.length > 0,
        procedureRespectee: true,
      },
    };

    console.log(`[validation-bc/documents/create] Document created:`, {
      id: documentId,
      type: body.type,
      montantTTC,
      demandeur: body.demandeur.nom,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Document created successfully',
        document: newDocument,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[validation-bc/documents/create] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
