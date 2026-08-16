// Tests for the Wikipedia coach lookup's parsing (lib/wikipedia.mjs). Only
// the pure functions are covered here — this sandbox can't reach
// wikipedia.org any more than it can reach news.google.com, so the request
// functions are exercised for real for the first time on GitHub Actions.
//
// The infobox values below are the shapes real articles use: flag icons,
// nowrap wrappers, piped links, references and comments wrapped around the
// name. Getting a name out of that is the whole job.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {
  teamArticleCandidates,
  extractManager,
  cleanFieldValue,
  articleUrl,
} from './lib/wikipedia.mjs';

const fixture = readFileSync(path.join(import.meta.dirname, 'fixtures/team-article.wikitext'), 'utf-8');

// --- Article titles ---

const senior = teamArticleCandidates('Spain', []);
assert.ok(senior.includes("Spain women's national football team"));
// Some countries file under "soccer" (USA, Canada, Australia), so both are
// always tried rather than hard-coding which country uses which word.
assert.ok(senior.includes("Spain women's national soccer team"));

const u20 = teamArticleCandidates('Spain', [20, 19]);
assert.equal(u20[0], "Spain women's national under-20 football team");
// The legacy age group is tried too, for the same reason the news collector
// searches for it: the team may still be filed under its old name.
assert.ok(u20.includes("Spain women's national under-19 football team"));
// Age order is preserved — the category's own label comes first.
assert.ok(u20.indexOf("Spain women's national under-20 football team") < u20.indexOf("Spain women's national under-19 football team"));

// --- Infobox extraction ---

const manager = extractManager(fixture);
assert.equal(manager.name, 'Tomé', 'the displayed name is what the infobox shows');
assert.equal(manager.article, 'Montse Tomé', 'but the link target is the full name, which the biography lookup needs');

assert.equal(extractManager('no infobox here'), null);
assert.equal(extractManager(''), null);
assert.equal(extractManager(null), null);

// --- Field value cleaning ---

assert.deepEqual(cleanFieldValue('[[Futoshi Ikeda]]'), { name: 'Futoshi Ikeda', article: 'Futoshi Ikeda' });
assert.deepEqual(cleanFieldValue('{{flagicon|JPN}} [[Futoshi Ikeda]]'), { name: 'Futoshi Ikeda', article: 'Futoshi Ikeda' });
// A wrapper template must not take the name with it.
assert.deepEqual(cleanFieldValue('{{nowrap|[[Emma Hayes]]}}'), { name: 'Emma Hayes', article: 'Emma Hayes' });
// Coaches without their own article still give a usable name.
assert.deepEqual(cleanFieldValue('Anonymous Coach'), { name: 'Anonymous Coach', article: null });
assert.deepEqual(cleanFieldValue('[[Ante Milicic]]<ref name="x">Some source</ref>'), { name: 'Ante Milicic', article: 'Ante Milicic' });
assert.deepEqual(cleanFieldValue('[[Ante Milicic]]<ref name="x" />'), { name: 'Ante Milicic', article: 'Ante Milicic' });
assert.deepEqual(cleanFieldValue('[[Ante Milicic]] <!-- update after AFC Cup -->'), { name: 'Ante Milicic', article: 'Ante Milicic' });
// An empty or vacated field is "no coach listed", not an empty name.
assert.equal(cleanFieldValue(''), null);
assert.equal(cleanFieldValue('{{flagicon|JPN}}'), null);

// Inline infoboxes: the value runs into the next field on the same line. The
// first live run produced a North Korea U-17 coach named "Captain             ="
// this way, from an empty coach field written inline.
assert.equal(cleanFieldValue('|Captain             = [[Some Player]]'), null);
assert.deepEqual(
  cleanFieldValue('[[Ri Song-ho]] |Captain = [[Some Player]]'),
  { name: 'Ri Song-ho', article: 'Ri Song-ho' },
  'the coach is taken, the next field is not',
);
// The pipe inside a piped link is not a field boundary.
assert.deepEqual(cleanFieldValue('[[Montse Tomé|Tomé]]'), { name: 'Tomé', article: 'Montse Tomé' });
// Nor is one inside a template.
assert.deepEqual(cleanFieldValue('{{nowrap|[[Emma Hayes]]}} |Captain = x'), { name: 'Emma Hayes', article: 'Emma Hayes' });
// Anything still carrying an "=" is a mis-capture, not a name.
assert.equal(cleanFieldValue('Captain             = Someone'), null);

// --- URLs ---

assert.equal(articleUrl('Montse Tomé'), 'https://en.wikipedia.org/wiki/Montse_Tom%C3%A9');
assert.equal(articleUrl("Spain women's national football team"), "https://en.wikipedia.org/wiki/Spain_women's_national_football_team");

console.log('All Wikipedia coach-lookup tests passed.');
