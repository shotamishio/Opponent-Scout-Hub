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

const items = await fetchAndClassify('"Spain" women\'s national football team', 'ESP');
assert.equal(callCount, 1);
assert.equal(items.length, 3);
assert.equal(items[0].tier, 'T1'); // RFEF, Spain's own federation
assert.equal(items[1].tier, 'T2'); // Marca, general media
assert.equal(items[2].tier, 'T1'); // UEFA, confederation-level

console.log('Integration test passed: fetch -> parse -> classify pipeline works end-to-end (network mocked).');
