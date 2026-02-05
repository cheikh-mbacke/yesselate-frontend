/**
 * Color Utilities
 * Utilitaires pour les couleurs et thèmes
 */

/**
 * Convertit une couleur hex en RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convertit RGB en hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Calcule la luminosité d'une couleur (0-255)
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  // Formule de luminosité relative
  const { r, g, b } = rgb;
  return (0.299 * r + 0.587 * g + 0.114 * b);
}

/**
 * Détermine si une couleur est claire ou sombre
 */
export function isLightColor(hex: string): boolean {
  return getLuminance(hex) > 128;
}

/**
 * Assombrit une couleur
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const { r, g, b } = rgb;
  return rgbToHex(
    Math.max(0, Math.floor(r * (1 - percent))),
    Math.max(0, Math.floor(g * (1 - percent))),
    Math.max(0, Math.floor(b * (1 - percent)))
  );
}

/**
 * Éclaircit une couleur
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const { r, g, b } = rgb;
  return rgbToHex(
    Math.min(255, Math.floor(r + (255 - r) * percent)),
    Math.min(255, Math.floor(g + (255 - g) * percent)),
    Math.min(255, Math.floor(b + (255 - b) * percent))
  );
}

/**
 * Génère une couleur à partir d'une string (pour avatars, etc.)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Obtient la couleur de contraste appropriée (noir ou blanc)
 */
export function getContrastColor(hex: string): string {
  return isLightColor(hex) ? '#000000' : '#ffffff';
}

/**
 * Couleurs de statut prédéfinies
 */
export const statusColors = {
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  pending: '#6B7280',
  loading: '#3B82F6',
  paused: '#F59E0B',
  active: '#10B981',
} as const;

/**
 * Obtient la couleur pour un statut
 */
export function getStatusColor(status: keyof typeof statusColors): string {
  return statusColors[status];
}

