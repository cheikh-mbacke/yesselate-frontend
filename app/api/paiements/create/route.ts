// API Route: POST /api/paiements/create
// Crée un nouveau paiement

import { NextRequest, NextResponse } from 'next/server';

export interface CreatePaiementBody {
  reference?: string; // Auto-généré si non fourni
  fournisseurId: string;
  bureau: string;
  montant: number;
  documentSourceType: 'bc' | 'facture' | 'contrat';
  documentSourceId: string;
  dueDate: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  demandeur: {
    nom: string;
    email: string;
    fonction: string;
  };
  fournisseurDetails: {
    rib: string;
    iban?: string;
    bic?: string;
  };
  scheduled?: boolean;
  scheduledDate?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaiementBody = await request.json();

    // Validations
    if (!body.fournisseurId || !body.montant || !body.documentSourceId) {
      return NextResponse.json(
        { error: 'FournisseurId, montant, and documentSourceId are required' },
        { status: 400 }
      );
    }

    if (body.montant <= 0) {
      return NextResponse.json(
        { error: 'Montant must be positive' },
        { status: 400 }
      );
    }

    if (!body.fournisseurDetails?.rib) {
      return NextResponse.json(
        { error: 'RIB is required in fournisseurDetails' },
        { status: 400 }
      );
    }

    // Générer référence si non fournie
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 90000) + 10000;
    const reference = body.reference || `PAY-${year}${month}-${randomNum}`;

    // TODO: Vérifier que le fournisseur existe
    // TODO: Vérifier que le document source existe et est validé
    // TODO: Vérifier budget disponible sur projet
    // TODO: Vérifier trésorerie (seuils d'alerte)
    // TODO: Valider RIB/IBAN (format + checksum)
    // TODO: Déterminer workflow validation (montant > seuils)
    // TODO: Assigner premier validateur
    // TODO: Créer paiement en DB
    // TODO: Créer timeline entry
    // TODO: Envoyer notification validateur

    // Mock response
    const newPaiement = {
      id: `pmt-${Date.now()}`,
      reference,
      fournisseur: body.fournisseurId,
      bureau: body.bureau,
      montant: body.montant,
      status: 'pending',
      urgency: body.urgency || 'medium',
      dueDate: body.dueDate,
      documentSource: {
        type: body.documentSourceType,
        id: body.documentSourceId,
      },
      fournisseurDetails: body.fournisseurDetails,
      demandeur: body.demandeur,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workflow: {
        currentLevel: 1,
        currentValidator: {
          id: 'val-1',
          name: 'Chef Service Finance',
          fonction: 'Chef Service',
        },
        nextValidators: [
          {
            level: 2,
            name: 'DAF',
            condition: body.montant > 5000000 ? 'required' : 'optional',
          },
          {
            level: 3,
            name: 'DG',
            condition: body.montant > 20000000 ? 'required' : 'optional',
          },
        ],
      },
      controls: {
        ribVerified: true, // TODO: Vérifier réellement
        budgetAvailable: true, // TODO: Vérifier réellement
        documentValid: true, // TODO: Vérifier réellement
        tresorerieOk: body.montant < 50000000, // TODO: Vérifier seuil réel
      },
      tresorerie: {
        soldeActuel: 450000000, // TODO: Récupérer du service trésorerie
        impact: -body.montant,
        alerteSeuil: body.montant > 40000000,
      },
    };

    console.log(`[paiements/create] Paiement créé:`, {
      reference,
      montant: body.montant,
      fournisseur: body.fournisseurId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Paiement créé avec succès',
        paiement: newPaiement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[paiements/create] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create paiement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

