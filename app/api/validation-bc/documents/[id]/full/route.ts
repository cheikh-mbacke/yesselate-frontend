// API Route: GET /api/validation-bc/documents/[id]/full
// Retourne les détails complets enrichis d'un document

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // TODO: Remplacer par vraie requête DB
    // const document = await prisma.validationDocument.findUnique({
    //   where: { id },
    //   include: { projet, fournisseur, lignes, documents, timeline, commentaires }
    // });

    // Mock data enrichies
    const fullDocument = {
      id,
      type: 'bc',
      status: 'pending',
      bureau: 'DRE',
      fournisseur: 'SENELEC',
      objet: 'Fourniture et installation équipements électriques',
      montantHT: 8500000,
      montantTTC: 10030000,
      tva: 18,
      projet: 'PRJ-2024-RN02',
      dateEmission: new Date('2024-01-15').toISOString(),
      dateLimite: new Date('2024-01-25').toISOString(),
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date().toISOString(),
      urgent: true,
      anomalies: ['Bon de livraison manquant'],
      
      // Détails demandeur
      demandeur: {
        nom: 'Amadou DIALLO',
        fonction: 'Chef de Service Infrastructure',
        bureau: 'DRE',
        email: 'adiallo@example.com',
        telephone: '+221 77 123 45 67',
      },

      // Lignes de détail
      lignes: [
        {
          id: 'ligne-1',
          designation: 'Transformateur 100 KVA',
          quantite: 2,
          unite: 'unité',
          prixUnitaire: 2500000,
          montant: 5000000,
        },
        {
          id: 'ligne-2',
          designation: 'Cable électrique 50mm²',
          quantite: 500,
          unite: 'm',
          prixUnitaire: 5000,
          montant: 2500000,
        },
        {
          id: 'ligne-3',
          designation: 'Disjoncteur différentiel 63A',
          quantite: 10,
          unite: 'unité',
          prixUnitaire: 100000,
          montant: 1000000,
        },
      ],

      // Pièces jointes
      documents: [
        {
          id: 'doc-1',
          nom: 'Devis_SENELEC_2024.pdf',
          type: 'application/pdf',
          taille: 245600,
          url: '/uploads/devis_senelec_2024.pdf',
          uploadedAt: new Date('2024-01-15').toISOString(),
          uploadedBy: 'Amadou DIALLO',
        },
        {
          id: 'doc-2',
          nom: 'Specifications_techniques.pdf',
          type: 'application/pdf',
          taille: 512000,
          url: '/uploads/specs_tech.pdf',
          uploadedAt: new Date('2024-01-15').toISOString(),
          uploadedBy: 'Amadou DIALLO',
        },
      ],

      // Détails projet
      projetDetails: {
        nom: 'Construction Route Nationale N°2',
        code: 'PRJ-2024-RN02',
        budgetTotal: 500000000,
        budgetUtilise: 350000000,
        budgetRestant: 150000000,
        pourcentageUtilise: 70,
        chantiers: [
          {
            id: 'ch-1',
            nom: 'Tronçon Dakar-Thiès',
            statut: 'en_cours',
          },
        ],
      },

      // Détails fournisseur
      fournisseurDetails: {
        nom: 'SENELEC',
        ninea: '123456789',
        adresse: 'Avenue Cheikh Anta Diop, Dakar',
        telephone: '+221 33 839 30 30',
        email: 'contact@senelec.sn',
        historiqueCommandes: 45,
        montantTotal: 125000000,
        fiabilite: 'Excellent',
        derniereCommande: '2024-12-15',
        performance: {
          tauxLivraison: 98,
          delaiMoyen: '15 jours',
          satisfaction: 4.8,
        },
      },

      // Workflow de validation
      workflow: {
        etapes: [
          {
            niveau: 1,
            nom: 'Chef de Service',
            validateur: 'A. DIALLO',
            validateurId: 'val-1',
            statut: 'validated',
            date: '2024-01-16 10:30:00',
            commentaire: 'Budget vérifié, pièces conformes. Approuvé.',
          },
          {
            niveau: 2,
            nom: 'Directeur Administratif et Financier',
            validateur: 'M. KANE',
            validateurId: 'val-2',
            statut: 'pending',
            date: null,
            commentaire: null,
          },
          {
            niveau: 3,
            nom: 'Direction Générale',
            validateur: 'B. SOW',
            validateurId: 'val-3',
            statut: 'waiting',
            date: null,
            commentaire: null,
          },
        ],
        etapeCourante: 2,
        prochainValidateur: {
          id: 'val-2',
          nom: 'M. KANE',
          fonction: 'DAF',
          email: 'mkane@example.com',
        },
        regles: {
          montantMin: 0,
          montantMax: 50000000,
          niveauxRequis: 3,
          delaiParNiveau: '48h',
        },
      },

      // Timeline des événements
      timeline: [
        {
          id: 'evt-1',
          action: 'Document créé',
          actorName: 'Amadou DIALLO',
          actorRole: 'Chef de Service',
          timestamp: '2024-01-15 14:30:00',
          type: 'created',
          details: 'Document BC-2024-001 créé pour un montant de 10 030 000 FCFA',
        },
        {
          id: 'evt-2',
          action: 'Pièce jointe ajoutée',
          actorName: 'Amadou DIALLO',
          actorRole: 'Chef de Service',
          timestamp: '2024-01-15 14:35:00',
          type: 'modified',
          details: 'Devis_SENELEC_2024.pdf',
        },
        {
          id: 'evt-3',
          action: 'Document soumis pour validation',
          actorName: 'Amadou DIALLO',
          actorRole: 'Chef de Service',
          timestamp: '2024-01-15 15:00:00',
          type: 'modified',
          details: 'Soumis au circuit de validation',
        },
        {
          id: 'evt-4',
          action: 'Validé - Niveau 1',
          actorName: 'A. DIALLO',
          actorRole: 'Chef de Service',
          timestamp: '2024-01-16 10:30:00',
          type: 'validated',
          details: 'Budget vérifié, pièces conformes',
        },
        {
          id: 'evt-5',
          action: 'Assigné pour validation',
          actorName: 'Système',
          actorRole: 'Automatique',
          timestamp: '2024-01-16 10:31:00',
          type: 'modified',
          details: 'Assigné à M. KANE (DAF)',
        },
      ],

      // Commentaires
      commentairesDetails: [
        {
          id: 'com-1',
          auteur: 'Amadou DIALLO',
          auteurId: 'user-1',
          fonction: 'Chef de Service',
          date: '2024-01-16 10:30:00',
          texte: 'Budget vérifié et disponible. Pièces conformes. Validation niveau 1 approuvée.',
          pieceJointe: null,
          mentions: [],
        },
        {
          id: 'com-2',
          auteur: 'Fatou NDIAYE',
          auteurId: 'user-4',
          fonction: 'Assistante',
          date: '2024-01-15 16:00:00',
          texte: 'Documents reçus et vérifiés. Attention : le bon de livraison n\'est pas encore fourni.',
          pieceJointe: null,
          mentions: ['val-1'],
        },
      ],

      // Contrôles automatiques
      controles: {
        budgetOk: true,
        montantCoherent: true,
        piecesCompletes: false,
        fournisseurActif: true,
        delaiRespect: false,
        margeDisponible: true,
        details: [
          '✅ Budget projet disponible : 150M FCFA restants (30%)',
          '✅ Montant cohérent avec le marché initial',
          '⚠️ Bon de livraison manquant',
          '✅ Fournisseur actif et certifié (SENELEC)',
          '❌ Délai de validation dépassé de 2 jours',
          '✅ Marge budgétaire suffisante (5% de sécurité)',
        ],
        score: 75,
      },

      // Marché parent (si applicable)
      marcheDetails: {
        numero: 'MAR-2023-045',
        intitule: 'Marché cadre électrification rurale',
        montantInitial: 80000000,
        montantActuel: 85000000,
        avenants: [
          {
            numero: 'AVE-2024-001',
            montant: 5000000,
            date: '2024-01-10',
          },
        ],
        resteAFacturer: 15000000,
        tauxExecution: 85,
      },

      // Documents liés
      documentsLies: [
        {
          id: 'BC-2023-089',
          type: 'bc',
          fournisseur: 'SENELEC',
          montant: 5000000,
          statut: 'validated',
          date: '2023-12-10',
        },
        {
          id: 'FC-2024-015',
          type: 'facture',
          fournisseur: 'SENELEC',
          montant: 4500000,
          statut: 'validated',
          date: '2024-01-05',
        },
      ],

      // Statistiques du document
      stats: {
        vues: 15,
        modifications: 3,
        commentaires: 2,
        joursEnValidation: 3,
        jourRestants: -2, // Négatif = retard
      },
    };

    console.log(`[validation-bc/documents/${id}/full] Loaded full details`);

    return NextResponse.json({
      document: fullDocument,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[validation-bc/documents/[id]/full] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to load document details' },
      { status: 500 }
    );
  }
}

