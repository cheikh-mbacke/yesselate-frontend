// src/lib/utils/bc-converter.ts
// Utilitaires pour convertir entre EnrichedBC (format UI) et BonCommande (format domaine)

import type { EnrichedBC } from '@/lib/types/document-validation.types';
import type { BonCommande, BCLine } from '@/domain/bcTypes';
import type { FamilyCode } from '@/domain/nomenclature';
import { detectFamilyFromLine } from '@/domain/nomenclature';

/**
 * Convertit un EnrichedBC vers BonCommande pour l'audit
 */
export function convertEnrichedBCToBonCommande(bc: EnrichedBC): BonCommande {
  // Détecter ou utiliser le familyCode
  let familyCode: FamilyCode;
  
  if (bc.familyCode && typeof bc.familyCode === 'string') {
    familyCode = bc.familyCode as FamilyCode;
  } else if (bc.lignes && bc.lignes.length > 0) {
    // Détecter depuis la première ligne
    const detected = detectFamilyFromLine(bc.lignes[0]);
    if (detected) {
      familyCode = detected;
    } else {
      // Fallback : utiliser F10-01 par défaut si rien n'est détecté
      familyCode = 'F10-01' as FamilyCode;
    }
  } else {
    // Fallback par défaut
    familyCode = 'F10-01' as FamilyCode;
  }

  // Convertir les lignes
  const lines: BCLine[] = (bc.lignes || []).map((ligne, idx) => {
    // Parser la quantité (peut être "25 sacs", "1 forfait", etc.)
    const qtyMatch = ligne.quantite.match(/^(\d+(?:[.,]\d+)?)/);
    const qty = qtyMatch ? parseFloat(qtyMatch[1].replace(',', '.')) : 1;

    // Détecter le familyCode de la ligne
    let lineFamilyCode: FamilyCode;
    if (ligne.familyCode && typeof ligne.familyCode === 'string') {
      lineFamilyCode = ligne.familyCode as FamilyCode;
    } else {
      const detected = detectFamilyFromLine(ligne);
      lineFamilyCode = detected || familyCode; // Fallback sur la famille du BC
    }

    return {
      id: ligne.id || `LINE-${idx + 1}`,
      supplierItemRef: ligne.supplierItemRef,
      familyCode: lineFamilyCode,
      designation: ligne.designation,
      qty,
      unitPriceHT: ligne.prixUnitaireHT,
      chantierRefs: ligne.chantierRefs,
      costCenters: ligne.costCenters,
    };
  });

  // Si pas de lignes, créer une ligne par défaut
  if (lines.length === 0) {
    lines.push({
      id: 'LINE-1',
      familyCode,
      designation: bc.objet || 'Service ou produit par défaut',
      qty: 1,
      unitPriceHT: bc.montantHT || 0,
    });
  }

  return {
    id: bc.id,
    supplierId: bc.supplierId || bc.fournisseur,
    supplierName: bc.fournisseur,
    familyCode,
    createdBy: bc.createdBy || bc.bureauEmetteur,
    createdAt: bc.createdAt || bc.dateEmission,
    status: (bc.status as any) || 'pending_bmo',
    paymentMethod: bc.paymentMethod || bc.paiement?.mode,
    deliveryAddress: bc.deliveryAddress || 
      (bc.livraison ? `${bc.livraison.adresse || ''}, ${bc.livraison.ville || ''}`.trim() : undefined),
    vatRate: bc.vatRate || (bc.tva ? bc.tva / 100 : 0.2),
    lines,
    totalHT: bc.montantHT,
  };
}

