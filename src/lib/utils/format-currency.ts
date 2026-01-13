/**
 * Formatage des montants en francs CFA
 */

/**
 * Parse un montant depuis différentes sources (string, number, etc.)
 * Gère les formats avec espaces, virgules, points, et symboles FCFA/XOF
 * @param v - La valeur à parser
 * @returns Le nombre parsé, ou 0 si invalide
 */
export const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  
  const s = String(v ?? '')
    .replace(/\s/g, '')
    .replace(/FCFA|XOF|F\s?CFA/gi, '')
    .replace(/[^\d,.-]/g, '');
  
  if (!s) return 0;
  
  // Gérer différents formats :
  // - "2,150,000.50" -> virgules = milliers, point = décimales (format US)
  // - "2150000,50" -> point = milliers, virgule = décimales (format FR)
  // - "2 150 000,50" -> espaces déjà supprimés
  const hasDecimalPoint = s.includes('.');
  const hasDecimalComma = s.includes(',');
  
  let normalized: string;
  if (hasDecimalPoint && hasDecimalComma) {
    // Format mixte : déterminer quel est le séparateur décimal
    const lastPoint = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');
    if (lastPoint > lastComma) {
      // Point est le décimal (format US: "2,150,000.50")
      normalized = s.replace(/,/g, '');
    } else {
      // Virgule est le décimal (format FR: "2.150.000,50")
      normalized = s.replace(/\./g, '').replace(',', '.');
    }
  } else if (hasDecimalPoint) {
    // Point peut être décimal ou milliers (si plusieurs points = milliers)
    const pointCount = (s.match(/\./g) || []).length;
    normalized = pointCount > 1 ? s.replace(/\./g, '') : s; // Plusieurs points = milliers
  } else if (hasDecimalComma) {
    // Virgule peut être décimal ou milliers (si plusieurs virgules = milliers)
    const commaCount = (s.match(/,/g) || []).length;
    normalized = commaCount > 1 ? s.replace(/,/g, '') : s.replace(',', '.'); // Plusieurs virgules = milliers
  } else {
    // Pas de séparateur décimal
    normalized = s.replace(/,/g, '').replace(/\./g, '');
  }
  
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Formate un nombre en montant FCFA avec séparateur de milliers
 * @param n - Le montant à formater
 * @returns Le montant formaté (ex: "1 234 567 FCFA")
 */
export const formatFCFA = (n: number | string | null | undefined): string => {
  if (n === null || n === undefined) return '0 FCFA';
  
  const num = typeof n === 'number' ? n : parseMoney(n);
  
  if (!Number.isFinite(num)) return '0 FCFA';
  
  return `${num.toLocaleString('fr-FR')} FCFA`;
};

/**
 * Formate un nombre en montant FCFA avec symbole monétaire XOF
 * @param n - Le montant à formater
 * @returns Le montant formaté (ex: "1 234 567 XOF")
 */
export const formatFCFAWithCurrency = (n: number | string | null | undefined): string => {
  if (n === null || n === undefined) return '0 XOF';
  
  const num = typeof n === 'number' ? n : parseMoney(n);
  
  if (!Number.isFinite(num)) return '0 XOF';
  
  return num.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
};

