/**
 * API Demandes - Simulation d'appels API REST
 * Simule des appels à une API tierce avec délais réalistes
 */

import type { Demand } from '../types/bmo.types';

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yesselate.local';
const API_DELAY = parseInt(process.env.NEXT_PUBLIC_API_DELAY || '500', 10);

// Helper pour simuler un délai réseau
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper pour simuler des erreurs aléatoires (10% de chance)
const shouldSimulateError = () => Math.random() < 0.1;

/**
 * Récupère toutes les demandes
 */
export async function fetchAllDemands(): Promise<{ data: Demand[]; error?: string }> {
  try {
    await delay(API_DELAY);

    if (shouldSimulateError()) {
      throw new Error('Erreur réseau simulée');
    }

    // Simulation d'appel API
    const response = await fetch(`${API_BASE_URL}/api/demands`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }).catch(() => {
      // Si l'API n'existe pas, on retourne des données locales
      return null;
    });

    if (!response) {
      // Fallback sur données locales
      const { demands } = await import('../data');
      return { data: demands as Demand[] };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Récupère une demande par ID
 */
export async function fetchDemandById(id: string): Promise<{ data: Demand | null; error?: string }> {
  try {
    await delay(API_DELAY * 0.5);

    const response = await fetch(`${API_BASE_URL}/api/demands/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }).catch(() => null);

    if (!response) {
      const { demands } = await import('../data');
      const demand = (demands as Demand[]).find((d) => d.id === id);
      return { data: demand || null };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Valide une demande
 */
export async function validateDemand(
  demandId: string,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await delay(API_DELAY);

    if (shouldSimulateError()) {
      throw new Error('Échec de la validation');
    }

    const response = await fetch(`${API_BASE_URL}/api/demands/${demandId}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ comment }),
    }).catch(() => null);

    if (!response) {
      // Simulation locale
      console.log(`[API Simulation] Demande ${demandId} validée avec succès`);
      return { success: true };
    }

    const data = await response.json();
    return { success: data.success || true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Rejette une demande
 */
export async function rejectDemand(
  demandId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await delay(API_DELAY);

    if (shouldSimulateError()) {
      throw new Error('Échec du rejet');
    }

    const response = await fetch(`${API_BASE_URL}/api/demands/${demandId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ reason }),
    }).catch(() => null);

    if (!response) {
      // Simulation locale
      console.log(`[API Simulation] Demande ${demandId} rejetée: ${reason}`);
      return { success: true };
    }

    const data = await response.json();
    return { success: data.success || true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Exporte les demandes en PDF
 */
export async function exportDemandsToPDF(filters?: {
  bureau?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ url: string | null; error?: string }> {
  try {
    await delay(API_DELAY * 2);

    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await fetch(`${API_BASE_URL}/api/demands/export/pdf?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }).catch(() => null);

    if (!response) {
      // Simulation locale
      const mockUrl = `data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNSAwIG9iag...`;
      console.log('[API Simulation] Export PDF généré');
      return { url: mockUrl };
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return { url };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Récupère les statistiques SLA
 */
export async function fetchSLAStats(bureau?: string): Promise<{
  data: {
    total: number;
    pending: number;
    overdue: number;
    compliance: number;
    avgDelay: number;
  } | null;
  error?: string;
}> {
  try {
    await delay(API_DELAY);

    const url = bureau
      ? `${API_BASE_URL}/api/sla/stats?bureau=${bureau}`
      : `${API_BASE_URL}/api/sla/stats`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }).catch(() => null);

    if (!response) {
      // Calcul local
      const { demands } = await import('../data');
      const filtered = bureau
        ? (demands as Demand[]).filter((d) => d.bureau === bureau)
        : (demands as Demand[]);

      const total = filtered.length;
      const pending = filtered.filter((d) => (d.status ?? 'pending') === 'pending').length;
      const overdue = filtered.filter((d) => {
        const delay = calcDelay(d.date);
        return delay > 7 && d.status !== 'validated';
      }).length;
      const compliance = total > 0 ? Math.round(((total - overdue) / total) * 100) : 0;
      const avgDelay = total > 0
        ? Math.round(filtered.reduce((sum, d) => sum + calcDelay(d.date), 0) / total)
        : 0;

      return {
        data: { total, pending, overdue, compliance, avgDelay },
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

// ============================================
// HELPERS
// ============================================

function getAuthToken(): string {
  // Dans une vraie app, récupérer depuis le store d'authentification
  return 'mock-jwt-token-123456';
}

function calcDelay(dateStr: string): number {
  const [d, m, y] = (dateStr ?? '').split('/').map(Number);
  if (!d || !m || !y) return 0;
  const t = new Date(y, m - 1, d).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.ceil((Date.now() - t) / 86400000));
}

