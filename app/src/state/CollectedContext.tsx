import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ModeKey } from '@/types';
import type { CountryCode } from '@/data/pool';
import {
  BUNDLED_DATA,
  getCategoryCollection,
  getCountryCollection,
  getCoach,
  lastCollectedAt,
  refreshCollected,
  type CategoryCollection,
  type CollectedCoach,
  type CollectedData,
  type CountryCollection,
} from '@/lib/collectedData';

// Holds the collected data the screens read, and the 再収集 button's state.
//
// The data starts as the copy bundled at build time and can be replaced at
// runtime by refresh(), which re-reads the collector's output from the
// repository. That is what makes the button do something: the site is static,
// so without this the screens could only ever show what was current when the
// site was last built — up to 8 hours old, and not updatable on demand.
//
// What the button cannot do is start a collection run: that needs credentials
// this page must not carry. Forcing a fresh run is a link to GitHub instead
// (RUN_WORKFLOW_URL) — see the header.

export type RefreshStatus = 'idle' | 'loading' | 'ok' | 'error';

interface CollectedContextValue {
  data: CollectedData;
  status: RefreshStatus;
  /** Human-readable outcome of the last refresh, shown next to the button. */
  message: string | null;
  lastCollectedAt: string | null;
  refresh: () => void;
}

const CollectedContext = createContext<CollectedContextValue | null>(null);

export function CollectedProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CollectedData>(BUNDLED_DATA);
  const [status, setStatus] = useState<RefreshStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setStatus('loading');
    setMessage('最新の収集結果を取得しています…');
    refreshCollected()
      .then((result) => {
        setData(result.data);
        setStatus('ok');
        setMessage(
          result.generatedAt
            ? `更新しました（収集 ${formatCollected(result.generatedAt)} / 全${result.itemCount}件）`
            : `更新しました（全${result.itemCount}件）`,
        );
      })
      .catch((error: unknown) => {
        setStatus('error');
        // Offline, or GitHub unreachable. The bundled data stays on screen —
        // a failed refresh must not empty the app.
        setMessage(`取得できませんでした（${error instanceof Error ? error.message : String(error)}）。表示は前回のままです。`);
      });
  }, []);

  const value = useMemo<CollectedContextValue>(
    () => ({ data, status, message, lastCollectedAt: lastCollectedAt(data), refresh }),
    [data, status, message, refresh],
  );

  return <CollectedContext.Provider value={value}>{children}</CollectedContext.Provider>;
}

function useCollectedContext(): CollectedContextValue {
  const ctx = useContext(CollectedContext);
  if (!ctx) throw new Error('CollectedContext used outside <CollectedProvider>');
  return ctx;
}

export function useCollected(): CollectedContextValue {
  return useCollectedContext();
}

export function useCategoryCollection(mode: ModeKey): CategoryCollection {
  return getCategoryCollection(useCollectedContext().data, mode);
}

export function useCountryCollection(mode: ModeKey, code: CountryCode): CountryCollection {
  return getCountryCollection(useCollectedContext().data, mode, code);
}

export function useCoach(mode: ModeKey, code: CountryCode): CollectedCoach {
  return getCoach(useCollectedContext().data, mode, code);
}

export function formatCollected(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
