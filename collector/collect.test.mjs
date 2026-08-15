// Lightweight assertion-based test (no test framework dependency). Exercises
// the RSS parsing + tier classification logic against a fixture, since this
// sandbox's network egress is restricted and can't reach news.google.com
// directly — see the comment in fetchNews.mjs. Run with `npm test`.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parseGoogleNewsRss } from './lib/fetchNews.mjs';
import { classifyTier, federationUrl } from './lib/officialDomains.mjs';
import { buildQuery, buildFederationQuery, isRelevant, isRecent } from './lib/topic.mjs';

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

// ...and also for the name the same competition used to run under, so the
// coverage that would have gone to the removed U-19/U-16 categories is
// collected here rather than lost.
assert.match(buildQuery('AUS', 'u20'), /"Australia women's U-19"/);
assert.match(buildQuery('AUS', 'u17'), /"Australia women's U-16"/);
// Not two steps down, though: U-17 is its own category, not U-20's problem.
assert.doesNotMatch(buildQuery('AUS', 'u20'), /U-17/);
assert.doesNotMatch(buildQuery('AUS', 'u17'), /U-20/);

// Every query names the sport: without it, Google returns the same country's
// women's cricket/volleyball/basketball squads for the same age group.
assert.match(buildQuery('AUS', 'u17'), /\(football OR soccer\)$/);
assert.match(buildQuery('AUS', 'nadeshiko'), /\(football OR soccer\)$/);

// Recency is NOT delegated to the query's `when:` operator — Google News
// honours it erratically (the first live run returned 2013/2014/2018 items
// despite when:120d), so isRecent enforces it against the publish date.
assert.doesNotMatch(buildQuery('AUS', 'nadeshiko'), /when:/);

assert.throws(() => buildQuery('XXX', 'nadeshiko'), /unknown country/);
assert.throws(() => buildQuery('AUS', 'u12'), /unknown category/);

// --- Federation-scoped queries (lib/topic.mjs) ---

// The general query above collects no official material in practice — the
// first live runs returned 0 T1 items out of 67 — so each country is also
// searched on its own federation's site.
const espFederation = buildFederationQuery('ESP', 'nadeshiko');
assert.match(espFederation, /^site:rfef\.es /);
// Federation sites publish in their own language, so the women's-football
// term has to be asked for in more than English or most of Europe and Latin
// America is missed.
assert.match(espFederation, /"femenina"/);
assert.match(espFederation, /"women"/);
// Youth categories add the age labels, including the legacy one, and the
// Spanish/Portuguese "sub-20" those federations actually publish under.
const espU20 = buildFederationQuery('ESP', 'u20');
assert.match(espU20, /"U-20"/);
assert.match(espU20, /"U-19"/);
assert.match(espU20, /"sub-20"/);
// No domain, no query — a normal outcome, not an error. Korea DPR has no
// usable federation site.
assert.equal(buildFederationQuery('PRK', 'nadeshiko'), null);
assert.equal(federationUrl('ESP'), 'https://rfef.es');
assert.equal(federationUrl('PRK'), null);

// --- Recency (lib/topic.mjs) ---
const NOW = Date.parse('2026-08-15T00:00:00Z');
const dated = (publishedAt) => ({ title: 'x', publishedAt });

assert.ok(isRecent(dated('2026-08-01T00:00:00Z'), 'nadeshiko', NOW));
assert.ok(!isRecent(dated('2026-05-01T00:00:00Z'), 'nadeshiko', NOW), 'senior window is 60 days');
// Youth coverage is sparse, so its window is far wider.
assert.ok(isRecent(dated('2026-05-01T00:00:00Z'), 'u20', NOW));
assert.ok(!isRecent(dated('2024-11-09T00:00:00Z'), 'u17', NOW), 'a 2024 world cup report is not news');
// An item with no usable date can't be shown as current news.
assert.ok(!isRecent(dated(null), 'u20', NOW));
assert.ok(!isRecent(dated('not a date'), 'u20', NOW));

// --- Relevance filtering (lib/topic.mjs) ---
const rel = (title, code, category, sourceName = '', sourceUrl = '') =>
  isRelevant({ title, sourceName, sourceUrl }, code, category, NOW);

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

// The renamed age groups land in the category that absorbed them: U-19
// coverage on u20, U-16 coverage on u17.
assert.ok(rel("AFC U-19 Women's Championship: Thailand edge Vietnam", 'THA', 'u20'));
assert.ok(rel('Chinese Taipei U-16 women open Asian Cup qualifying', 'TPE', 'u17'));
// A legacy label has to prove it's football, because "U-19 women" today is
// mostly cricket — and this real headline names neither sport nor jargon.
assert.ok(!rel('Three Indian-origin girls named in Australia’s U19 women’s squad', 'AUS', 'u20'));
// The category's own label needs no such proof.
assert.ok(rel('Australia U-20 women name squad for Asian Cup', 'AUS', 'u20'));
// But they stay out of the other categories, including the senior screen.
assert.ok(!rel("AFC U-19 Women's Championship: Thailand edge Vietnam", 'THA', 'u17'));
assert.ok(!rel("AFC U-19 Women's Championship: Thailand edge Vietnam", 'THA', 'nadeshiko'));
assert.ok(!rel('Chinese Taipei U-16 women open Asian Cup qualifying', 'TPE', 'u20'));

// Other sports. Every one of these reached the live site: they really are
// that country's women's national team at that age group, in another sport.
assert.ok(!rel("South Korea U-17 Women's Volleyball Advances to Quarterfinals", 'KOR', 'u17'));
assert.ok(!rel("Women's National Team Advances to WBSC Women's Baseball World Cup Finals", 'CAN', 'nadeshiko'));
assert.ok(!rel('Replay: Victoria v Western Australia (U20 Women Quarter-Final 1) – Basketball Australia', 'AUS', 'u20'));
// Cricket is the hard case and the reason the jargon list exists: reports are
// written entirely in it and never name the sport. (Constructed from the
// wording of the U-19 cricket results that filled that screen before the
// category was removed.)
assert.ok(!rel('Australia U20 Women win by 7 wickets in final T20I', 'AUS', 'u20'));
// ...while the football coverage they were crowding out survives.
assert.ok(rel("Canadian women's soccer team to host Denmark in pair of October friendlies", 'CAN', 'nadeshiko'));
assert.ok(rel('Nigeria qualify for FIFA U20 Women’s World Cup Poland 2026', 'NGA', 'u20'));

// Archival content republished with a fresh feed date, so only the headline's
// own year gives it away.
assert.ok(!rel('Alex Morgan Wins Best Female Athlete, USWNT Takes Home Best Team ESPY | 2019 ESPYS', 'USA', 'nadeshiko'));
assert.ok(!rel("Mexico U-17 Women's Best World Cup Performance Was Runner-Up in Uruguay 2018", 'MEX', 'u17'));
// A future tournament in the headline is not staleness.
assert.ok(rel('Philippines women’s national football team qualify for 2027 FIFA Women’s World Cup', 'PHI', 'nadeshiko'));

// Sites that are never scouting information, whatever the headline says.
assert.ok(!rel('Bloke reckons he’d do OK in England women’s football team', 'ENG', 'nadeshiko', 'NewsBiscuit', 'https://www.newsbiscuit.com'));
assert.ok(!rel("United States Women's National Team vs. Spain", 'USA', 'nadeshiko', 'Event Tickets Center', 'https://www.eventticketscenter.com'));
assert.ok(!rel('Brazil U-20 (Women) vs Korea Republic U-20 (Women) » Best Odds and Stats', 'BRA', 'u20'));

// On the federation's own site the country name is the one thing a headline
// never repeats, so the domain stands in for the country check — otherwise
// the official announcements this collector goes looking for get thrown away
// on arrival.
assert.ok(rel('Convocatoria de la selección femenina para la ventana de septiembre', 'ESP', 'nadeshiko', 'RFEF', 'https://rfef.es'));
// The very same headline from a newspaper names no country and stays out.
assert.ok(!rel('Convocatoria de la selección femenina para la ventana de septiembre', 'ESP', 'nadeshiko', 'Marca', 'https://www.marca.com'));
// The domain stands in for the country check and nothing else: federations
// cover the men's team on the same site, and this RFEF page about the men's
// Nations League fixture reached the senior screen when the trust was wider.
assert.ok(!rel('Metropolitano to Host Spain vs England in the UEFA Nations League', 'ESP', 'nadeshiko', 'RFEF', 'https://rfef.es'));
// Age gating still applies on federation domains too — and it has to know
// "sub-17", or a Spanish youth release reads as ageless and lands here.
assert.ok(!rel('Convocatoria de la selección femenina sub-17', 'ESP', 'nadeshiko', 'RFEF', 'https://rfef.es'));
assert.ok(rel('Convocatoria de la selección femenina sub-20', 'ESP', 'u20', 'RFEF', 'https://rfef.es'));
// A federation release that is about the women's team still passes.
assert.ok(rel("24 Players Named for Final U.S. Under-17 Women's National Team Camp", 'USA', 'u17', 'US Soccer', 'https://www.ussoccer.com'));

// "U.S." ends in punctuation, so \b-style boundaries would never match it.
assert.ok(rel('Women’s World Cup 2027 odds: U.S. favored ahead of Spain', 'USA', 'nadeshiko'));
// ...but the bare pronoun "us" must not count as the United States.
assert.ok(!rel('Join us for the Matildas send-off in Sydney', 'USA', 'nadeshiko'));
// Alias boundaries: "Thai" must not swallow "Thailand" into the wrong country,
// and a nickname alone identifies the team.
assert.ok(rel('Chaba Kaew begin Asian Cup preparations', 'THA', 'nadeshiko'));
assert.ok(rel('Lionesses star Georgia Stanway explains Bayern Munich exit', 'ENG', 'nadeshiko'));

console.log('All collector unit tests passed.');
