// Lightweight assertion-based test (no test framework dependency). Exercises
// the RSS parsing + tier classification logic against a fixture, since this
// sandbox's network egress is restricted and can't reach news.google.com
// directly — see the comment in fetchNews.mjs. Run with `npm test`.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parseGoogleNewsRss } from './lib/fetchNews.mjs';
import { classifyTier } from './lib/officialDomains.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(path.join(__dirname, 'fixtures/sample-rss.xml'), 'utf-8');

const items = parseGoogleNewsRss(fixture);

assert.equal(items.length, 3, 'should parse all 3 items from the fixture');

assert.equal(items[0].title, 'RFEF announces 23-player squad for September window');
assert.equal(items[0].sourceName, 'RFEF');
assert.equal(items[0].sourceUrl, 'https://www.rfef.es');
assert.equal(items[0].publishedAt, new Date('Fri, 14 Aug 2026 07:12:00 GMT').toISOString());

assert.equal(items[1].sourceName, 'Marca');
assert.equal(items[2].sourceName, 'UEFA.com');

// Tier classification: RFEF is Spain's own federation domain -> T1.
assert.equal(classifyTier(items[0].sourceUrl, 'ESP'), 'T1');
// Marca is a general newspaper, not a federation/confederation domain -> T2.
assert.equal(classifyTier(items[1].sourceUrl, 'ESP'), 'T2');
// UEFA.com matches the confederation list regardless of country -> T1.
assert.equal(classifyTier(items[2].sourceUrl, 'ESP'), 'T1');
// Same UEFA domain also T1 for an unrelated country code (confederation-level).
assert.equal(classifyTier(items[2].sourceUrl, 'GER'), 'T1');
// A federation domain for the WRONG country must not match.
assert.equal(classifyTier(items[0].sourceUrl, 'GER'), 'T2');

console.log('All collector unit tests passed.');
