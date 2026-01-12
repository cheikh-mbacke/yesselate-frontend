/**
 * Statistics Utilities
 * Helpers pour les calculs statistiques
 */

/**
 * Calcule la moyenne d'un tableau de nombres
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calcule la médiane d'un tableau de nombres
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calcule le mode (valeur la plus fréquente)
 */
export function calculateMode(values: number[]): number | null {
  if (values.length === 0) return null;
  
  const frequency: Record<number, number> = {};
  values.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
  });
  
  let maxFreq = 0;
  let mode: number | null = null;
  
  Object.entries(frequency).forEach(([val, freq]) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = Number(val);
    }
  });
  
  return mode;
}

/**
 * Calcule l'écart-type
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = calculateMean(squaredDiffs);
  
  return Math.sqrt(variance);
}

/**
 * Calcule la variance
 */
export function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  
  return calculateMean(squaredDiffs);
}

/**
 * Calcule le minimum et maximum
 */
export function calculateMinMax(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 };
  
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

/**
 * Calcule le quartile (Q1, Q2, Q3)
 */
export function calculateQuartiles(values: number[]): {
  q1: number;
  q2: number;
  q3: number;
} {
  if (values.length === 0) return { q1: 0, q2: 0, q3: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  const q2 = calculateMedian(sorted);
  const q1 = calculateMedian(sorted.slice(0, mid));
  const q3 = calculateMedian(sorted.slice(mid));
  
  return { q1, q2, q3 };
}

/**
 * Calcule le pourcentage de changement
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calcule la croissance moyenne (CAGR)
 */
export function calculateCAGR(
  startValue: number,
  endValue: number,
  periods: number
): number {
  if (startValue === 0 || periods === 0) return 0;
  return (Math.pow(endValue / startValue, 1 / periods) - 1) * 100;
}

/**
 * Calcule la corrélation entre deux séries
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);
  
  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;
  
  for (let i = 0; i < x.length; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    sumSqX += diffX * diffX;
    sumSqY += diffY * diffY;
  }
  
  const denominator = Math.sqrt(sumSqX * sumSqY);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calcule les statistiques complètes
 */
export function calculateStatistics(values: number[]): {
  count: number;
  mean: number;
  median: number;
  mode: number | null;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q2: number;
  q3: number;
} {
  const { min, max } = calculateMinMax(values);
  const { q1, q2, q3 } = calculateQuartiles(values);
  
  return {
    count: values.length,
    mean: calculateMean(values),
    median: calculateMedian(values),
    mode: calculateMode(values),
    stdDev: calculateStandardDeviation(values),
    variance: calculateVariance(values),
    min,
    max,
    range: max - min,
    q1,
    q2,
    q3,
  };
}

