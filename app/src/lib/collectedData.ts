// Reads the real news data written by ../../../collector/collect.mjs
// (imported directly as JSON — Vite bundles these at build time, so every
// `npm run build` picks up whatever the collector last wrote). Before the
// first collector run these files are empty placeholders (see
// app/src/data/collected/*.json), which this module surfaces honestly as
// a "never collected yet" status rather than fabricating sample content.
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
  emptyCount?: number;
  countries: Record<string, CountryCollection>;
}

const CATEGORY_DATA: Record<ModeKey, CategoryCollection> = {
  nadeshiko: nadeshiko as CategoryCollection,
  u20: u20 as CategoryCollection,
  u17: u17 as CategoryCollection,
};

const EMPTY_COUNTRY: CountryCollection = { items: [], status: 'never_collected' };

export function getCategoryCollection(mode: ModeKey): CategoryCollection {
  return CATEGORY_DATA[mode];
}

export function getCountryCollection(mode: ModeKey, code: CountryCode): CountryCollection {
  return CATEGORY_DATA[mode]?.countries?.[code] ?? EMPTY_COUNTRY;
}

const UNKNOWN_COACH: CollectedCoach = { status: 'no_team_article' };

/** The head coach for a country in one category. Never invents one. */
export function getCoach(mode: ModeKey, code: CountryCode): CollectedCoach {
  return getCountryCollection(mode, code).coach ?? UNKNOWN_COACH;
}
