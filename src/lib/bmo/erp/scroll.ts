'use client';

import { useEffect, useMemo } from 'react';
import type { RefObject } from 'react';
import { debounce, readJson, writeJson } from './session';

type ScrollState = { top: number };

export function useScrollRestoration(
  ref: RefObject<HTMLElement | null>,
  key: string,
  opts?: { debounceMs?: number }
) {
  const debounceMs = opts?.debounceMs ?? 150;

  const storageKey = useMemo(() => `bmo.scroll.${key}`, [key]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Restore
    const saved = readJson<ScrollState>(storageKey);
    if (saved?.top && Number.isFinite(saved.top)) {
      try {
        el.scrollTop = saved.top;
      } catch {
        // ignore
      }
    }

    const persist = debounce(() => {
      const current = ref.current;
      if (!current) return;
      writeJson(storageKey, { top: current.scrollTop });
    }, debounceMs);

    const onScroll = () => persist();
    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, [ref, storageKey, debounceMs]);
}
