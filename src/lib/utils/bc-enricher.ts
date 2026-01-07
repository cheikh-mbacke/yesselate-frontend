// ============================================
// Utilitaire pour enrichir automatiquement les BC
// avec des données par défaut pour l'affichage document
// ============================================

import type { EnrichedBC } from '@/lib/types/document-validation.types';

/**
 * Enrichit un BC avec des données par défaut si elles manquent
 */
export function enrichBCWithDefaults(bc: EnrichedBC): EnrichedBC {
  // Si le BC est déjà complet, on le retourne tel quel
  if (bc.demandeur && bc.fournisseurDetails && bc.projetDetails && bc.livraison && bc.paiement) {
    return bc;
  }

  return {
    ...bc,
    // Demandeur par défaut basé sur le bureau émetteur
    demandeur: bc.demandeur || {
      nom: bc.bureauEmetteur === 'BA' ? 'A. SECK' :
           bc.bureauEmetteur === 'BCT' ? 'M. SARR' :
           bc.bureauEmetteur === 'BMCM' ? 'M. BA' :
           bc.bureauEmetteur === 'BFC' ? 'F. DIOP' :
           'Demandeur',
      fonction: bc.bureauEmetteur === 'BA' ? 'Responsable Approvisionnement' :
                bc.bureauEmetteur === 'BCT' ? 'Responsable Technique' :
                bc.bureauEmetteur === 'BMCM' ? 'Responsable Marché' :
                bc.bureauEmetteur === 'BFC' ? 'Responsable Financier' :
                'Responsable',
      bureau: bc.bureauEmetteur,
      email: `contact@${bc.bureauEmetteur.toLowerCase()}.example.com`,
      telephone: '+221 77 000 00 00',
    },
    // Fournisseur par défaut
    fournisseurDetails: bc.fournisseurDetails || {
      nom: bc.fournisseur,
      siret: 'SN 000 000 000 00000',
      adresse: 'Adresse non renseignée',
      ville: 'Dakar',
      codePostal: '10000',
      pays: 'Sénégal',
      telephone: '+221 33 000 00 00',
      email: `contact@${bc.fournisseur.toLowerCase().replace(/\s+/g, '')}.sn`,
      contactCommercial: 'Contact commercial',
      historiqueCommandes: 0,
      fiabilite: 'moyen' as const,
    },
    // Projet par défaut
    projetDetails: bc.projetDetails || {
      nom: `Projet ${bc.projet}`,
      responsable: 'Responsable Projet',
      budgetTotal: bc.montantTTC * 10, // Estimation
      budgetUtilise: bc.montantTTC * 5,
      budgetRestant: bc.montantTTC * 5,
      avancement: 50,
      dateDebut: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateFinPrevue: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      statut: 'En cours',
    },
    // Livraison par défaut
    livraison: bc.livraison || {
      adresse: 'Adresse de livraison à définir',
      ville: 'Dakar',
      codePostal: '10000',
      pays: 'Sénégal',
      contactLivraison: 'Contact livraison',
      telephone: '+221 77 000 00 00',
      dateLivraisonPrevue: bc.dateLimite,
      instructions: 'Instructions de livraison à préciser',
    },
    // Paiement par défaut
    paiement: bc.paiement || {
      mode: 'virement' as const,
      delai: 30,
      echeance: new Date(new Date(bc.dateLimite).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      acompte: 0,
      conditions: 'Conditions de paiement standard',
    },
    // Lignes par défaut si manquantes
    lignes: bc.lignes || [{
      code: 'ITEM-001',
      designation: bc.objet,
      quantite: '1',
      prixUnitaireHT: bc.montantHT,
      totalHT: bc.montantHT,
    }],
    // Documents par défaut
    documents: bc.documents || [],
    // Historique par défaut
    historique: bc.historique || [{
      id: `HIST-${Date.now()}`,
      date: bc.dateEmission,
      action: 'BC créé',
      auteur: bc.demandeur?.nom || bc.bureauEmetteur,
      details: 'Création du bon de commande',
      type: 'creation' as const,
    }],
    // Notes par défaut
    notes: bc.notes || [],
    // Références par défaut
    references: bc.references || {
      commandeInterne: `CMD-INT-${bc.id}`,
      dossierAchat: `DOS-ACH-${bc.id}`,
    },
  };
}

/**
 * Enrichit une liste de BC avec des données par défaut
 */
export function enrichBCsWithDefaults(bcs: EnrichedBC[]): EnrichedBC[] {
  return bcs.map(enrichBCWithDefaults);
}

