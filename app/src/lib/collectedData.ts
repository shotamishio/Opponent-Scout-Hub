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
import u19 from '@/data/collected/u19.json';
import u17 from '@/data/collected/u17.json';
import u16 from '@/data/collected/u16.json';

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

export interface CountryCollection {
  items: CollectedNewsItem[];
  status: CountryCollectionStatus;
  fetchedAt?: string;
  lastError?: string;
}

export interface CategoryCollection {
  category: ModeKey;
  generatedAt: string | null;
  successCount: number;
  totalCount: number;
  countries: Record<string, CountryCollection>;
}

const CATEGORY_DATA: Record<ModeKey, CategoryCollection> = {
  nadeshiko: nadeshiko as CategoryCollection,
  u20: u20 as CategoryCollection,
  u19: u19 as CategoryCollection,
  u17: u17 as CategoryCollection,
  u16: u16 as CategoryCollection,
};

const EMPTY_COUNTRY: CountryCollection = { items: [], status: 'never_collected' };

export function getCategoryCollection(mode: ModeKey): CategoryCollection {
  return CATEGORY_DATA[mode];
}

export function getCountryCollection(mode: ModeKey, code: CountryCode): CountryCollection {
  return CATEGORY_DATA[mode]?.countries?.[code] ?? EMPTY_COUNTRY;
}
