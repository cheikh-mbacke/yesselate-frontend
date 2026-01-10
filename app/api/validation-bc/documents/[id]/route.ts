// API Route: GET /api/validation-bc/documents/[id]
// Détails d'un document spécifique

import { NextRequest, NextResponse } from 'next/server';

// Mock document complet avec historique
const mockDocumentDetails: Record<string, any> = {
  'BC-2024-001': {
    id: 'BC-2024-001',
    type: 'bc',
    status: 'pending',
    bureau: 'DRE',
    fournisseur: 'ENTREPRISE SENEGAL',
    objet: 'Travaux de rénovation bureau DRE',
    montantHT: 4166667,
    montantTTC: 5000000,
    tva: 20,
    projet: 'Rénovation bureaux',
    dateEmission: '2024-01-15',
    dateLimite: '2024-02-15',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    urgent: false,
    demandeur: {
      nom: 'Jean DUPONT',
      fonction: 'Chef de service',
      bureau: 'DRE',
      email: 'j.dupont@example.sn',
      telephone: '+221 77 123 45 67',
    },
    lignes: [
      {
        id: 'L1',
        designation: 'Peinture murs',
        quantite: 100,
        unite: 'm²',
        prixUnitaire: 25000,
        montant: 2500000,
      },
      {
        id: 'L2',
        designation: 'Réparation sols',
        quantite: 50,
        unite: 'm²',
        prixUnitaire: 50000,
        montant: 2500000,
      },
    ],
    documents: [
      {
        id: 'DOC-1',
        nom: 'Devis fournisseur.pdf',
        type: 'pdf',
        taille: 245678,
        url: '/uploads/devis-bc-2024-001.pdf',
      },
      {
        id: 'DOC-2',
        nom: 'Bon de commande signé.pdf',
        type: 'pdf',
        taille: 189234,
        url: '/uploads/bc-2024-001-signe.pdf',
      },
    ],
    timeline: [
      {
        id: 'TL-1',
        action: 'Document créé',
        actorName: 'Jean DUPONT',
        actorRole: 'Chef de service',
        timestamp: '2024-01-15T10:00:00Z',
        type: 'created',
      },
      {
        id: 'TL-2',
        action: 'Soumis pour validation',
        actorName: 'Jean DUPONT',
        actorRole: 'Chef de service',
        timestamp: '2024-01-15T10:30:00Z',
        details: 'Document envoyé au BMO pour validation',
        type: 'modified',
      },
    ],
    projetDetails: {
      nom: 'Rénovation bureaux',
      code: 'PROJ-2024-01',
      budgetTotal: 50000000,
      budgetUtilise: 30000000,
      budgetRestant: 20000000,
    },
    fournisseurDetails: {
      nom: 'ENTREPRISE SENEGAL',
      ninea: '123456789',
      adresse: 'Dakar, Sénégal',
      telephone: '+221 33 123 45 67',
      historiqueCommandes: 5,
      fiabilite: 'bon',
    },
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    const document = mockDocumentDetails[id];

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    console.log(`[validation-bc/documents/${id}] Loaded document details`);

    return NextResponse.json(document);
  } catch (error) {
    console.error('[validation-bc/documents] Error:', error);
    return NextResponse.json({ error: 'Failed to load document' }, { status: 500 });
  }
}
