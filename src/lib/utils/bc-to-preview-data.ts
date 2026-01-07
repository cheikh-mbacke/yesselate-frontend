// ============================================
// Utilitaire pour convertir EnrichedBC en PurchaseOrderData
// pour l'affichage dans BonDeCommandePreview
// ============================================

import type { EnrichedBC } from '@/lib/types/document-validation.types';
import type { PurchaseOrderData, PurchaseOrderLine, PurchaseOrderParty, PurchaseOrderMeta } from '@/components/features/bmo/validation-bc/BonDeCommandePreview';

/**
 * Convertit un EnrichedBC en PurchaseOrderData pour l'affichage
 */
export function convertBCToPreviewData(bc: EnrichedBC): PurchaseOrderData {
  // Lignes du bon de commande
  const lines: PurchaseOrderLine[] = (bc.lignes || []).map(ligne => {
    // Parser la quantité (ex: "25 sacs" -> 25, "1 forfait" -> 1)
    const qtyMatch = ligne.quantite.match(/^(\d+(?:[.,]\d+)?)/);
    const qty = qtyMatch ? parseFloat(qtyMatch[1].replace(',', '.')) : 1;
    
    return {
      code: ligne.code,
      qty: qty,
      designation: ligne.designation,
      unitPriceHT: ligne.prixUnitaireHT,
      totalHT: ligne.totalHT,
    };
  });

  // Si pas de lignes, créer une ligne par défaut
  if (lines.length === 0) {
    lines.push({
      designation: bc.objet,
      qty: 1,
      unitPriceHT: bc.montantHT,
      totalHT: bc.montantHT,
    });
  }

  // Métadonnées
  const meta: PurchaseOrderMeta = {
    number: bc.id,
    date: new Date(bc.dateEmission).toLocaleDateString('fr-FR'),
    yourName: bc.demandeur?.nom || bc.bureauEmetteur,
    yourRole: bc.demandeur?.fonction || 'Demandeur',
    paymentMethod: bc.paiement?.mode || 'virement',
    signature: bc.demandeur?.nom || '',
  };

  // Customer (demandeur)
  const customer: PurchaseOrderParty = {
    company: bc.demandeur?.nom || bc.bureauEmetteur,
    contact: bc.demandeur?.fonction || '',
    address1: bc.demandeur?.bureau || '',
    phone: bc.demandeur?.telephone || '',
    vatNumber: bc.demandeur?.email || '',
  };

  // Supplier (fournisseur)
  const supplier: PurchaseOrderParty = {
    company: bc.fournisseurDetails?.nom || bc.fournisseur,
    contact: bc.fournisseurDetails?.contactCommercial || '',
    address1: bc.fournisseurDetails?.adresse || '',
    city: bc.fournisseurDetails?.ville || '',
    postalCode: bc.fournisseurDetails?.codePostal || '',
    country: bc.fournisseurDetails?.pays || 'Sénégal',
    phone: bc.fournisseurDetails?.telephone || '',
    fax: bc.fournisseurDetails?.email || '',
    vatNumber: bc.fournisseurDetails?.siret || '',
  };

  // Delivery (livraison)
  const delivery: PurchaseOrderParty | undefined = bc.livraison ? {
    company: bc.livraison.contactLivraison || '',
    address1: bc.livraison.adresse || '',
    city: bc.livraison.ville || '',
    postalCode: bc.livraison.codePostal || '',
    country: bc.livraison.pays || 'Sénégal',
    phone: bc.livraison.telephone || '',
  } : undefined;

  // Notes band (instructions de livraison ou notes)
  const notesBandText = bc.livraison?.instructions || 
    (bc.notes && bc.notes.length > 0 ? bc.notes.map(n => n.contenu).join(' | ') : 
    'Indications et informations particulières destinées à votre client.');

  return {
    meta,
    supplier,
    customer,
    delivery,
    lines,
    vatRate: (bc.tva || 20) / 100, // Convertir 20% en 0.20
    currency: 'FCFA',
    notesBandText,
    logoText: 'YESSALATE',
  };
}

