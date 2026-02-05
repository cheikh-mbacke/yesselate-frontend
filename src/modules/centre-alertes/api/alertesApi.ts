/**
 * API service pour le module Centre d'Alerte - Maître d'Ouvrage
 */

import type {
  Alerte,
  AlerteStats,
  AlerteFiltres,
  TypologieAlerte,
  StatutAlerte,
} from '../types/alertesTypes';

// ================================
// Données mock
// ================================

const mockAlertes: Alerte[] = [
  {
    id: '1',
    titre: 'Paiement bloqué - Facture #12345',
    description: 'Le paiement de la facture #12345 est bloqué depuis 5 jours',
    typologie: 'CRITIQUE',
    statut: 'EN_COURS',
    severite: 'critical',
    bureau: 'BTP',
    responsable: 'Jean Dupont',
    responsableId: 'user-1',
    montant: 50000,
    devise: 'EUR',
    dateDeclenchement: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    estBloquante: true,
    tags: ['paiement', 'facture', 'urgent'],
  },
  {
    id: '2',
    titre: 'Validation bloquée - BC #789',
    description: 'La validation du bon de commande #BC-789 est bloquée depuis 3 jours',
    typologie: 'CRITIQUE',
    statut: 'EN_COURS',
    severite: 'warning',
    bureau: 'BJ',
    responsable: 'Marie Martin',
    responsableId: 'user-2',
    dateDeclenchement: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    estBloquante: true,
    tags: ['validation', 'bc'],
  },
  {
    id: '3',
    titre: 'Justificatif manquant - Dépense #456',
    description: 'Le justificatif pour la dépense #456 n\'a pas été fourni',
    typologie: 'CRITIQUE',
    statut: 'EN_COURS',
    severite: 'critical',
    bureau: 'BS',
    responsable: 'Pierre Durand',
    responsableId: 'user-3',
    montant: 15000,
    devise: 'EUR',
    dateDeclenchement: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    estBloquante: true,
    tags: ['justificatif', 'dépense'],
  },
  {
    id: '4',
    titre: 'Risque financier détecté',
    description: 'Dépassement budgétaire de 15% détecté sur le projet Delta',
    typologie: 'CRITIQUE',
    statut: 'ACQUITTEE',
    severite: 'critical',
    bureau: 'BTP',
    responsable: 'Sophie Bernard',
    responsableId: 'user-4',
    montant: 75000,
    devise: 'EUR',
    dateDeclenchement: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dateAcquittement: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['risque', 'budget'],
  },
  {
    id: '5',
    titre: 'SLA dépassé - Validation BC',
    description: 'Le délai SLA de 48h pour la validation BC #BC-123 a été dépassé',
    typologie: 'SLA',
    statut: 'EN_COURS',
    severite: 'warning',
    bureau: 'BS',
    responsable: 'Anne Moreau',
    responsableId: 'user-6',
    dateDeclenchement: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    estSla: true,
    tags: ['sla', 'validation'],
  },
];

// ================================
// Fonctions API
// ================================

/**
 * Récupère toutes les alertes avec filtres optionnels
 */
export async function getAlertes(filtres?: AlerteFiltres): Promise<Alerte[]> {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 300));

  let result = [...mockAlertes];

  // Appliquer les filtres
  if (filtres) {
    if (filtres.typologies && filtres.typologies.length > 0) {
      result = result.filter((a) => filtres.typologies!.includes(a.typologie));
    }
    if (filtres.statuts && filtres.statuts.length > 0) {
      result = result.filter((a) => filtres.statuts!.includes(a.statut));
    }
    if (filtres.bureaux && filtres.bureaux.length > 0) {
      result = result.filter((a) => filtres.bureaux!.includes(a.bureau));
    }
    if (filtres.responsables && filtres.responsables.length > 0) {
      result = result.filter((a) => a.responsableId && filtres.responsables!.includes(a.responsableId));
    }
    if (filtres.recherche) {
      const searchLower = filtres.recherche.toLowerCase();
      result = result.filter(
        (a) =>
          a.titre.toLowerCase().includes(searchLower) ||
          (a.description && a.description.toLowerCase().includes(searchLower))
      );
    }
  }

  return result;
}

/**
 * Récupère une alerte par ID
 */
export async function getAlerteById(id: string): Promise<Alerte | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockAlertes.find((a) => a.id === id) || null;
}

/**
 * Récupère les statistiques des alertes
 */
export async function getAlertesStats(filtres?: AlerteFiltres): Promise<AlerteStats> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const alertes = await getAlertes(filtres);

  const stats: AlerteStats = {
    total: alertes.length,
    critiques: alertes.filter((a) => a.typologie === 'CRITIQUE').length,
    sla: alertes.filter((a) => a.typologie === 'SLA').length,
    rh: alertes.filter((a) => a.typologie === 'RH').length,
    projets: alertes.filter((a) => a.typologie === 'PROJET').length,
    parBureau: {},
    parTypologie: {
      CRITIQUE: 0,
      SLA: 0,
      RH: 0,
      PROJET: 0,
    },
    parStatut: {
      EN_COURS: 0,
      ACQUITTEE: 0,
      RESOLUE: 0,
    },
  };

  alertes.forEach((alerte) => {
    // Par typologie
    stats.parTypologie[alerte.typologie]++;

    // Par statut
    stats.parStatut[alerte.statut]++;

    // Par bureau
    stats.parBureau[alerte.bureau] = (stats.parBureau[alerte.bureau] || 0) + 1;
  });

  return stats;
}

