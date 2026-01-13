import type { Demand } from '@/lib/types/bmo.types';

export type Queue = 'pending' | 'urgent' | 'overdue' | 'validated' | 'rejected' | 'all';

export type TransitionPayload = {
  action: 'validate' | 'reject' | 'assign' | 'request_complement';
  actorId?: string;
  actorName?: string;
  details?: string;
  message?: string;
  employeeId?: string;
  employeeName?: string;
};

export type BatchTransitionResult = {
  updated: string[];
  skipped: Array<{ id: string; reason: string }>;
};

export async function listDemands(queue: Queue, q = ''): Promise<Demand[]> {
  const params = new URLSearchParams();
  if (queue !== 'all') params.set('queue', queue);
  if (q.trim()) params.set('q', q.trim());

  const res = await fetch(`/api/demands?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Impossible de charger la liste');
  const json = await res.json();
  return (json.items ?? json.rows ?? []) as Demand[];
}

export async function getDemand(id: string): Promise<{ demand: Demand; item?: Demand }> {
  const res = await fetch(`/api/demands/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Demande introuvable');
  const json = await res.json();
  // Compatibilité : l'API retourne soit .demand soit .item
  return { demand: json.demand ?? json.item, item: json.item ?? json.demand };
}

export async function transitionDemand(id: string, payload: TransitionPayload): Promise<Demand> {
  const res = await fetch(`/api/demands/${encodeURIComponent(id)}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? 'Transition impossible');
  }
  const json = await res.json();
  return json.demand as Demand;
}

export async function batchTransition(ids: string[], payload: TransitionPayload): Promise<BatchTransitionResult> {
  const res = await fetch(`/api/demands/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, ...payload }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? 'Batch impossible');
  }
  return res.json();
}

export async function getStats() {
  const res = await fetch(`/api/demands/stats`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Stats indisponibles');
  return res.json();
}

export async function exportDemands(queue: Queue, format: 'csv'|'json'): Promise<Blob> {
  const params = new URLSearchParams();
  if (queue !== 'all') params.set('queue', queue);
  params.set('format', format);

  const res = await fetch(`/api/demands/export?${params.toString()}`);
  if (!res.ok) throw new Error('Export impossible');
  return res.blob();
}

