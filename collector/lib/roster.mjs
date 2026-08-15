// Minimal, hand-maintained mirror of the country data the collector needs
// (code -> Japanese/English name, for building search queries) and which
// countries to collect for.
//
// Deliberately NOT imported from ../app/src/data/*.ts — those are TypeScript
// and this is a plain scheduled Node script; keeping the collector
// dependency-free of a TS toolchain makes the GitHub Actions job simpler
// and more reliable. Kept in sync BY HAND with app/src/data/pool.ts,
// defaultRoster.ts and asia20.ts.
//
// Scope: every country that appears in any category's default roster OR any
// category's "Asia official matches" grid — i.e. everything reachable from
// the app without the user manually adding a country first. A manually
// added country (via the "＋対戦国を追加" dialog) won't have collected data
// until it's added here too.
export const COUNTRIES = {
  AUS: { ja: 'オーストラリア', en: 'Australia' },
  BAN: { ja: 'バングラデシュ', en: 'Bangladesh' },
  BRA: { ja: 'ブラジル', en: 'Brazil' },
  CAN: { ja: 'カナダ', en: 'Canada' },
  CHN: { ja: '中国', en: 'China PR' },
  COL: { ja: 'コロンビア', en: 'Colombia' },
  ENG: { ja: 'イングランド', en: 'England' },
  ESP: { ja: 'スペイン', en: 'Spain' },
  FRA: { ja: 'フランス', en: 'France' },
  GER: { ja: 'ドイツ', en: 'Germany' },
  IND: { ja: 'インド', en: 'India' },
  IRN: { ja: 'イラン', en: 'IR Iran' },
  JOR: { ja: 'ヨルダン', en: 'Jordan' },
  KOR: { ja: '韓国', en: 'Korea Republic' },
  MAS: { ja: 'マレーシア', en: 'Malaysia' },
  MEX: { ja: 'メキシコ', en: 'Mexico' },
  MYA: { ja: 'ミャンマー', en: 'Myanmar' },
  NED: { ja: 'オランダ', en: 'Netherlands' },
  NGA: { ja: 'ナイジェリア', en: 'Nigeria' },
  NZL: { ja: 'ニュージーランド', en: 'New Zealand' },
  PHI: { ja: 'フィリピン', en: 'Philippines' },
  PRK: { ja: '北朝鮮', en: 'Korea DPR' },
  SWE: { ja: 'スウェーデン', en: 'Sweden' },
  THA: { ja: 'タイ', en: 'Thailand' },
  TPE: { ja: '台湾', en: 'Chinese Taipei' },
  USA: { ja: 'アメリカ', en: 'USA' },
  UZB: { ja: 'ウズベキスタン', en: 'Uzbekistan' },
  VIE: { ja: 'ベトナム', en: 'Vietnam' },
};

// category -> which of the above countries it cares about, so each
// category's JSON file only contains what that screen actually shows.
export const CATEGORY_COUNTRIES = {
  nadeshiko: ['USA', 'ESP', 'ENG', 'SWE', 'GER', 'BRA', 'NED', 'FRA', 'CAN', 'AUS', 'NZL', 'COL', 'KOR', 'CHN', 'PRK', 'VIE', 'PHI', 'UZB', 'TPE', 'THA', 'MYA', 'JOR', 'IND'],
  u20: ['ESP', 'BRA', 'USA', 'NED', 'NGA', 'COL', 'FRA', 'MEX', 'PRK', 'KOR', 'CHN', 'AUS', 'VIE', 'UZB', 'TPE', 'THA', 'MYA'],
  u19: ['KOR', 'CHN', 'PRK', 'AUS', 'VIE', 'THA', 'TPE', 'MYA', 'UZB', 'JOR'],
  u17: ['PRK', 'ESP', 'USA', 'COL', 'NGA', 'BRA', 'ENG', 'MEX', 'KOR', 'CHN', 'AUS', 'PHI', 'THA', 'BAN', 'VIE', 'MAS'],
  u16: ['KOR', 'CHN', 'PRK', 'AUS', 'VIE', 'THA', 'TPE', 'BAN', 'IND', 'PHI', 'IRN', 'MAS'],
};
