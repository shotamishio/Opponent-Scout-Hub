// Entry point run by .github/workflows/collect-and-deploy.yml 3x/day.
// For every country in every category (see lib/roster.mjs), fetches recent
// news via Google News RSS, classifies each item's trust tier, and writes
// one JSON file per category into ../app/src/data/collected/ — which the
// React app imports directly as its live data source (see
// app/src/lib/collectedData.ts).
//
// Design choices, and why:
//  - Google News RSS (not a paid news API) — free, no key, no auth, and
//    aggregates many outlets including wire-service pickups of official
//    federation announcements. See lib/fetchNews.mjs.
//  - No SNS scraping — X/Instagram's free API access isn't usable at any
//    real volume anymore. T3/T4 (individual reporters / fan info) are left
//    empty by this collector; the UI still supports them if someone adds a
//    manual source later.
//  - No structured match-results/schedule collection — there's no free,
//    reliable source covering women's national teams across 5 age
//    categories and ~28 opponent countries. Dropped per explicit direction;
//    country pages now show real news only.
//  - On a per-country fetch failure, keep the previous successful data for
//    that country rather than overwriting it with nothing — a transient
//    failure on one of 3 daily runs shouldn't blank out the screen.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchAndClassify } from './lib/fetchNews.mjs';
import { COUNTRIES, CATEGORY_COUNTRIES } from './lib/roster.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../app/src/data/collected');
const ITEMS_PER_COUNTRY = 8;
const REQUEST_SPACING_MS = 1500; // be polite; ~28 countries * ~1.5s ≈ under a minute per run

function buildQuery(countryEn) {
  return `"${countryEn}" women's national football team`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function collectCountry(code) {
  const { en } = COUNTRIES[code];
  try {
    const items = await fetchAndClassify(buildQuery(en), code);
    items.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
    return { code, ok: true, items: items.slice(0, ITEMS_PER_COUNTRY), fetchedAt: new Date().toISOString() };
  } catch (err) {
    console.error(`[collect] failed for ${code}: ${err.message}`);
    return { code, ok: false, error: String(err.message ?? err) };
  }
}

function loadExisting(category) {
  const file = path.join(OUT_DIR, `${category}.json`);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

async function collectCategory(category) {
  const codes = CATEGORY_COUNTRIES[category];
  const previous = loadExisting(category);
  const countries = {};
  let successCount = 0;

  for (const code of codes) {
    const result = await collectCountry(code);
    if (result.ok) {
      successCount++;
      countries[code] = { items: result.items, fetchedAt: result.fetchedAt, status: 'ok' };
    } else if (previous?.countries?.[code]) {
      // Keep last known good data, but flag it as stale rather than fresh.
      countries[code] = { ...previous.countries[code], status: 'stale', lastError: result.error };
    } else {
      countries[code] = { items: [], status: 'never_collected', lastError: result.error };
    }
    await sleep(REQUEST_SPACING_MS);
  }

  return {
    category,
    generatedAt: new Date().toISOString(),
    successCount,
    totalCount: codes.length,
    countries,
  };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const category of Object.keys(CATEGORY_COUNTRIES)) {
    console.log(`[collect] ${category}: starting (${CATEGORY_COUNTRIES[category].length} countries)`);
    const data = await collectCategory(category);
    writeFileSync(path.join(OUT_DIR, `${category}.json`), JSON.stringify(data, null, 2));
    console.log(`[collect] ${category}: done — ${data.successCount}/${data.totalCount} countries fetched OK`);
  }
}

main().catch((err) => {
  console.error('[collect] fatal error:', err);
  process.exitCode = 1;
});
