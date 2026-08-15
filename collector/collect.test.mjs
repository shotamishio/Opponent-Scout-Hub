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
import { buildQuery, isRelevant } from './lib/topic.mjs';

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

// --- Query building (lib/topic.mjs) ---

// Searches the name media use, not FIFA's ("Korea DPR" / "China PR" match badly).
assert.match(buildQuery('PRK', 'nadeshiko'), /"North Korea women's national team"/);
assert.match(buildQuery('CHN', 'nadeshiko'), /"China women's national team"/);
assert.doesNotMatch(buildQuery('KOR', 'nadeshiko'), /Korea Republic/);

// Each category asks for its own age group — this is what stopped every
// category from returning identical senior-team results.
assert.match(buildQuery('AUS', 'u17'), /"Australia women's U-17"/);
assert.match(buildQuery('AUS', 'u20'), /"Australia women's U-20"/);
assert.doesNotMatch(buildQuery('AUS', 'nadeshiko'), /U-\d\d/);
assert.notEqual(buildQuery('AUS', 'u17'), buildQuery('AUS', 'u20'));

// Recency is part of the query so stale hits don't come back at all.
assert.match(buildQuery('AUS', 'nadeshiko'), /when:30d$/);
assert.match(buildQuery('AUS', 'u16'), /when:120d$/);

assert.throws(() => buildQuery('XXX', 'nadeshiko'), /unknown country/);
assert.throws(() => buildQuery('AUS', 'u12'), /unknown category/);

// --- Relevance filtering (lib/topic.mjs) ---
const rel = (title, code, category, sourceName = '') => isRelevant({ title, sourceName }, code, category);

// Real headlines the live collector returned, and what should happen to them.
assert.ok(rel("U.S. Women's National Team Will Face World No. 1 Spain in Two October Matches", 'USA', 'nadeshiko'));
assert.ok(rel('USWNT to face defending World Cup champion Spain twice this fall', 'USA', 'nadeshiko'));
assert.ok(rel('Germany qualify in style for 2027 Women’s World Cup', 'GER', 'nadeshiko'));

// Wrong sport — these really did show up under USA.
assert.ok(!rel('IFAF Flag Football World Championships 2026: Team USA schedule', 'USA', 'nadeshiko'));
assert.ok(!rel('CT flag football standout sets sights on Olympics', 'USA', 'nadeshiko'));
// Not news, and not about the women's team.
assert.ok(!rel('Sam Kerr | Encyclopedia Britannica', 'CHN', 'nadeshiko'));
// Men's football.
assert.ok(!rel('Metropolitano to Host Spain vs England in the UEFA Nations League', 'ESP', 'nadeshiko'));
// Right sport and gender, wrong country.
assert.ok(!rel('Canada’s women rise to 9th in rankings following FIFA Series', 'PRK', 'nadeshiko'));

// Age gating both ways: youth news stays off the senior screen...
assert.ok(!rel("Germany-France | Women's Under-17 2026 Final", 'GER', 'nadeshiko'));
assert.ok(!rel("U.S. Under-20 Women's National Team Ties England, 1-1", 'ENG', 'nadeshiko'));
// ...and each youth screen only takes its own age group.
assert.ok(rel("Japan Vs North Korea, AFC U20 Women's Asian Cup 2026 Final", 'PRK', 'u20'));
assert.ok(!rel("Japan Vs North Korea, AFC U20 Women's Asian Cup 2026 Final", 'PRK', 'u17'));
assert.ok(rel("AFC U-17 Women's Asian Cup: China through to semi-finals", 'CHN', 'u17'));
assert.ok(!rel("AFC U-17 Women's Asian Cup: China through to semi-finals", 'CHN', 'nadeshiko'));

// "U.S." ends in punctuation, so \b-style boundaries would never match it.
assert.ok(rel('Women’s World Cup 2027 odds: U.S. favored ahead of Spain', 'USA', 'nadeshiko'));
// ...but the bare pronoun "us" must not count as the United States.
assert.ok(!rel('Join us for the Matildas send-off in Sydney', 'USA', 'nadeshiko'));
// Alias boundaries: "Thai" must not swallow "Thailand" into the wrong country,
// and a nickname alone identifies the team.
assert.ok(rel('Chaba Kaew begin Asian Cup preparations', 'THA', 'nadeshiko'));
assert.ok(rel('Lionesses star Georgia Stanway explains Bayern Munich exit', 'ENG', 'nadeshiko'));

console.log('All collector unit tests passed.');
