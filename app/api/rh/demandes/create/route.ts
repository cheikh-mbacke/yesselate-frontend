/**
 * API Route: POST /api/rh/demandes/create
 * Crée une nouvelle demande RH
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      type,
      agentId,
      objet,
      description,
      priorite = 'normale',
      dateDebut,
      dateFin,
      montant,
      devise = 'XOF',
      documents = [],
      tags = []
    } = body;

    // Validation
    if (!type || !agentId || !objet) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres manquants',
          details: 'type, agentId et objet sont requis'
        },
        { status: 400 }
      );
    }

    if (!['conges', 'depenses', 'deplacement', 'avances'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Type invalide',
          details: 'type doit être: conges, depenses, deplacement ou avances'
        },
        { status: 400 }
      );
    }

    // Generate unique ID and numero
    const timestamp = Date.now();
    const id = `DEM-2026-${String(timestamp).slice(-4)}`;
    const prefixes = {
      conges: 'CONG',
      depenses: 'DEP',
      deplacement: 'DEPL',
      avances: 'AVA'
    };
    const numero = `${prefixes[type as keyof typeof prefixes]}-2026-${String(timestamp).slice(-4)}`;

    // Calculate duration for date-based requests
    let duree = null;
    if (dateDebut && dateFin) {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      duree = Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Create demand object
    const newDemand = {
      id,
      type,
      numero,
      agent: {
        id: agentId,
        // In real app, fetch agent details from database
        nom: 'Agent Name',
        matricule: `MAT-${agentId.slice(-3)}`,
        bureau: 'Bureau Technique',
        poste: 'Collaborateur'
      },
      statut: 'brouillon',
      priorite,
      objet,
      description,
      dateDebut,
      dateFin,
      duree,
      montant: type === 'depenses' || type === 'avances' ? montant : null,
      devise: type === 'depenses' || type === 'avances' ? devise : null,
      validations: [
        {
          niveau: 1,
          valideur: 'Chef de Service',
          statut: 'en_attente'
        },
        {
          niveau: 2,
          valideur: 'DRH',
          statut: 'en_attente'
        }
      ],
      documents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: agentId,
      tags
    };

    return NextResponse.json({
      success: true,
      message: 'Demande créée avec succès',
      data: newDemand,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur API /api/rh/demandes/create:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de la demande',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

