// The real news data written by ../../../collector/collect.mjs.
//
// Two ways in, and the difference matters:
//   - The JSON imported below is bundled at build time, so it is whatever the
//     collector last wrote before this copy of the site was built. That is the
//     starting point, and the only one that works offline.
//   - refreshCollected() re-fetches the same files from the repository at
//     runtime, which is how the 再収集 button updates the screens without
//     waiting for a rebuild. See state/CollectedContext.tsx.
import type { ModeKey } from '@/types';
import type { CountryCode } from '@/data/pool';

import nadeshiko from '@/data/collected/nadeshiko.json';
import u20 from '@/data/collected/u20.json';
import u17 from '@/data/collected/u17.json';

export type CollectedTier = 'T1' | 'T2';

export interface CollectedNewsItem {
  title: string;
  link: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string | null;
  tier: CollectedTier;
}

export type CountryCollectionStatus = 'ok' | 'stale' | 'never_collected';

/**
 * The head coach as found on Wikipedia by collector/lib/wikipedia.mjs, plus
 * recent articles that name them. `status` is deliberately explicit about how
 * the lookup ended, because "we could not find out who coaches this team" is
 * information a scout needs, and the previous version of this screen filled
 * that gap with an invented profile instead.
 */
export type CoachStatus = 'ok' | 'no_team_article' | 'no_coach_listed' | 'error';

export interface CollectedCoach {
  status: CoachStatus;
  name?: string;
  /** Wikipedia's one-line description, e.g. "Spanish football manager". */
  description?: string | null;
  /** Opening paragraphs of the coach's Wikipedia article — their career in brief. */
  bio?: string | null;
  /** The coach's own Wikipedia article. Null when they don't have one. */
  profileUrl?: string | null;
  /** The team's Wikipedia article — always worth linking even with no coach found. */
  teamUrl?: string;
  articles?: CollectedNewsItem[];
  /** The federation's own site — the first place an appointment is announced. */
  federationUrl?: string | null;
  fetchedAt?: string;
  stale?: boolean;
  lastError?: string;
}

export interface CountryCollection {
  items: CollectedNewsItem[];
  status: CountryCollectionStatus;
  fetchedAt?: string;
  lastError?: string;
  coach?: CollectedCoach;
  /**
   * The country's football federation site (collector/lib/officialDomains.mjs).
   * Null when we have no verified domain — in which case that country has no
   * T1 collection either, since there is nothing to search.
   */
  federationUrl?: string | null;
  /**
   * How many fetched headlines the collector's relevance filter rejected as
   * off-topic (wrong country, wrong age group, men's football, other sports)
   * — see collector/lib/topic.mjs. `items: []` with a high `filteredOut`
   * means "nothing on-topic was published", not "the fetch failed".
   */
  filteredOut?: number;
}

export interface CategoryCollection {
  category: ModeKey;
  generatedAt: string | null;
  successCount: number;
  totalCount: number;
  /** Totals across the category, written by the collector for at-a-glance health. */
  itemCount?: number;
  officialCount?: number;
  emptyCount?: number;
  coachCount?: number;
  countries: Record<string, CountryCollection>;
}

export type CollectedData = Record<ModeKey, CategoryCollection>;

export const BUNDLED_DATA: CollectedData = {
  nadeshiko: nadeshiko as CategoryCollection,
  u20: u20 as CategoryCollection,
  u17: u17 as CategoryCollection,
};

const EMPTY_COUNTRY: CountryCollection = { items: [], status: 'never_collected' };
const UNKNOWN_COACH: CollectedCoach = { status: 'no_team_article' };

export function getCategoryCollection(data: CollectedData, mode: ModeKey): CategoryCollection {
  return data[mode] ?? BUNDLED_DATA[mode];
}

export function getCountryCollection(data: CollectedData, mode: ModeKey, code: CountryCode): CountryCollection {
  return getCategoryCollection(data, mode)?.countries?.[code] ?? EMPTY_COUNTRY;
}

/** The head coach for a country in one category. Never invents one. */
export function getCoach(data: CollectedData, mode: ModeKey, code: CountryCode): CollectedCoach {
  return getCountryCollection(data, mode, code).coach ?? UNKNOWN_COACH;
}

/** The most recent collection time across all categories, for the header. */
export function lastCollectedAt(data: CollectedData): string | null {
  const times = Object.values(data)
    .map((category) => category.generatedAt)
    .filter((t): t is string => Boolean(t))
    .sort();
  return times.length ? times[times.length - 1] : null;
}

// --- Runtime refresh -------------------------------------------------------

// The collector commits its output to the repository on every run, so the raw
// file is current the moment a run finishes — ahead of the site rebuild that
// follows it. Fetching from here is what lets 再収集 update the screens
// straight away instead of waiting for the next deploy.
const DATA_BASE_URL = 'https://raw.githubusercontent.com/shotamishio/Opponent-Scout-Hub/main/app/src/data/collected';

const CATEGORIES: ModeKey[] = ['nadeshiko', 'u20', 'u17'];

/**
 * A URL is only safe to put in an href if it is http(s): this data is fetched
 * at runtime, so a `javascript:` link in a title or profile URL would
 * otherwise execute on click. Bundled data goes through the same check —
 * there is no reason for the two paths to differ.
 */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}

function isCategoryCollection(value: unknown): value is CategoryCollection {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CategoryCollection>;
  return typeof candidate.countries === 'object' && candidate.countries !== null && Array.isArray(candidate.countries[Object.keys(candidate.countries)[0]]?.items ?? []);
}

export interface RefreshResult {
  data: CollectedData;
  itemCount: number;
  generatedAt: string | null;
}

/**
 * Re-fetches every category's collected data. Rejects if any category can't
 * be fetched or doesn't parse, so a half-updated screen is never shown.
 */
export async function refreshCollected(signal?: AbortSignal): Promise<RefreshResult> {
  const fetched = await Promise.all(
    CATEGORIES.map(async (category) => {
      // cache: 'no-store' matters here: the whole point of the button is to
      // get past whatever the browser already has.
      const res = await fetch(`${DATA_BASE_URL}/${category}.json`, { cache: 'no-store', signal });
      if (!res.ok) throw new Error(`${category}: HTTP ${res.status}`);
      const json: unknown = await res.json();
      if (!isCategoryCollection(json)) throw new Error(`${category}: 予期しないデータ形式`);
      return [category, json] as const;
    }),
  );

  const data = Object.fromEntries(fetched) as CollectedData;
  const itemCount = Object.values(data).reduce(
    (n, category) => n + Object.values(category.countries).reduce((m, c) => m + c.items.length, 0),
    0,
  );
  return { data, itemCount, generatedAt: lastCollectedAt(data) };
}

/** Where to start a fresh collection run by hand — see the header button. */
export const RUN_WORKFLOW_URL =
  'https://github.com/shotamishio/Opponent-Scout-Hub/actions/workflows/collect-and-deploy.yml';
