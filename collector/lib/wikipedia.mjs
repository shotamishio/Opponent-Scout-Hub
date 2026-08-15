// Collects the head coach of each opponent team from Wikipedia — free, no API
// key, no auth, and the one source that actually covers women's national teams
// across every country and age group.
//
// Until now the Coach screen showed sample data: a name picked from a fixed
// list by hashing the country code, with an invented career, record and
// reputation. For a scouting tool that is worse than showing nothing, because
// nothing on the screen said which parts were real.
//
// Three steps per team, all through public MediaWiki APIs:
//   1. resolveArticle  — find the team's article ("Spain women's national
//      football team"). Titles vary: some countries file under "soccer", so
//      candidates are tried in order and redirects are followed.
//   2. extractManager  — read the head coach out of the article's infobox.
//   3. fetchPersonSummary — the coach's own article: a career summary in
//      their own words, plus the URL to read the full thing.
//
// Everything that parses text is exported separately from everything that
// makes a request, so the parsing is unit-tested against fixtures (this
// sandbox can't reach wikipedia.org either — see collect.mjs's header).
const API = 'https://en.wikipedia.org/w/api.php';
const REST = 'https://en.wikipedia.org/api/rest_v1';

// Wikipedia asks that tools identify themselves and give a contact point.
const HEADERS = {
  'User-Agent': 'OpponentScoutHubCollector/1.0 (https://github.com/shotamishio/Opponent-Scout-Hub)',
};

/**
 * Article titles to try for one team, best first. English Wikipedia files
 * some countries' teams under "soccer" (USA, Canada, Australia) and the rest
 * under "football", and the redirects between the two are not reliable in
 * both directions — so both are always tried.
 *
 * @param {string} wikiName - the country as Wikipedia names it
 * @param {number[]} ages - CATEGORY_TOPICS ages; empty for the senior team
 */
export function teamArticleCandidates(wikiName, ages) {
  const sports = ['football', 'soccer'];
  if (!ages.length) return sports.map((s) => `${wikiName} women's national ${s} team`);
  // Youth teams: the category's own age first, then the label the same team
  // used to be listed under (see CATEGORY_TOPICS.ages).
  return ages.flatMap((age) => sports.map((s) => `${wikiName} women's national under-${age} ${s} team`));
}

/**
 * Pulls the head coach out of an article's wikitext infobox.
 *
 * Returns the display name and, when the value was a wiki link, the title of
 * the coach's own article — which is what the biography lookup needs, since
 * the displayed name is often shortened ("[[Futoshi Ikeda|Ikeda]]").
 *
 * @param {string} wikitext
 * @returns {{name: string, article: string|null}|null}
 */
export function extractManager(wikitext) {
  if (!wikitext) return null;
  // Infobox field names differ between the football and soccer templates.
  const match = /^\s*\|\s*(?:manager|head_coach|headcoach|coach)\s*(?:\d+)?\s*=\s*(.+)$/im.exec(wikitext);
  if (!match) return null;
  return cleanFieldValue(match[1]);
}

/**
 * Turns one raw infobox value into a plain name.
 * Exported for tests: real infobox values carry flag icons, nowrap wrappers,
 * references and HTML comments around the name.
 *
 * @param {string} raw
 * @returns {{name: string, article: string|null}|null}
 */
export function cleanFieldValue(raw) {
  let value = String(raw);
  value = value.replace(/<!--[\s\S]*?-->/g, '');
  value = value.replace(/<ref[^>]*\/>/gi, '');
  value = value.replace(/<ref[\s\S]*?<\/ref>/gi, '');
  // Drop templates that only add decoration, but keep what a wrapper wraps:
  // {{nowrap|[[Name]]}} has to survive as [[Name]].
  value = value.replace(/\{\{\s*(?:flagicon|flagu?|fbicon|small|nobold)[^{}]*\}\}/gi, '');
  value = value.replace(/\{\{\s*(?:nowrap|nobr|sortname)\s*\|([^{}]*)\}\}/gi, '$1');
  value = value.replace(/\{\{[^{}]*\}\}/g, '');

  let article = null;
  const link = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(value);
  if (link) {
    article = link[1].trim();
    value = link[2] ?? link[1];
  }
  // Anything trailing the name — "(interim)", a date, a stray pipe.
  value = value.replace(/<[^>]+>/g, '').replace(/^[\s|]+|[\s|]+$/g, '').trim();
  if (!value) return null;
  return { name: value, article };
}

async function apiJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Wikipedia request failed: ${res.status} ${url}`);
  return res.json();
}

/**
 * First candidate title that exists, with redirects followed to the real
 * article. Returns null when none of them exist — which is a normal outcome:
 * plenty of countries have no article for their U-17 women's team.
 *
 * @param {string[]} candidates
 * @returns {Promise<string|null>}
 */
export async function resolveArticle(candidates) {
  const params = new URLSearchParams({
    action: 'query',
    titles: candidates.join('|'),
    redirects: '1',
    format: 'json',
    formatversion: '2',
  });
  const data = await apiJson(`${API}?${params}`);
  const pages = data?.query?.pages ?? [];
  // Preserve candidate order: the API returns pages in its own order, and the
  // first candidate is the one most likely to be the right article.
  const resolved = new Map();
  for (const redirect of data?.query?.redirects ?? []) resolved.set(redirect.from, redirect.to);
  for (const candidate of candidates) {
    const target = resolved.get(candidate) ?? candidate;
    const page = pages.find((p) => p.title === target);
    if (page && !page.missing) return page.title;
  }
  return null;
}

/** Raw wikitext of an article, for extractManager. */
export async function fetchWikitext(title) {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'revisions',
    rvprop: 'content',
    rvslots: 'main',
    format: 'json',
    formatversion: '2',
  });
  const data = await apiJson(`${API}?${params}`);
  const page = data?.query?.pages?.[0];
  return page?.revisions?.[0]?.slots?.main?.content ?? null;
}

/**
 * A person's article summary: the opening paragraphs, which for a coach is
 * their career in brief, plus the canonical URL to read the rest.
 *
 * @param {string} title
 * @returns {Promise<{title: string, description: string|null, extract: string|null, url: string}|null>}
 */
export async function fetchPersonSummary(title) {
  const res = await fetch(`${REST}/page/summary/${encodeURIComponent(title)}`, { headers: HEADERS });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Wikipedia summary failed: ${res.status} ${title}`);
  const data = await res.json();
  // Disambiguation pages are not a biography.
  if (data.type === 'disambiguation') return null;
  return {
    title: data.title,
    description: data.description ?? null,
    extract: data.extract ?? null,
    url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

export function articleUrl(title) {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

/**
 * The whole lookup for one team. Never throws for "not found" — a missing
 * coach is data, not an error — but does throw if Wikipedia itself fails, so
 * the caller can keep the previous run's answer.
 *
 * @param {string} wikiName
 * @param {number[]} ages
 */
export async function findCoach(wikiName, ages) {
  const teamArticle = await resolveArticle(teamArticleCandidates(wikiName, ages));
  if (!teamArticle) return { status: 'no_team_article' };

  const manager = extractManager(await fetchWikitext(teamArticle));
  if (!manager) {
    return { status: 'no_coach_listed', teamArticle, teamUrl: articleUrl(teamArticle) };
  }

  const summary = manager.article ? await fetchPersonSummary(manager.article) : null;
  return {
    status: 'ok',
    name: manager.name,
    teamArticle,
    teamUrl: articleUrl(teamArticle),
    profileUrl: summary?.url ?? null,
    description: summary?.description ?? null,
    bio: summary?.extract ?? null,
  };
}
