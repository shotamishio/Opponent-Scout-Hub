import { XMLParser } from 'fast-xml-parser';
import { classifyTier } from './officialDomains.mjs';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

/**
 * Fetches Google News RSS for a search query — free, no API key, no auth.
 * This is the "news" data source for the whole collector: it aggregates
 * many outlets (including wire-service pickups of official federation
 * announcements), so it stands in for both "ネットのニュース" and,
 * loosely, "公式サイト" (federation press releases usually get indexed
 * here too, and get classified T1 when the source domain matches
 * officialDomains.mjs).
 *
 * @param {string} query
 * @returns {Promise<{title:string, link:string, sourceName:string, sourceUrl:string, publishedAt:string}[]>}
 */
export async function fetchGoogleNews(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OpponentScoutHubCollector/1.0)' },
  });
  if (!res.ok) throw new Error(`Google News RSS request failed: ${res.status} ${url}`);
  const xml = await res.text();
  return parseGoogleNewsRss(xml);
}

/** Exported separately so it can be unit-tested against a fixture with no network call. */
export function parseGoogleNewsRss(xml) {
  const doc = parser.parse(xml);
  const rawItems = doc?.rss?.channel?.item;
  if (!rawItems) return [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];
  return items.map((item) => ({
    title: stripSourceSuffix(String(item.title ?? '')),
    link: String(item.link ?? ''),
    sourceName: String(item.source?.['#text'] ?? item.source ?? '不明'),
    sourceUrl: String(item.source?.['@_url'] ?? ''),
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : null,
  }));
}

// Google News titles are formatted "Headline - Source Name"; the source
// name is already available structured in <source>, so drop the suffix to
// avoid showing it twice.
function stripSourceSuffix(title) {
  const idx = title.lastIndexOf(' - ');
  return idx === -1 ? title : title.slice(0, idx);
}

/**
 * @param {string} query
 * @param {string} countryCode
 */
export async function fetchAndClassify(query, countryCode) {
  const items = await fetchGoogleNews(query);
  return items.map((item) => ({
    ...item,
    tier: classifyTier(item.sourceUrl || item.link, countryCode),
  }));
}
