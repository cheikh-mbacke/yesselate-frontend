/**
 * Service client pour la gestion des risques et opportunités (DemandRisk)
 */

export type Risk = {
  id: string;
  demandId: string;
  category: string; // "Juridique", "Budget", "SLA", "Réputation", "Technique"
  opportunity: number; // 0 = risque, 1 = opportunité
  probability: number; // 1..5
  impact: number; // 1..5
  mitigation?: string | null;
  ownerName?: string | null;
  createdAt: string;
};

export type AddRiskPayload = {
  category: string;
  opportunity?: boolean;
  probability: number; // 1..5
  impact: number; // 1..5
  mitigation?: string;
  ownerName?: string;
};

export type UpdateRiskPayload = {
  category?: string;
  opportunity?: boolean;
  probability?: number; // 1..5
  impact?: number; // 1..5
  mitigation?: string | null;
  ownerName?: string | null;
};

/**
 * Liste tous les risques d'une demande
 */
export async function listRisks(demandId: string): Promise<Risk[]> {
  const res = await fetch(`/api/demands/${demandId}/risks`);
  if (!res.ok) throw new Error(`Failed to fetch risks: ${res.status}`);
  const data = await res.json();
  return data.rows;
}

/**
 * Ajoute un risque ou une opportunité à une demande
 */
export async function addRisk(demandId: string, payload: AddRiskPayload): Promise<Risk> {
  const res = await fetch(`/api/demands/${demandId}/risks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  return data.row;
}

/**
 * Met à jour un risque
 */
export async function updateRisk(
  demandId: string,
  riskId: string,
  payload: UpdateRiskPayload
): Promise<Risk> {
  const res = await fetch(`/api/demands/${demandId}/risks/${riskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  return data.row;
}

/**
 * Supprime un risque
 */
export async function removeRisk(demandId: string, riskId: string): Promise<boolean> {
  const res = await fetch(`/api/demands/${demandId}/risks/${riskId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return true;
}

/**
 * Calcule le score de criticité d'un risque (probability × impact)
 */
export function calculateRiskScore(probability: number, impact: number): number {
  return probability * impact;
}

/**
 * Détermine le niveau de criticité basé sur le score
 */
export function getRiskCriticality(score: number): {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
} {
  if (score >= 16)
    return {
      label: 'CRITIQUE',
      color: 'red',
      bgClass: 'bg-red-500/12',
      textClass: 'text-red-300',
    };
  if (score >= 9)
    return {
      label: 'ÉLEVÉ',
      color: 'orange',
      bgClass: 'bg-orange-500/12',
      textClass: 'text-orange-300',
    };
  if (score >= 4)
    return {
      label: 'MOYEN',
      color: 'yellow',
      bgClass: 'bg-yellow-500/12',
      textClass: 'text-yellow-300',
    };
  return {
    label: 'FAIBLE',
    color: 'green',
    bgClass: 'bg-emerald-500/12',
    textClass: 'text-emerald-300',
  };
}

