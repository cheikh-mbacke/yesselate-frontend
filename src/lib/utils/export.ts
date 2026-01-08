// ============================================
// Fonctions d'export CSV avec traçabilité BMO
// ============================================

import type { Facture } from '@/lib/types/bmo.types';

/**
 * Exporte les factures au format CSV avec toutes les informations de traçabilité BMO
 * 
 * @param factures - Liste des factures à exporter
 * @param addToast - Fonction pour afficher une notification (optionnel)
 * 
 * @example
 * ```tsx
 * import { exportFacturesAsCSV } from '@/lib/utils/export';
 * 
 * const handleExport = () => {
 *   exportFacturesAsCSV(factures, addToast);
 * };
 * ```
 */
export const exportFacturesAsCSV = (
  factures: Facture[],
  addToast?: (msg: string, variant?: 'success' | 'warning' | 'info' | 'error') => void
) => {
  const headers = [
    'ID Facture',
    'Fournisseur',
    'Chantier',
    'Montant TTC (FCFA)',
    'Statut',
    'Origine décisionnelle',
    'ID décision',
    'Rôle RACI',
    'Hash traçabilité',
    'Commentaire BMO',
  ];

  const rows = factures.map(f => [
    f.id,
    f.fournisseur,
    f.chantier,
    f.montantTTC.toString(),
    f.statut,
    f.decisionBMO?.origin || 'Hors périmètre BMO',
    f.decisionBMO?.decisionId || '',
    f.decisionBMO?.validatorRole || '',
    f.decisionBMO?.hash || '',
    `"${f.decisionBMO?.comment || f.commentaire || ''}"`,
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `factures_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  if (addToast) {
    addToast('✅ Export factures généré (traçabilité BMO incluse)', 'success');
  }
};



