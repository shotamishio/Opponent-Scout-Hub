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
};

/**
 * @param {string} link - the article URL from the RSS item
 * @param {string} countryCode
 * @returns {'T1' | 'T2'}
 */
export function classifyTier(link, countryCode) {
  let host;
  try {
    host = new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return 'T2';
  }
  const federationDomain = FEDERATION_DOMAINS[countryCode];
  if (federationDomain && host.endsWith(federationDomain)) return 'T1';
  for (const domain of Object.keys(CONFEDERATION_DOMAINS)) {
    if (host.endsWith(domain)) return 'T1';
  }
  return 'T2';
}
