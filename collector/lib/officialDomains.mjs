// Best-effort domain list used to classify a news item as T1 (協会・クラブ公式)
// instead of the T2 default. This is NOT a verified/authoritative list — it's
// a starting point built from general knowledge, not live-checked (this
// sandbox can't reach these sites to verify). A wrong or outdated domain here
// is harmless (it just never matches, so that source stays classified as T2)
// — but it should be reviewed and expanded by someone who can check the
// federations' actual current sites. Add entries as you confirm them.

// Confederation- and FIFA-level domains apply regardless of country.
export const CONFEDERATION_DOMAINS = {
  'fifa.com': 'FIFA',
  'uefa.com': 'UEFA',
  'concacaf.com': 'CONCACAF',
  'conmebol.com': 'CONMEBOL',
  'the-afc.com': 'AFC',
  'afc.com': 'AFC',
  'cafonline.com': 'CAF',
  'oceaniafootball.com': 'OFC',
};

// Per-country national federation domains, keyed by the same country codes
// used in app/src/data/pool.ts. Only includes entries with reasonable
// confidence; countries not listed here simply never get a T1 domain match
// and their news lands in T2 by default, which is a safe fallback.
//
// These are also what the collector searches directly (buildFederationQuery
// in topic.mjs), so a wrong entry costs a query that returns nothing rather
// than producing wrong data — but it does mean that country's official
// announcements go uncollected, so entries are worth verifying.
export const FEDERATION_DOMAINS = {
  USA: 'ussoccer.com',
  ESP: 'rfef.es',
  GER: 'dfb.de',
  ENG: 'thefa.com',
  SWE: 'svenskfotboll.se',
  FRA: 'fff.fr',
  BRA: 'cbf.com.br',
  NED: 'knvb.nl',
  CAN: 'canadasoccer.com',
  DEN: 'dbu.dk',
  ITA: 'figc.it',
  NOR: 'fotball.no',
  AUS: 'footballaustralia.com.au',
  AUT: 'oefb.at',
  KOR: 'kfa.or.kr',
  COL: 'fcf.com.co',
  NZL: 'nzfootball.co.nz',
  MEX: 'fmf.mx',
  POL: 'pzpn.pl',
  ARG: 'afa.com.ar',
  VIE: 'vff.org.vn',
  PHI: 'pff.org.ph',
  THA: 'fat.or.th',
  PAR: 'apf.org.py',
  MAR: 'frmf.ma',
  ECU: 'ecuafutbol.org',
  IND: 'the-aiff.com',
  HKG: 'hkfa.com',
  MAS: 'fam.org.my',
  SIN: 'fas.org.sg',
  JPN: 'jfa.jp',
  // Added when the collector started searching federation sites directly, so
  // that the Asian and African opponents on the current rosters are covered
  // too. Same caveat as above: written from general knowledge, not verified
  // from this sandbox.
  BAN: 'bff.com.bd',
  CHN: 'thecfa.cn',
  IRN: 'ffiri.ir',
  JOR: 'jfa.jo',
  MYA: 'myanmarfootball.org',
  NGA: 'thenff.com',
  TPE: 'ctfa.com.tw',
  UZB: 'uzfa.uz',
  // Added with the rest of the app's country pool.
  CMR: 'fecafootofficiel.com',
  ZAM: 'fazfootball.com',
  GUM: 'guamfootball.com',
  // PRK (Korea DPR) is deliberately absent: the DPRK federation has no
  // usable public site, so there is nothing to point a search at.
};

function hostOf(link) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * The country's federation website, or null if we don't have a domain for it.
 * Shown in the app as a "go to the source" link on the country and coach
 * screens, and used to scope the federation search.
 *
 * @param {string} countryCode
 */
export function federationUrl(countryCode) {
  const domain = FEDERATION_DOMAINS[countryCode];
  return domain ? `https://${domain}` : null;
}

/**
 * Is this article published by THIS country's own federation? Narrower than
 * classifyTier — a confederation domain (FIFA/AFC/UEFA) is T1 too, but it
 * covers every country and both genders, so it proves nothing about who the
 * article is about. Used by topic.mjs, which treats the country's own
 * federation as proof of country.
 *
 * @param {string} link
 * @param {string} countryCode
 */
export function isOwnFederationSource(link, countryCode) {
  const federationDomain = FEDERATION_DOMAINS[countryCode];
  if (!federationDomain) return false;
  const host = hostOf(link);
  return host != null && host.endsWith(federationDomain);
}

/**
 * @param {string} link - the article URL from the RSS item
 * @param {string} countryCode
 * @returns {'T1' | 'T2'}
 */
export function classifyTier(link, countryCode) {
  const host = hostOf(link);
  if (host == null) return 'T2';
  if (isOwnFederationSource(link, countryCode)) return 'T1';
  for (const domain of Object.keys(CONFEDERATION_DOMAINS)) {
    if (host.endsWith(domain)) return 'T1';
  }
  return 'T2';
}
