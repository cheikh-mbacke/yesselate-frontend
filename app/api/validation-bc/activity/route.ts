import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/validation-bc/activity
 * 
 * Récupère l'historique d'activité des validations BC
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const filter = searchParams.get('filter') || 'all';

    // Mock activity data
    const activities = [
      {
        id: 'ACT-001',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        action: 'validated',
        actor: { id: 'U1', name: 'Jean DUPONT', role: 'Chef de service DRE' },
        document: { id: 'BC-2026-0048', type: 'bc', title: 'Fournitures bureau urgentes' },
        details: 'Validation avec commentaire: Conforme aux spécifications',
      },
      {
        id: 'ACT-002',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        action: 'rejected',
        actor: { id: 'U2', name: 'Marie FALL', role: 'DAF' },
        document: { id: 'FAC-2026-0089', type: 'facture', title: 'Facture logiciels comptabilité' },
        details: 'Rejeté: Montant non conforme au BC initial. Écart de 15%.',
      },
      {
        id: 'ACT-003',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        action: 'created',
        actor: { id: 'U3', name: 'Pierre SALL', role: 'Agent comptable DAAF' },
        document: { id: 'BC-2026-0052', type: 'bc', title: 'Équipement informatique serveurs' },
        details: 'Création d\'un nouveau BC pour le datacenter',
      },
      {
        id: 'ACT-004',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        action: 'escalated',
        actor: { id: 'U1', name: 'Jean DUPONT', role: 'Chef de service DRE' },
        document: { id: 'BC-2026-0045', type: 'bc', title: 'Marché travaux réhabilitation' },
        details: 'Escaladé vers DAF: Montant supérieur au seuil de 50M XOF',
      },
      {
        id: 'ACT-005',
        timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
        action: 'validated',
        actor: { id: 'U4', name: 'Sophie DIOP', role: 'Contrôleur financier' },
        document: { id: 'FAC-2026-0085', type: 'facture', title: 'Contrat maintenance annuel' },
        details: 'Validation après vérification budgétaire',
      },
      {
        id: 'ACT-006',
        timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
        action: 'delegated',
        actor: { id: 'U5', name: 'Amadou DIALLO', role: 'DG' },
        document: null,
        details: 'Délégation de pouvoir créée pour Marie FALL (48h)',
      },
      {
        id: 'ACT-007',
        timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
        action: 'modified',
        actor: { id: 'U3', name: 'Pierre SALL', role: 'Agent comptable DAAF' },
        document: { id: 'BC-2026-0042', type: 'bc', title: 'Achats consommables' },
        details: 'Modification du montant suite à négociation fournisseur',
      },
      {
        id: 'ACT-008',
        timestamp: new Date(Date.now() - 400 * 60000).toISOString(),
        action: 'validated',
        actor: { id: 'U6', name: 'Fatou NDIAYE', role: 'Responsable achats' },
        document: { id: 'BC-2026-0040', type: 'bc', title: 'Mobilier bureautique' },
        details: 'Validation technique conforme au cahier des charges',
      },
      {
        id: 'ACT-009',
        timestamp: new Date(Date.now() - 500 * 60000).toISOString(),
        action: 'created',
        actor: { id: 'U7', name: 'Omar BA', role: 'Gestionnaire DSI' },
        document: { id: 'AVE-2026-0008', type: 'avenant', title: 'Avenant contrat hébergement' },
        details: 'Avenant pour extension de capacité cloud',
      },
      {
        id: 'ACT-010',
        timestamp: new Date(Date.now() - 600 * 60000).toISOString(),
        action: 'rejected',
        actor: { id: 'U4', name: 'Sophie DIOP', role: 'Contrôleur financier' },
        document: { id: 'FAC-2026-0078', type: 'facture', title: 'Prestations conseil' },
        details: 'Rejeté: Documents justificatifs incomplets',
      },
    ];

    let filtered = activities;
    if (filter !== 'all') {
      filtered = activities.filter(a => a.action === filter);
    }

    return NextResponse.json({
      success: true,
      data: filtered.slice(0, limit),
      summary: {
        total: activities.length,
        validated: activities.filter(a => a.action === 'validated').length,
        rejected: activities.filter(a => a.action === 'rejected').length,
        created: activities.filter(a => a.action === 'created').length,
        escalated: activities.filter(a => a.action === 'escalated').length,
      },
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur récupération activités:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

