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
//  - Head coaches come from Wikipedia (see lib/wikipedia.mjs) plus a news
//    search on the coach's name, replacing the invented coach profile the
//    app shipped with. Wikipedia is the only free source that covers
//    women's national teams at every age group.
//  - No structured match-results/schedule collection — there's no free,
//    reliable source covering women's national teams across 5 age
//    categories and ~28 opponent countries. Dropped per explicit direction;
//    country pages now show real news only.
//  - Queries are per (country, category) and results are relevance-filtered
//    — see lib/topic.mjs. Without that, every category got the same senior
//    query, so the youth screens showed senior-team news.
//    A category/country with no on-topic news is left empty on purpose:
//    "情報なし" is a usable answer for a scout, wrong-team news is not.
//  - On a per-country fetch failure, keep the previous successful data for
//    that country rather than overwriting it with nothing — a transient
//    failure on one of 3 daily runs shouldn't blank out the screen.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchAndClassify } from './lib/fetchNews.mjs';
import { CATEGORY_COUNTRIES, COUNTRIES } from './lib/roster.mjs';
import { buildQuery, isRelevant, isRecent, isAboutCoach, CATEGORY_TOPICS } from './lib/topic.mjs';
import { findCoach } from './lib/wikipedia.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../app/src/data/collected');
const ITEMS_PER_COUNTRY = 8;
const REQUEST_SPACING_MS = 1500; // be polite; ~28 countries * ~1.5s ≈ under a minute per run

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function collectCountry(code, category) {
  try {
    const fetched = await fetchAndClassify(buildQuery(code, category), code);
    const items = fetched.filter((item) => isRelevant(item, code, category) && isRecent(item, category));
    items.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
    return {
      code,
      ok: true,
      items: items.slice(0, ITEMS_PER_COUNTRY),
      // Kept in the output so the drop rate is visible without re-running the
      // collector: a country that suddenly filters to nothing usually means
      // its query or aliases in lib/topic.mjs need attention.
      filteredOut: fetched.length - items.length,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[collect] failed for ${code}: ${err.message}`);
    return { code, ok: false, error: String(err.message ?? err) };
  }
}

const COACH_ARTICLES_PER_COUNTRY = 5;

/**
 * Who coaches this team, and what has been written about them. Wikipedia
 * supplies the name, the career summary and the links to read further (see
 * lib/wikipedia.mjs); the news search then finds recent articles that mention
 * them by name, so the screen can point at real reading rather than the
 * invented career it used to show.
 */
async function collectCoach(code, category) {
  const wikiName = COUNTRIES[code].search;
  try {
    const found = await findCoach(wikiName, CATEGORY_TOPICS[category].ages);
    if (found.status !== 'ok') return { ...found, fetchedAt: new Date().toISOString() };

    await sleep(REQUEST_SPACING_MS);
    const fetched = await fetchAndClassify(`"${found.name}" (football OR soccer)`, code);
    const articles = fetched
      .filter((item) => isAboutCoach(item, found.name) && isRecent(item, category))
      .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
      .slice(0, COACH_ARTICLES_PER_COUNTRY);

    return { ...found, articles, fetchedAt: new Date().toISOString() };
  } catch (err) {
    console.error(`[collect] coach lookup failed for ${code}/${category}: ${err.message}`);
    return { status: 'error', lastError: String(err.message ?? err) };
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
    const result = await collectCountry(code, category);
    if (result.ok) {
      successCount++;
      countries[code] = {
        items: result.items,
        fetchedAt: result.fetchedAt,
        status: 'ok',
        filteredOut: result.filteredOut,
      };
    } else if (previous?.countries?.[code]) {
      // Keep last known good data, but flag it as stale rather than fresh.
      countries[code] = { ...previous.countries[code], status: 'stale', lastError: result.error };
    } else {
      countries[code] = { items: [], status: 'never_collected', lastError: result.error };
    }
    await sleep(REQUEST_SPACING_MS);

    const coach = await collectCoach(code, category);
    // Same rule as the news above: a failed lookup keeps whatever the last
    // successful run found rather than blanking the coach out.
    countries[code].coach =
      coach.status === 'error' && previous?.countries?.[code]?.coach
        ? { ...previous.countries[code].coach, stale: true, lastError: coach.lastError }
        : coach;
    await sleep(REQUEST_SPACING_MS);
  }

  return {
    category,
    generatedAt: new Date().toISOString(),
    successCount,
    totalCount: codes.length,
    itemCount: Object.values(countries).reduce((n, c) => n + c.items.length, 0),
    emptyCount: Object.values(countries).filter((c) => c.items.length === 0).length,
    coachCount: Object.values(countries).filter((c) => c.coach?.status === 'ok').length,
    countries,
  };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const category of Object.keys(CATEGORY_COUNTRIES)) {
    console.log(`[collect] ${category}: starting (${CATEGORY_COUNTRIES[category].length} countries)`);
    const data = await collectCategory(category);
    writeFileSync(path.join(OUT_DIR, `${category}.json`), JSON.stringify(data, null, 2));
    console.log(
      `[collect] ${category}: done — ${data.successCount}/${data.totalCount} countries fetched OK, ` +
        `${data.itemCount} on-topic items, ${data.emptyCount} countries with no on-topic news, ` +
        `${data.coachCount}/${data.totalCount} head coaches identified`,
    );
  }
}

main().catch((err) => {
  console.error('[collect] fatal error:', err);
  process.exitCode = 1;
});
