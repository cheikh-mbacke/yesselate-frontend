'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type CommandCenterUrlState = {
  cat?: string;
  sub?: string;
  fs?: boolean;
  sc?: boolean;
  kv?: boolean;
  kc?: boolean;
  np?: boolean;
};

const toBool = (v: string | null | undefined): boolean | undefined => {
  if (v == null) return undefined;
  if (v === '1' || v === 'true') return true;
  if (v === '0' || v === 'false') return false;
  return undefined;
};

const fromBool = (v: boolean | undefined): string | undefined => {
  if (v === undefined) return undefined;
  return v ? '1' : '0';
};

function stableSerialize(input: CommandCenterUrlState) {
  const keys = Object.keys(input).sort() as Array<keyof CommandCenterUrlState>;
  const o: Record<string, unknown> = {};
  for (const k of keys) o[k] = input[k];
  return JSON.stringify(o);
}

export function useCommandCenterUrlSync(params: {
  namespace: string; // conservé pour compat, mais volontairement non utilisé ici
  state: Required<Pick<CommandCenterUrlState, 'cat' | 'sub'>> & Omit<CommandCenterUrlState, 'cat' | 'sub'>;
  onHydrate: (next: CommandCenterUrlState, meta: { hasAnyParam: boolean }) => void;
  enabled?: boolean;
}) {
  const { namespace: _namespace } = params; // évite ESLint unused-vars
  void _namespace;

  const enabled = params.enabled ?? true;
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const hydratedRef = useRef(false);
  const lastWrittenRef = useRef<string>('');
  const lastHydratedRef = useRef<string>('');

  const incoming = useMemo<CommandCenterUrlState>(() => {
    if (!enabled) return {};
    return {
      cat: sp.get('cat') ?? undefined,
      sub: sp.get('sub') ?? undefined,
      fs: toBool(sp.get('fs')),
      sc: toBool(sp.get('sc')),
      kv: toBool(sp.get('kv')),
      kc: toBool(sp.get('kc')),
      np: toBool(sp.get('np')),
    };
  }, [enabled, sp]);

  const incomingSignature = useMemo(() => stableSerialize(incoming), [incoming]);

  // Hydrate store from URL (one shot initial, puis réhydrate si URL change externe)
  useEffect(() => {
    if (!enabled) return;

    const hasAnyParam =
      sp.has('cat') || sp.has('sub') || sp.has('fs') || sp.has('sc') || sp.has('kv') || sp.has('kc') || sp.has('np');

    // Si déjà hydraté, vérifier si l'URL a changé de manière externe (pas par notre écriture)
    if (hydratedRef.current) {
      // Si l'URL a changé et que ce n'est pas nous qui l'avons écrite, réhydrater
      if (incomingSignature !== lastHydratedRef.current && incomingSignature !== lastWrittenRef.current) {
        lastHydratedRef.current = incomingSignature;
        params.onHydrate(incoming, { hasAnyParam });
      }
      return;
    }

    // Première hydratation
    hydratedRef.current = true;
    lastHydratedRef.current = incomingSignature;
    params.onHydrate(incoming, { hasAnyParam });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, incoming, incomingSignature, params.onHydrate, sp]);

  // Write URL from state (after hydrate)
  useEffect(() => {
    if (!enabled) return;
    if (!hydratedRef.current) return;

    const next: CommandCenterUrlState = {
      cat: params.state.cat,
      sub: params.state.sub,
      fs: params.state.fs,
      sc: params.state.sc,
      kv: params.state.kv,
      kc: params.state.kc,
      np: params.state.np,
    };

    const signature = stableSerialize(next);
    if (signature === lastWrittenRef.current) return;

    const nextParams = new URLSearchParams(sp.toString());
    nextParams.set('cat', next.cat ?? 'overview');
    nextParams.set('sub', next.sub ?? 'all');

    const fs = fromBool(next.fs);
    const sc = fromBool(next.sc);
    const kv = fromBool(next.kv);
    const kc = fromBool(next.kc);
    const np = fromBool(next.np);

    if (fs) nextParams.set('fs', fs); else nextParams.delete('fs');
    if (sc) nextParams.set('sc', sc); else nextParams.delete('sc');
    if (kv) nextParams.set('kv', kv); else nextParams.delete('kv');
    if (kc) nextParams.set('kc', kc); else nextParams.delete('kc');
    if (np) nextParams.set('np', np); else nextParams.delete('np');

    lastWrittenRef.current = signature;
    lastHydratedRef.current = signature; // Marquer comme hydraté après notre écriture

    const qs = nextParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [enabled, pathname, router, sp, params.state]);
}
