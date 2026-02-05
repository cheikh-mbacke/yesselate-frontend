/**
 * API Client pour la gestion des stakeholders (parties prenantes)
 * Utilisable côté client (Client Components)
 */

export type Stakeholder = {
  id: string;
  demandId: string;
  personId: string;
  personName: string;
  role: string; // "OWNER" | "APPROVER" | "REVIEWER" | "CONTRIBUTOR" | "INFORMED"
  required: number; // 0 = false, 1 = true
  note?: string | null;
  createdAt: string;
};

export type AddStakeholderPayload = {
  personId: string;
  personName: string;
  role: string; // "OWNER" | "APPROVER" | "REVIEWER" | "CONTRIBUTOR" | "INFORMED"
  required?: boolean;
  note?: string;
};

/**
 * Liste tous les stakeholders d'une demande
 */
export async function listStakeholders(demandId: string): Promise<Stakeholder[]> {
  const res = await fetch(`/api/demands/${demandId}/stakeholders`);
  if (!res.ok) throw new Error(`Failed to fetch stakeholders: ${res.status}`);
  const data = await res.json();
  return data.rows; // La nouvelle API retourne "rows"
}

/**
 * Ajoute un stakeholder à une demande
 */
export async function addStakeholder(
  demandId: string,
  payload: AddStakeholderPayload
): Promise<Stakeholder> {
  const res = await fetch(`/api/demands/${demandId}/stakeholders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to add stakeholder: ${res.status}`);
  }
  
  const data = await res.json();
  return data.row; // La nouvelle API retourne "row"
}

/**
 * Supprime un stakeholder d'une demande
 */
export async function removeStakeholder(demandId: string, stakeholderId: string): Promise<void> {
  const res = await fetch(`/api/demands/${demandId}/stakeholders/${stakeholderId}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to remove stakeholder: ${res.status}`);
  }
}

