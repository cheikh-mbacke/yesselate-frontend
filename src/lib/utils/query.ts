/** WHY: Sanitize query params - jamais undefined/null/empty dans URL */
export function buildQueryString(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s || s === 'undefined' || s === 'null') return;
    sp.set(k, s);
  });

  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

