import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { AppData } from '../types';
import { buildLedger, type Ledger } from '../lib/calc';
import { useStore } from './store';

/** Current time, re-rendering every 30s so day/week boundaries roll over live. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    const onVis = (): void => {
      if (document.visibilityState === 'visible') setNow(new Date());
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [intervalMs]);
  return now;
}

export function useAppData(): AppData {
  return useStore(
    useShallow((s) => ({
      version: 2 as const,
      settings: s.settings,
      logs: s.logs,
      penaltyOverrides: s.penaltyOverrides,
      baseBudgetOverrides: s.baseBudgetOverrides,
    })),
  );
}

export function useLedger(data: AppData, now: Date): Ledger {
  const monthStamp = `${now.getFullYear()}-${now.getMonth()}`;
  // `data` is referentially stable (useShallow); ledger only depends on the current month for its span.
  return useMemo(() => buildLedger(data, now), [data, monthStamp]);
}
