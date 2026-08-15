// Ported from Scout Hub.dc.html lines 826-867 (POOL) and line 910 (ISO).

export interface CountryInfo {
  ja: string;
  en: string;
  rank: number;
  conf: string;
}

export const POOL = {
  USA: { ja: 'アメリカ', en: 'USA', rank: 1, conf: 'CONCACAF' },
  ESP: { ja: 'スペイン', en: 'Spain', rank: 2, conf: 'UEFA' },
  GER: { ja: 'ドイツ', en: 'Germany', rank: 3, conf: 'UEFA' },
  ENG: { ja: 'イングランド', en: 'England', rank: 4, conf: 'UEFA' },
  SWE: { ja: 'スウェーデン', en: 'Sweden', rank: 5, conf: 'UEFA' },
  FRA: { ja: 'フランス', en: 'France', rank: 6, conf: 'UEFA' },
  BRA: { ja: 'ブラジル', en: 'Brazil', rank: 7, conf: 'CONMEBOL' },
  NED: { ja: 'オランダ', en: 'Netherlands', rank: 8, conf: 'UEFA' },
  PRK: { ja: '北朝鮮', en: 'Korea DPR', rank: 9, conf: 'AFC' },
  CAN: { ja: 'カナダ', en: 'Canada', rank: 10, conf: 'CONCACAF' },
  DEN: { ja: 'デンマーク', en: 'Denmark', rank: 11, conf: 'UEFA' },
  ITA: { ja: 'イタリア', en: 'Italy', rank: 12, conf: 'UEFA' },
  NOR: { ja: 'ノルウェー', en: 'Norway', rank: 13, conf: 'UEFA' },
  AUS: { ja: 'オーストラリア', en: 'Australia', rank: 15, conf: 'AFC' },
  CHN: { ja: '中国', en: 'China PR', rank: 17, conf: 'AFC' },
  AUT: { ja: 'オーストリア', en: 'Austria', rank: 19, conf: 'UEFA' },
  KOR: { ja: '韓国', en: 'Korea Republic', rank: 20, conf: 'AFC' },
  COL: { ja: 'コロンビア', en: 'Colombia', rank: 22, conf: 'CONMEBOL' },
  NZL: { ja: 'ニュージーランド', en: 'New Zealand', rank: 26, conf: 'OFC' },
  MEX: { ja: 'メキシコ', en: 'Mexico', rank: 27, conf: 'CONCACAF' },
  POL: { ja: 'ポーランド', en: 'Poland', rank: 28, conf: 'UEFA' },
  ARG: { ja: 'アルゼンチン', en: 'Argentina', rank: 30, conf: 'CONMEBOL' },
  NGA: { ja: 'ナイジェリア', en: 'Nigeria', rank: 36, conf: 'CAF' },
  VIE: { ja: 'ベトナム', en: 'Vietnam', rank: 37, conf: 'AFC' },
  PHI: { ja: 'フィリピン', en: 'Philippines', rank: 41, conf: 'AFC' },
  TPE: { ja: '台湾', en: 'Chinese Taipei', rank: 42, conf: 'AFC' },
  THA: { ja: 'タイ', en: 'Thailand', rank: 46, conf: 'AFC' },
  PAR: { ja: 'パラグアイ', en: 'Paraguay', rank: 49, conf: 'CONMEBOL' },
  UZB: { ja: 'ウズベキスタン', en: 'Uzbekistan', rank: 51, conf: 'AFC' },
  MAR: { ja: 'モロッコ', en: 'Morocco', rank: 58, conf: 'CAF' },
  CMR: { ja: 'カメルーン', en: 'Cameroon', rank: 61, conf: 'CAF' },
  ECU: { ja: 'エクアドル', en: 'Ecuador', rank: 63, conf: 'CONMEBOL' },
  ZAM: { ja: 'ザンビア', en: 'Zambia', rank: 64, conf: 'CAF' },
  IND: { ja: 'インド', en: 'India', rank: 65, conf: 'AFC' },
  JOR: { ja: 'ヨルダン', en: 'Jordan', rank: 74, conf: 'AFC' },
  MYA: { ja: 'ミャンマー', en: 'Myanmar', rank: 55, conf: 'AFC' },
  BAN: { ja: 'バングラデシュ', en: 'Bangladesh', rank: 132, conf: 'AFC' },
  HKG: { ja: '香港', en: 'Hong Kong', rank: 78, conf: 'AFC' },
  IRN: { ja: 'イラン', en: 'IR Iran', rank: 68, conf: 'AFC' },
  MAS: { ja: 'マレーシア', en: 'Malaysia', rank: 87, conf: 'AFC' },
  SIN: { ja: 'シンガポール', en: 'Singapore', rank: 130, conf: 'AFC' },
  GUM: { ja: 'グアム', en: 'Guam', rank: 140, conf: 'AFC' },
} as const satisfies Record<string, CountryInfo>;

export type CountryCode = keyof typeof POOL;

// JPN isn't in POOL (Japan is never an "opponent") but appears in the AFC
// opponent pool as a placeholder confederation-mate, so ISO needs it too.
export const ISO: Record<CountryCode | 'JPN', string> = {
  USA: 'us', ESP: 'es', GER: 'de', ENG: 'gb-eng', SWE: 'se', FRA: 'fr', BRA: 'br', NED: 'nl',
  PRK: 'kp', CAN: 'ca', DEN: 'dk', ITA: 'it', NOR: 'no', AUS: 'au', CHN: 'cn', AUT: 'at',
  KOR: 'kr', COL: 'co', NZL: 'nz', MEX: 'mx', POL: 'pl', ARG: 'ar', NGA: 'ng', VIE: 'vn',
  PHI: 'ph', TPE: 'tw', THA: 'th', PAR: 'py', UZB: 'uz', MAR: 'ma', CMR: 'cm', ECU: 'ec',
  ZAM: 'zm', IND: 'in', JOR: 'jo', MYA: 'mm', BAN: 'bd', HKG: 'hk', IRN: 'ir', MAS: 'my',
  SIN: 'sg', GUM: 'gu', JPN: 'jp',
};
