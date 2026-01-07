/**
 * Utilitaires de formatage et parsing de dates
 */

/**
 * Parse une date au format français (DD/MM/YYYY ou DD/MM/YY)
 * @param d - La date à parser au format "DD/MM/YYYY" ou "DD/MM/YY"
 * @returns L'objet Date parsé, ou null si invalide
 */
export const parseFRDate = (d?: string | null): Date | null => {
  if (!d) return null;
  
  const parts = d.split('/').map(s => s.trim()).filter(Boolean);
  if (parts.length !== 3) return null;
  
  const [dd, mm, yy] = parts.map(Number);
  
  // Vérifier que ce sont des nombres valides
  if (!Number.isFinite(dd) || !Number.isFinite(mm) || !Number.isFinite(yy)) {
    return null;
  }
  
  // Gérer les années à 2 chiffres (assumer 2000-2099)
  const year = yy < 100 ? 2000 + yy : yy;
  
  // Vérifier que le mois est valide (1-12)
  if (mm < 1 || mm > 12) return null;
  
  // Vérifier que le jour est valide (1-31, sera validé par Date)
  if (dd < 1 || dd > 31) return null;
  
  const date = new Date(year, mm - 1, dd);
  
  // Vérifier que la date est valide (ex: pas de 31 février)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== mm - 1 ||
    date.getDate() !== dd
  ) {
    return null;
  }
  
  return date;
};

/**
 * Formate une date au format français (DD/MM/YYYY)
 * @param date - L'objet Date à formater
 * @returns La date formatée "DD/MM/YYYY", ou null si invalide
 */
export const formatFRDate = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (!(d instanceof Date) || !Number.isFinite(d.getTime())) {
    return null;
  }
  
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Formate une date au format ISO (YYYY-MM-DD) pour les inputs HTML
 * @param date - L'objet Date à formater
 * @returns La date formatée "YYYY-MM-DD", ou null si invalide
 */
export const formatISODate = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (!(d instanceof Date) || !Number.isFinite(d.getTime())) {
    return null;
  }
  
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Vérifie si une date est dans une plage
 * @param date - La date à vérifier
 * @param from - Date de début (optionnelle)
 * @param to - Date de fin (optionnelle)
 * @returns true si la date est dans la plage, false sinon
 */
export const isDateInRange = (
  date: Date | string | null | undefined,
  from?: Date | string | null,
  to?: Date | string | null
): boolean => {
  if (!date) return false;
  
  const d = typeof date === 'string' ? parseFRDate(date) || new Date(date) : date;
  if (!(d instanceof Date) || !Number.isFinite(d.getTime())) return false;
  
  if (from) {
    const fromDate = typeof from === 'string' ? parseFRDate(from) || new Date(from) : from;
    if (fromDate instanceof Date && d < fromDate) return false;
  }
  
  if (to) {
    const toDate = typeof to === 'string' ? parseFRDate(to) || new Date(to) : to;
    if (toDate instanceof Date && d > toDate) return false;
  }
  
  return true;
};

