/**
 * API mock pour le module Alertes & Risques
 * Simule les appels API avec des données réalistes
 */

import type {
  Alerte,
  AlerteStats,
  AlerteTypologie,
  AlerteSeverite,
  AlerteStatut,
  AlerteFiltres,
} from '../types/alertesTypes';

// ================================
// Données mock
// ================================

const mockAlertes: Alerte[] = [
  {
    id: '1',
    titre: 'Paiement bloqué - Facture #12345',
    description: 'Le paiement de la facture #12345 est bloqué depuis 5 jours',
    severite: 'critical',
    statut: 'pending',
    typologie: 'paiement-bloque',
    bureau: 'BTP',
    projet: 'Projet Alpha',
    responsable: 'Jean Dupont',
    responsableId: 'user-1',
    dateCreation: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dateModification: new Date(Date.now() - 1 * 60 * 60 * 1000),
    dateEcheance: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    montant: 50000,
    devise: 'EUR',
    tags: ['paiement', 'facture', 'urgent'],
  },
  {
    id: '2',
    titre: 'Validation BC en attente',
    description: 'La validation du bon de commande #BC-789 est en attente depuis 3 jours',
    severite: 'warning',
    statut: 'pending',
    typologie: 'validation-bloquee',
    bureau: 'BJ',
    projet: 'Projet Beta',
    responsable: 'Marie Martin',
    responsableId: 'user-2',
    dateCreation: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    dateModification: new Date(Date.now() - 2 * 60 * 60 * 1000),
    slaType: 'validation-bc',
    slaDelai: 48,
    slaDepasse: false,
    tags: ['validation', 'bc'],
  },
  {
    id: '3',
    titre: 'Justificatif manquant - Dépense #456',
    description: 'Le justificatif pour la dépense #456 n\'a pas été fourni',
    severite: 'critical',
    statut: 'pending',
    typologie: 'justificatif-manquant',
    bureau: 'BS',
    projet: 'Projet Gamma',
    responsable: 'Pierre Durand',
    responsableId: 'user-3',
    dateCreation: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    dateModification: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    montant: 15000,
    devise: 'EUR',
    tags: ['justificatif', 'dépense'],
  },
  {
    id: '4',
    titre: 'Risque financier détecté',
    description: 'Dépassement budgétaire de 15% détecté sur le projet Delta',
    severite: 'critical',
    statut: 'acknowledged',
    typologie: 'risque-financier',
    bureau: 'BTP',
    projet: 'Projet Delta',
    responsable: 'Sophie Bernard',
    responsableId: 'user-4',
    dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    dateModification: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    dateAcquittement: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    montant: 75000,
    devise: 'EUR',
    tags: ['risque', 'budget'],
  },
  {
    id: '5',
    titre: 'Délai approchant - Livraison prévue',
    description: 'La livraison prévue pour le 15/12/2024 approche (3 jours restants)',
    severite: 'warning',
    statut: 'in_progress',
    typologie: 'delai-approchant',
    bureau: 'BJ',
    projet: 'Projet Epsilon',
    responsable: 'Luc Petit',
    responsableId: 'user-5',
    dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    dateModification: new Date(Date.now() - 2 * 60 * 60 * 1000),
    dateEcheance: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    tags: ['délai', 'livraison'],
  },
  {
    id: '6',
    titre: 'SLA dépassé - Validation BC',
    description: 'Le délai SLA de 48h pour la validation BC #BC-123 a été dépassé',
    severite: 'warning',
    statut: 'pending',
    typologie: 'sla-validation-bc',
    bureau: 'BS',
    projet: 'Projet Zeta',
    responsable: 'Anne Moreau',
    responsableId: 'user-6',
    dateCreation: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    dateModification: new Date(Date.now() - 1 * 60 * 60 * 1000),
    slaType: 'validation-bc',
    slaDelai: 48,
    slaDepasse: true,
    tags: ['sla', 'validation'],
  },
  {
    id: '7',
    titre: 'Document incomplet - Contrat #789',
    description: 'Le contrat #789 est incomplet, pièces manquantes',
    severite: 'warning',
    statut: 'pending',
    typologie: 'document-incomplet',
    bureau: 'BTP',
    projet: 'Projet Eta',
    responsable: 'Thomas Roux',
    responsableId: 'user-7',
    dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    dateModification: new Date(Date.now() - 4 * 60 * 60 * 1000),
    tags: ['document', 'contrat'],
  },
  {
    id: '8',
    titre: 'Alerte résolue - Paiement effectué',
    description: 'Le paiement de la facture #98765 a été effectué avec succès',
    severite: 'info',
    statut: 'resolved',
    typologie: 'paiement-bloque',
    bureau: 'BJ',
    projet: 'Projet Theta',
    responsable: 'Julie Blanc',
    responsableId: 'user-8',
    dateCreation: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    dateModification: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    dateResolution: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    resolutionType: 'manual',
    montant: 30000,
    devise: 'EUR',
    tags: ['paiement', 'résolu'],
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
    if (filtres.severites && filtres.severites.length > 0) {
      result = result.filter((a) => filtres.severites!.includes(a.severite));
    }
    if (filtres.statuts && filtres.statuts.length > 0) {
      result = result.filter((a) => filtres.statuts!.includes(a.statut));
    }
    if (filtres.typologies && filtres.typologies.length > 0) {
      result = result.filter((a) => filtres.typologies!.includes(a.typologie));
    }
    if (filtres.bureaux && filtres.bureaux.length > 0) {
      result = result.filter((a) => a.bureau && filtres.bureaux!.includes(a.bureau));
    }
    if (filtres.responsables && filtres.responsables.length > 0) {
      result = result.filter((a) => a.responsableId && filtres.responsables!.includes(a.responsableId));
    }
    if (filtres.recherche) {
      const searchLower = filtres.recherche.toLowerCase();
      result = result.filter(
        (a) =>
          a.titre.toLowerCase().includes(searchLower) ||
          a.description.toLowerCase().includes(searchLower)
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
    parSeverite: {
      critical: 0,
      warning: 0,
      info: 0,
      success: 0,
    },
    parStatut: {
      pending: 0,
      acknowledged: 0,
      in_progress: 0,
      resolved: 0,
      escalated: 0,
      ignored: 0,
      recurring: 0,
    },
    parTypologie: {} as Record<AlerteTypologie, number>,
    parBureau: {},
    parResponsable: {},
    slaDepasses: 0,
    tempsMoyenResolution: 0,
    tempsMoyenReponse: 0,
    tauxResolution: 0,
    tauxAcquittement: 0,
  };

  let totalResolutionTime = 0;
  let totalResponseTime = 0;
  let resolvedCount = 0;
  let acknowledgedCount = 0;

  alertes.forEach((alerte) => {
    // Par sévérité
    stats.parSeverite[alerte.severite]++;

    // Par statut
    stats.parStatut[alerte.statut]++;

    // Par typologie
    stats.parTypologie[alerte.typologie] = (stats.parTypologie[alerte.typologie] || 0) + 1;

    // Par bureau
    if (alerte.bureau) {
      stats.parBureau[alerte.bureau] = (stats.parBureau[alerte.bureau] || 0) + 1;
    }

    // Par responsable
    if (alerte.responsableId) {
      stats.parResponsable[alerte.responsableId] = (stats.parResponsable[alerte.responsableId] || 0) + 1;
    }

    // SLA dépassés
    if (alerte.slaDepasse) {
      stats.slaDepasses++;
    }

    // Temps de résolution
    if (alerte.dateResolution && alerte.dateCreation) {
      const resolutionTime = alerte.dateResolution.getTime() - alerte.dateCreation.getTime();
      totalResolutionTime += resolutionTime;
      resolvedCount++;
    }

    // Temps de réponse
    if (alerte.dateAcquittement && alerte.dateCreation) {
      const responseTime = alerte.dateAcquittement.getTime() - alerte.dateCreation.getTime();
      totalResponseTime += responseTime;
      acknowledgedCount++;
    }
  });

  // Calculer les moyennes
  if (resolvedCount > 0) {
    stats.tempsMoyenResolution = totalResolutionTime / resolvedCount / (1000 * 60 * 60); // en heures
  }
  if (acknowledgedCount > 0) {
    stats.tempsMoyenReponse = totalResponseTime / acknowledgedCount / (1000 * 60 * 60); // en heures
  }

  // Taux de résolution
  if (alertes.length > 0) {
    stats.tauxResolution = (resolvedCount / alertes.length) * 100;
    stats.tauxAcquittement = (acknowledgedCount / alertes.length) * 100;
  }

  return stats;
}

/**
 * Récupère les alertes par typologie
 */
export async function getAlertesByTypologie(
  typologie: AlerteTypologie,
  filtres?: AlerteFiltres
): Promise<Alerte[]> {
  const allFiltres: AlerteFiltres = {
    ...filtres,
    typologies: [typologie],
  };
  return getAlertes(allFiltres);
}

/**
 * Récupère les alertes par sévérité
 */
export async function getAlertesBySeverite(
  severite: AlerteSeverite,
  filtres?: AlerteFiltres
): Promise<Alerte[]> {
  const allFiltres: AlerteFiltres = {
    ...filtres,
    severites: [severite],
  };
  return getAlertes(allFiltres);
}

/**
 * Récupère les alertes par statut
 */
export async function getAlertesByStatut(
  statut: AlerteStatut,
  filtres?: AlerteFiltres
): Promise<Alerte[]> {
  const allFiltres: AlerteFiltres = {
    ...filtres,
    statuts: [statut],
  };
  return getAlertes(allFiltres);
}

/**
 * Acquitte une alerte
 */
export async function acknowledgeAlerte(
  id: string,
  note?: string,
  userId?: string
): Promise<Alerte> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const alerte = mockAlertes.find((a) => a.id === id);
  if (!alerte) {
    throw new Error(`Alerte ${id} introuvable`);
  }

  alerte.statut = 'acknowledged';
  alerte.dateAcquittement = new Date();
  if (note) {
    alerte.notes = alerte.notes || [];
    alerte.notes.push({
      id: `note-${Date.now()}`,
      auteur: userId || 'current-user',
      auteurId: userId || 'current-user',
      contenu: note,
      dateCreation: new Date(),
      type: 'note',
    });
  }

  return alerte;
}

/**
 * Résout une alerte
 */
export async function resolveAlerte(
  id: string,
  resolutionType: 'manual' | 'automatic' | 'ai-assisted',
  note?: string,
  userId?: string
): Promise<Alerte> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const alerte = mockAlertes.find((a) => a.id === id);
  if (!alerte) {
    throw new Error(`Alerte ${id} introuvable`);
  }

  alerte.statut = 'resolved';
  alerte.dateResolution = new Date();
  alerte.resolutionType = resolutionType;
  if (note) {
    alerte.notes = alerte.notes || [];
    alerte.notes.push({
      id: `note-${Date.now()}`,
      auteur: userId || 'current-user',
      auteurId: userId || 'current-user',
      contenu: note,
      dateCreation: new Date(),
      type: 'resolution',
    });
  }

  return alerte;
}

/**
 * Escalade une alerte
 */
export async function escalateAlerte(
  id: string,
  escalateTo: string,
  reason: string,
  priority: 'low' | 'medium' | 'high' | 'critical',
  userId?: string
): Promise<Alerte> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const alerte = mockAlertes.find((a) => a.id === id);
  if (!alerte) {
    throw new Error(`Alerte ${id} introuvable`);
  }

  alerte.statut = 'escalated';
  alerte.dateEscalade = new Date();
  alerte.escalatedTo = escalateTo;
  alerte.notes = alerte.notes || [];
  alerte.notes.push({
    id: `note-${Date.now()}`,
    auteur: userId || 'current-user',
    auteurId: userId || 'current-user',
    contenu: `Escalade vers ${escalateTo}: ${reason}`,
    dateCreation: new Date(),
    type: 'escalation',
  });

  return alerte;
}

