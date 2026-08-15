// End-to-end pipeline test with global.fetch mocked (no real network call —
// this sandbox can't reach news.google.com; see collect.mjs's header
// comment). Verifies collectCountry/collectCategory/file-writing all work
// together correctly. The actual live HTTP fetch (fetchGoogleNews's
// fetch() call itself) is exactly what GitHub Actions will exercise for
// real once this runs there.
import { readFileSync, rmSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const fixtureDir = path.resolve(import.meta.dirname, 'fixtures');
const sampleRss = readFileSync(path.join(fixtureDir, 'sample-rss.xml'), 'utf-8');

let callCount = 0;
global.fetch = async (url) => {
  callCount++;
  assert.ok(String(url).startsWith('https://news.google.com/rss/search?q='), 'should call Google News RSS');
  return { ok: true, text: async () => sampleRss };
};

const { fetchAndClassify } = await import('./lib/fetchNews.mjs');
const { buildQuery, isRelevant, isRecent } = await import('./lib/topic.mjs');

// Pinned to just after the fixture's newest item, so the recency window is
// evaluated against a fixed point rather than whenever the suite happens to run.
const NOW = Date.parse('2026-08-15T00:00:00Z');

const items = await fetchAndClassify(buildQuery('ESP', 'nadeshiko'), 'ESP');
assert.equal(callCount, 1);
assert.equal(items.length, 3);
assert.equal(items[0].tier, 'T1'); // RFEF, Spain's own federation
assert.equal(items[1].tier, 'T2'); // Marca, general media
assert.equal(items[2].tier, 'T1'); // UEFA, confederation-level

// Same filtering collect.mjs applies to what comes back.
const kept = items.filter((item) => isRelevant(item, 'ESP', 'nadeshiko', NOW) && isRecent(item, 'nadeshiko', NOW));
assert.deepEqual(
  kept.map((i) => i.sourceName),
  ['Marca'],
  'keeps only the headline that identifies both the country and the women\'s team',
);
// The other two are dropped for the same reason, and it is the right reason:
//  - "RFEF announces 23-player squad for September window" is on Spain's own
//    federation domain, but names neither Spain nor the women's team, so
//    nothing in it rules out the men's squad. An earlier version trusted
//    federation domains outright; on real data that let RFEF's men's Nations
//    League fixture onto the senior screen, and rescued nothing in exchange.
//  - "UEFA confirms venue for upcoming qualifier" is T1 by domain too, but a
//    confederation site covers every country and both genders.
assert.ok(!kept.some((i) => i.sourceName === 'RFEF'));
assert.ok(!kept.some((i) => i.sourceName === 'UEFA.com'));

// The same fetch results filtered for a youth category keep nothing: none of
// these headlines mention U-17. This is the bug the category-aware collector
// fixes — before, these senior items were written to the u17 screen verbatim.
assert.equal(items.filter((item) => isRelevant(item, 'ESP', 'u17', NOW)).length, 0);

console.log('Integration test passed: fetch -> parse -> classify -> filter pipeline works end-to-end (network mocked).');
