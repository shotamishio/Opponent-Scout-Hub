// Decides WHAT to search for per (country, category) and WHICH of the
// returned headlines actually belong on that category's screen.
//
// Why this exists: the first version of the collector built one query per
// country — `"<country>" women's national football team` — with no notion of
// the age category. Every category therefore got byte-identical results, so
// the U-16/17/19/20 screens showed senior-team news, and loose matching let
// clearly unrelated headlines through (flag football, an encyclopedia entry,
// other countries' fixtures). Both are worse than showing nothing: an analyst
// reading the U-17 screen has no way to tell the news isn't about U-17.
//
// So there are two layers here:
//   1. buildQuery  — an age-aware query, using the name English-language media
//      actually uses (FIFA's "Korea DPR"/"China PR" style names match badly).
//   2. isRelevant  — a post-fetch filter, because Google News degrades a
//      no-hit phrase query into loose keyword matching rather than returning
//      nothing. Anything that fails is dropped; an empty screen is honest,
//      a screen full of the wrong country's news is not.
import { COUNTRIES } from './roster.mjs';
import { isOwnFederationSource } from './officialDomains.mjs';

// Age categories are much sparser than the senior game, so they look further
// back before giving up.
export const CATEGORY_TOPICS = {
  nadeshiko: { age: null, recencyDays: 30 },
  u20: { age: 20, recencyDays: 120 },
  u19: { age: 19, recencyDays: 120 },
  u17: { age: 17, recencyDays: 120 },
  u16: { age: 16, recencyDays: 120 },
};

// Age labels as they appear in headlines: "U-17", "U17", "Under-17".
function ageTokens(age) {
  return [`U-${age}`, `U${age}`, `Under-${age}`, `Under ${age}`];
}

function ageRegex(age) {
  return new RegExp(`\\bU[-\\s]?${age}\\b|\\bunder[-\\s]?${age}\\b`, 'i');
}

// Any youth-age marker at all — used to keep youth news off the senior screen.
const ANY_AGE_RE = /\bU[-\s]?(1[4-9]|2[0-3])\b|\bunder[-\s]?(1[4-9]|2[0-3])\b/i;

// A headline has to look like women's/girls' football to count. Includes the
// nicknames English-language media use instead of the country name.
const WOMEN_RE =
  /\b(women|women's|womens|woman's|girls|girls'|female|ladies|WNT|USWNT|CanWNT|femenina|feminine|f[ée]minine)\b|\b(Matildas|Lionesses|Nadeshiko|Falconets|Flamingos|Super Falcons|Football Ferns|Filipinas|Chaba Kaew|Steel Roses|Taegeuk Ladies|Blue Tigresses|Banyana)\b/i;

// Different sport, or not news at all. These showed up in real collected data.
const OFF_TOPIC_RE = /\bflag football\b|\bIFAF\b|\bfutsal\b|\bbeach soccer\b|\besports\b|\bencyclopedia\b/i;

// Men's-team markers. Only disqualifying when there's no women's marker too —
// plenty of legitimate coverage compares the two ("both men's and women's").
const MENS_RE = /\b(men|men's|mens|boys|boys'|male|MNT|USMNT|Socceroos|Three Lions)\b/i;

/**
 * The Google News query for one country in one category.
 * @param {string} code - country code as used in roster.mjs
 * @param {string} category - key of CATEGORY_TOPICS
 */
export function buildQuery(code, category) {
  const country = COUNTRIES[code];
  if (!country) throw new Error(`unknown country code: ${code}`);
  const topic = CATEGORY_TOPICS[category];
  if (!topic) throw new Error(`unknown category: ${category}`);

  const name = country.search;
  const phrases = topic.age
    ? ageTokens(topic.age).flatMap((t) => [`${name} women's ${t}`, `${name} ${t} women`])
    : [`${name} women's national team`, `${name} women's national football team`, `${name} women's football`];

  return `(${phrases.map((p) => `"${p}"`).join(' OR ')}) when:${topic.recencyDays}d`;
}

/**
 * Does this headline actually belong on this country's screen in this
 * category? Checks that it mentions the country (by name, FIFA-style name, or
 * team nickname), that it's women's/girls' football, and that its age group
 * matches the category.
 *
 * @param {{title: string, sourceName?: string, sourceUrl?: string, link?: string}} item
 * @param {string} code
 * @param {string} category
 */
export function isRelevant(item, code, category) {
  const country = COUNTRIES[code];
  const topic = CATEGORY_TOPICS[category];
  if (!country || !topic) return false;

  const text = `${item.title ?? ''} ${item.sourceName ?? ''}`;
  if (OFF_TOPIC_RE.test(text)) return false;

  const women = WOMEN_RE.test(text);
  if (MENS_RE.test(text) && !women) return false;

  // A release on the country's OWN federation site is proof of country by
  // itself, and those headlines routinely name neither the country nor the
  // team ("RFEF announces 23-player squad for September window") — requiring
  // them would throw away exactly the T1 primary sources this app exists to
  // surface. The trade-off is that an unlabelled senior men's release from a
  // federation domain can slip through; the men's-marker check above is what
  // catches the ones that are labelled.
  if (!isOwnFederationSource(item.sourceUrl || item.link || '', code)) {
    if (!women) return false;
    if (!country.aliases.some((alias) => aliasRegex(alias).test(text))) return false;
  }

  if (topic.age) {
    // Youth screens: the headline must name this age group. "U-20 Women's
    // Asian Cup" is fine on u20; a senior friendly is not.
    return ageRegex(topic.age).test(text);
  }
  // Senior screen: reject anything carrying a youth marker.
  return !ANY_AGE_RE.test(text);
}

// \b can't be used around these: aliases like "U.S." end in punctuation, so a
// trailing \b would demand a word character right after the final dot and the
// alias would never match "U.S. Women's National Team". Look-arounds on
// letters/digits instead — that also keeps "Thai" from matching "Thailand".
function aliasRegex(alias) {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'iu');
}
