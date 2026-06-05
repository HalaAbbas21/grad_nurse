import { useCallback, useEffect, useState } from "react";

interface SimLoad {
  loading: boolean;
  error: boolean;
  retry: () => void;
}

/**
 * Simulates network latency + optional error on mount so every data area
 * can show loading / error / content states realistically.
 */
export function useSimulatedLoad(opts?: { ms?: number; failFirst?: boolean }): SimLoad {
  const ms = opts?.ms ?? 400 + Math.floor(Math.random() * 400);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const failFirst = opts?.failFirst ?? false;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    const t = window.setTimeout(() => {
      if (!active) return;
      if (failFirst && attempt === 0) setError(true);
      setLoading(false);
    }, ms);
    return () => {
      active = false;
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { loading, error, retry };
}
