/**
 * API Route: GET /api/rh/demandes/stats
 * Récupère les statistiques des demandes RH
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periode = searchParams.get('periode') || 'mois'; // 'jour', 'semaine', 'mois', 'annee'
    const bureau = searchParams.get('bureau');

    // Mock statistics
    const stats = {
      vue_ensemble: {
        total: 127,
        en_cours: 23,
        validees: 89,
        rejetees: 12,
        brouillons: 3,
        taux_validation: 88.1,
        delai_moyen_validation: 2.3, // jours
        delai_median_validation: 1.5
      },
      par_type: [
        {
          type: 'conges',
          label: 'Congés',
          total: 56,
          en_cours: 12,
          validees: 40,
          rejetees: 4,
          pourcentage: 44.1
        },
        {
          type: 'depenses',
          label: 'Dépenses',
          total: 38,
          en_cours: 6,
          validees: 28,
          rejetees: 4,
          pourcentage: 29.9
        },
        {
          type: 'deplacement',
          label: 'Déplacements',
          total: 23,
          en_cours: 4,
          validees: 16,
          rejetees: 3,
          pourcentage: 18.1
        },
        {
          type: 'avances',
          label: 'Avances',
          total: 10,
          en_cours: 1,
          validees: 5,
          rejetees: 1,
          pourcentage: 7.9
        }
      ],
      par_priorite: [
        {
          priorite: 'normale',
          label: 'Normale',
          count: 98,
          pourcentage: 77.2
        },
        {
          priorite: 'urgente',
          label: 'Urgente',
          count: 24,
          pourcentage: 18.9
        },
        {
          priorite: 'critique',
          label: 'Critique',
          count: 5,
          pourcentage: 3.9
        }
      ],
      par_bureau: [
        { bureau: 'Bureau Technique', total: 45, validees: 38, rejetees: 5 },
        { bureau: 'Bureau Commercial', total: 32, validees: 28, rejetees: 3 },
        { bureau: 'Bureau Administratif', total: 28, validees: 18, rejetees: 3 },
        { bureau: 'Bureau Logistique', total: 22, validees: 5, rejetees: 1 }
      ],
      par_statut_validation: {
        niveau_1: {
          en_attente: 8,
          approuvees: 102,
          rejetees: 17,
          taux_approbation: 85.7
        },
        niveau_2: {
          en_attente: 12,
          approuvees: 94,
          rejetees: 8,
          taux_approbation: 92.2
        },
        niveau_3: {
          en_attente: 15,
          approuvees: 89,
          rejetees: 4,
          taux_approbation: 95.7
        }
      },
      tendances: {
        evolution_7_jours: [
          { date: '2026-01-04', creees: 5, validees: 8, rejetees: 1 },
          { date: '2026-01-05', creees: 3, validees: 6, rejetees: 0 },
          { date: '2026-01-06', creees: 8, validees: 7, rejetees: 2 },
          { date: '2026-01-07', creees: 6, validees: 9, rejetees: 1 },
          { date: '2026-01-08', creees: 4, validees: 11, rejetees: 0 },
          { date: '2026-01-09', creees: 7, validees: 5, rejetees: 1 },
          { date: '2026-01-10', creees: 9, validees: 8, rejetees: 2 }
        ],
        croissance_mensuelle: 12.5, // %
        pic_activite: 'Mardi',
        heure_pic: '10:00-11:00'
      },
      montants: {
        total_depenses: 2450000, // XOF
        total_avances: 850000,
        moyenne_depense: 64473,
        moyenne_avance: 85000,
        devise: 'XOF'
      },
      performances: {
        top_valideurs: [
          { nom: 'DRH', validations: 45, delai_moyen: 1.2 },
          { nom: 'Chef de Service', validations: 38, delai_moyen: 0.8 },
          { nom: 'Direction Financière', validations: 32, delai_moyen: 1.5 }
        ],
        delais_par_type: [
          { type: 'conges', delai_moyen: 2.1, delai_max: 5 },
          { type: 'depenses', delai_moyen: 1.8, delai_max: 4 },
          { type: 'deplacement', delai_moyen: 2.5, delai_max: 6 },
          { type: 'avances', delai_moyen: 3.2, delai_max: 8 }
        ]
      },
      alertes: {
        en_retard: 3,
        en_attente_longue: 5, // > 3 jours
        documents_manquants: 2,
        validations_bloquees: 1
      },
      periode: {
        debut: '2026-01-01',
        fin: '2026-01-31',
        type: periode
      },
      timestamp: new Date().toISOString()
    };

    // Filter by bureau if specified
    if (bureau) {
      const bureauStats = stats.par_bureau.find(b => 
        b.bureau.toLowerCase() === bureau.toLowerCase()
      );
      
      if (bureauStats) {
        return NextResponse.json({
          success: true,
          data: {
            ...stats,
            filtre_bureau: bureauStats
          },
          timestamp: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API /api/rh/demandes/stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

