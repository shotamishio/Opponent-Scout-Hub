// Decides WHAT to search for per (country, category) and WHICH of the
// returned headlines actually belong on that category's screen.
//
// Why this exists: the first version of the collector built one query per
// country — `"<country>" women's national football team` — with no notion of
// the age category. Every category therefore got byte-identical results, so
// the youth screens showed senior-team news, and loose matching let clearly
// unrelated headlines through (flag football, an encyclopedia entry, other
// countries' fixtures). Both are worse than showing nothing: an analyst
// reading the U-17 screen has no way to tell the news isn't about U-17.
//
// So there are two layers here:
//   1. buildQuery  — an age-aware query naming the sport, using the name
//      English-language media actually uses (FIFA's "Korea DPR"/"China PR"
//      style names match badly).
//   2. isRelevant  — a post-fetch filter, because Google News degrades a
//      no-hit phrase query into loose keyword matching rather than returning
//      nothing. Anything that fails is dropped; an empty screen is honest,
//      a screen full of the wrong country's news is not.
//
// The filter is deliberately the stricter of the two: the first live run with
// age-aware queries still filled the U-17 Korea screen with VOLLEYBALL,
// Canada's senior screen with BASEBALL, Australia's U-20 screen with
// BASKETBALL, and the since-removed U-19 screen with CRICKET. Every one of
// those genuinely is a national women's team of that age group — just the
// wrong sport. Nothing in a query can prevent that, so it has to be caught
// here.
//
// Categories live in CATEGORY_TOPICS below and must stay in step with the
// app's ModeKey (app/src/types.ts) and CATEGORY_COUNTRIES in roster.mjs.
import { COUNTRIES } from './roster.mjs';

// Age categories are much sparser than the senior game, so they look further
// back before giving up.
//
// `ages` is a list, not a single number, because AFC and FIFA renamed these
// competitions: what was the AFC U-19 Women's Championship is now the U-20
// Women's Asian Cup, and the U-16 is now the U-17. The two labels describe
// the same player cohort, and coverage still uses both — so the U-20 category
// collects U-19 coverage as well, and U-17 collects U-16. (Standalone U-19 and
// U-16 categories existed until 2026-08-15 and were removed: almost nothing is
// filed under those names any more, so those screens could only sit empty.)
// The first listed age is the category's own label.
//
// recencyDays is enforced in code, against each item's publish date, and NOT
// left to the query's `when:` operator: Google News RSS honours `when:`
// erratically — the first live run came back with 2013, 2014 and 2018
// headlines despite `when:120d`.
export const CATEGORY_TOPICS = {
  nadeshiko: { ages: [], recencyDays: 60 },
  u20: { ages: [20, 19], recencyDays: 240 },
  u17: { ages: [17, 16], recencyDays: 240 },
};

// Age labels as they appear in headlines: "U-17", "U17", "Under-17". The
// spaced form ("Under 17") is left out of the query — Google treats the hyphen
// and the space alike — but ageRegex below still matches it when filtering.
function ageTokens(age) {
  return [`U-${age}`, `U${age}`, `Under-${age}`];
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

// Another sport entirely. Both the sport's name and its jargon are listed:
// cricket reports in particular often lead with the jargon ("outclass China by
// 7 wickets in final T20I") and never say "cricket" at all.
const OTHER_SPORT_RE =
  /\b(cricket|volleyball|baseball|softball|basketball|rugby|netball|handball|hockey|tennis|badminton|athletics|swimming|golf|water polo|flag football|futsal|beach soccer|esports)\b|\b(wicket|wickets|T20|T20I|ODI|innings|batter|bowler|all-rounder|spiker|WBSC|IFAF|WNBA|AFL)\b|\bencyclopedia\b/i;

// Low-value or untrustworthy results that a scout shouldn't be handed as
// news: betting/odds aggregators and fantasy-league content.
const JUNK_RE =
  /\bbest odds\b|\bodds and stats\b|\bbetting\b|\bbet365\b|\bdream11\b|\bfantasy (tips|team|preview)\b|\bprediction tips\b/i;

// Sites whose output is never usable as scouting information, whatever the
// headline says. All observed in real collected data: NewsBiscuit ran a
// satirical piece about England's women's team, and ticket resellers generate
// a page per fixture that reads like a match report in the feed.
const BLOCKED_SOURCE_HOSTS = [
  'newsbiscuit.com',
  'thedailymash.co.uk',
  'thepoke.co.uk',
  'theonion.com',
  'eventticketscenter.com',
  'stubhub.com',
  'vividseats.com',
  'seatgeek.com',
  'ticketsmarter.com',
];

// Archival content republished with a fresh feed date — the date check can't
// catch it, but the headline names its own year ("2019 ESPYS", "2022 FIFA U20
// Women's World Cup"). Anything two or more years old is history, not news.
function mentionsStaleYear(text, now) {
  const currentYear = new Date(now).getUTCFullYear();
  for (const match of text.matchAll(/\b(19|20)\d{2}\b/g)) {
    const year = Number(match[0]);
    if (year >= 1990 && year <= currentYear - 2) return true;
  }
  return false;
}

function isBlockedSource(link) {
  let host;
  try {
    host = new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return false;
  }
  return BLOCKED_SOURCE_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

// Positive evidence that a headline is about football specifically. Only
// demanded of the legacy age labels (see isRelevant): "U-19 women" in current
// usage is overwhelmingly cricket — that age group has a Women's T20 World
// Cup — and those reports can name neither the sport nor any cricket jargon
// ("Three Indian-origin girls named in Australia's U19 women's squad", which
// is cricket). "U-20 women" carries no such ambiguity in football.
const FOOTBALL_RE =
  /\b(football|soccer|FIFA|AFC|AFF|ASEAN|UEFA|CONCACAF|CONMEBOL|CAF|OFC|Asian Cup|Euro|Copa)\b/i;

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
  const phrases = topic.ages.length
    ? topic.ages.flatMap((age) =>
        ageTokens(age).flatMap((t) => [`${name} women's ${t}`, `${name} ${t} women`]),
      )
    : [
        `${name} women's national team`,
        `${name} women's national football team`,
        `${name} women's football`,
        `${name} women's soccer`,
      ];

  // The trailing sport term is what keeps women's cricket/volleyball/baseball
  // squads of the same age group out of the results. It can't do the job on
  // its own (Google still matches loosely) — isRelevant is the backstop.
  return `(${phrases.map((p) => `"${p}"`).join(' OR ')}) (football OR soccer)`;
}

/**
 * Is the item recent enough for its category? Kept separate from isRelevant so
 * the reason an item was dropped stays legible.
 *
 * An item with no usable publish date is dropped: for a screen that presents
 * itself as current news, "we don't know when this is from" is not good
 * enough, and in practice the undated results were old republished pages.
 *
 * @param {{publishedAt?: string|null}} item
 * @param {string} category
 * @param {number} [now] - epoch ms, injectable for tests
 */
export function isRecent(item, category, now = Date.now()) {
  const topic = CATEGORY_TOPICS[category];
  if (!topic) return false;
  if (!item.publishedAt) return false;
  const published = Date.parse(item.publishedAt);
  if (Number.isNaN(published)) return false;
  return now - published <= topic.recencyDays * 24 * 60 * 60 * 1000;
}

/**
 * Does this headline actually belong on this country's screen in this
 * category? Checks that it's football rather than another sport, that it
 * mentions the country (by name, FIFA-style name, or team nickname), that
 * it's women's/girls' football, and that its age group matches the category.
 *
 * Note there is no exemption for a country's own federation domain. There was
 * one — those releases can name neither country nor team ("RFEF announces
 * 23-player squad") — but on real collected data it earned nothing: every
 * genuine federation item passed the normal checks anyway, because federation
 * press offices write "Women's National Team" out in full. All it actually
 * let through was RFEF's men's Nations League fixture, onto the senior screen.
 *
 * @param {{title: string, sourceName?: string, sourceUrl?: string, link?: string}} item
 * @param {string} code
 * @param {string} category
 * @param {number} [now] - epoch ms, injectable for tests
 */
export function isRelevant(item, code, category, now = Date.now()) {
  const country = COUNTRIES[code];
  const topic = CATEGORY_TOPICS[category];
  if (!country || !topic) return false;

  if (isBlockedSource(item.sourceUrl || item.link || '')) return false;

  const text = `${item.title ?? ''} ${item.sourceName ?? ''}`;
  if (OTHER_SPORT_RE.test(text)) return false;
  if (JUNK_RE.test(text)) return false;
  if (mentionsStaleYear(text, now)) return false;

  const women = WOMEN_RE.test(text);
  if (MENS_RE.test(text) && !women) return false;
  if (!women) return false;
  if (!country.aliases.some((alias) => aliasRegex(alias).test(text))) return false;

  if (topic.ages.length) {
    // Youth screens: the headline must name one of the category's age groups
    // — its own label, or the name the same competition used to go by (U-19
    // for u20, U-16 for u17). "U-20 Women's Asian Cup" is fine on u20; a
    // senior friendly is not, and neither is U-17.
    const [ownLabel, ...legacyLabels] = topic.ages;
    if (ageRegex(ownLabel).test(text)) return true;
    // The legacy label additionally has to prove it's football — see
    // FOOTBALL_RE. Without this, U-19 women's cricket walks straight back in
    // through the door the fold-in opens.
    return legacyLabels.some((age) => ageRegex(age).test(text)) && FOOTBALL_RE.test(text);
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
