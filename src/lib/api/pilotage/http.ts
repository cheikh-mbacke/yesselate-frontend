/**
 * HTTP helpers for Pilotage module APIs
 * - Consistent error handling
 * - Typed JSON parsing
 */
export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  error?: string;
} & T;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchJson<T>(
  endpoint: string,
  options: RequestInit & { signal?: AbortSignal } = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const text = await res.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const msg =
      (payload && typeof payload === 'object' && 'error' in payload && typeof (payload as any).error === 'string'
        ? (payload as any).error
        : `HTTP ${res.status}`) || `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, payload);
  }

  return payload as T;
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}


