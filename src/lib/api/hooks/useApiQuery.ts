import { useCallback, useEffect, useRef, useState } from 'react';

export type UseQueryResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

/**
 * Minimal query hook (Pilotage)
 * - abort on unmount
 * - refetch support
 */
export function useApiQuery<T>(queryFn: (signal: AbortSignal) => Promise<T>, deps: any[] = []): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const result = await queryFn(controller.signal);
      setData(result);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    run();
    return () => abortRef.current?.abort();
  }, [run]);

  return { data, isLoading, error, refetch: run };
}


