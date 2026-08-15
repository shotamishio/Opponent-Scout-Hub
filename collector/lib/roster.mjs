// Minimal, hand-maintained mirror of the country data the collector needs
// (code -> names, for building search queries and for checking that a
// returned headline is really about that country) and which countries to
// collect for.
//
// Three name fields, each with a different job:
//   ja     — Japanese name, matching app/src/data/pool.ts.
//   en     — FIFA-style English name, also matching pool.ts. Used for display
//            parity with the app, NOT for searching: FIFA writes "Korea DPR"
//            and "China PR", which English-language media never do, so
//            searching those names returns near-random results.
//   search — the name media actually use, used to build the query.
//   aliases — everything a headline might call this team, including
//            nicknames. Used by topic.mjs to verify a result is on-topic.
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
  AUS: { ja: 'オーストラリア', en: 'Australia', search: 'Australia', aliases: ['Australia', 'Australian', 'Matildas'] },
  BAN: { ja: 'バングラデシュ', en: 'Bangladesh', search: 'Bangladesh', aliases: ['Bangladesh', 'Bangladeshi'] },
  BRA: { ja: 'ブラジル', en: 'Brazil', search: 'Brazil', aliases: ['Brazil', 'Brazilian', 'Seleção'] },
  CAN: { ja: 'カナダ', en: 'Canada', search: 'Canada', aliases: ['Canada', 'Canadian', 'CanWNT'] },
  CHN: { ja: '中国', en: 'China PR', search: 'China', aliases: ['China', 'Chinese', 'China PR', 'Steel Roses'] },
  COL: { ja: 'コロンビア', en: 'Colombia', search: 'Colombia', aliases: ['Colombia', 'Colombian'] },
  ENG: { ja: 'イングランド', en: 'England', search: 'England', aliases: ['England', 'English', 'Lionesses'] },
  ESP: { ja: 'スペイン', en: 'Spain', search: 'Spain', aliases: ['Spain', 'Spanish', 'La Roja'] },
  FRA: { ja: 'フランス', en: 'France', search: 'France', aliases: ['France', 'French', 'Les Bleues'] },
  GER: { ja: 'ドイツ', en: 'Germany', search: 'Germany', aliases: ['Germany', 'German'] },
  IND: { ja: 'インド', en: 'India', search: 'India', aliases: ['India', 'Indian', 'Blue Tigresses'] },
  IRN: { ja: 'イラン', en: 'IR Iran', search: 'Iran', aliases: ['Iran', 'Iranian', 'IR Iran'] },
  JOR: { ja: 'ヨルダン', en: 'Jordan', search: 'Jordan', aliases: ['Jordan', 'Jordanian'] },
  KOR: { ja: '韓国', en: 'Korea Republic', search: 'South Korea', aliases: ['South Korea', 'Korea Republic', 'Republic of Korea', 'Taegeuk Ladies'] },
  MAS: { ja: 'マレーシア', en: 'Malaysia', search: 'Malaysia', aliases: ['Malaysia', 'Malaysian'] },
  MEX: { ja: 'メキシコ', en: 'Mexico', search: 'Mexico', aliases: ['Mexico', 'Mexican', 'El Tri'] },
  MYA: { ja: 'ミャンマー', en: 'Myanmar', search: 'Myanmar', aliases: ['Myanmar', 'Burmese'] },
  NED: { ja: 'オランダ', en: 'Netherlands', search: 'Netherlands', aliases: ['Netherlands', 'Dutch', 'Holland', 'Oranje'] },
  NGA: { ja: 'ナイジェリア', en: 'Nigeria', search: 'Nigeria', aliases: ['Nigeria', 'Nigerian', 'Super Falcons', 'Falconets', 'Flamingos'] },
  NZL: { ja: 'ニュージーランド', en: 'New Zealand', search: 'New Zealand', aliases: ['New Zealand', 'Football Ferns'] },
  PHI: { ja: 'フィリピン', en: 'Philippines', search: 'Philippines', aliases: ['Philippines', 'Philippine', 'Filipina', 'Filipinas'] },
  PRK: { ja: '北朝鮮', en: 'Korea DPR', search: 'North Korea', aliases: ['North Korea', 'Korea DPR', 'DPR Korea', 'DPRK'] },
  SWE: { ja: 'スウェーデン', en: 'Sweden', search: 'Sweden', aliases: ['Sweden', 'Swedish'] },
  THA: { ja: 'タイ', en: 'Thailand', search: 'Thailand', aliases: ['Thailand', 'Thai', 'Chaba Kaew'] },
  TPE: { ja: '台湾', en: 'Chinese Taipei', search: 'Chinese Taipei', aliases: ['Chinese Taipei', 'Taiwan', 'Taiwanese'] },
  // no bare 'US' alias: matching is case-insensitive, so it would fire on the
  // English pronoun "us" in any headline.
  USA: { ja: 'アメリカ', en: 'USA', search: 'United States', aliases: ['United States', 'USA', 'U.S.', 'USWNT', 'American'] },
  UZB: { ja: 'ウズベキスタン', en: 'Uzbekistan', search: 'Uzbekistan', aliases: ['Uzbekistan', 'Uzbek'] },
  VIE: { ja: 'ベトナム', en: 'Vietnam', search: 'Vietnam', aliases: ['Vietnam', 'Vietnamese'] },
};

// category -> which of the above countries it cares about, so each
// category's JSON file only contains what that screen actually shows.
//
// Keys must match the app's ModeKey (app/src/types.ts) and CATEGORY_TOPICS in
// topic.mjs. Standalone u19 and u16 keys existed until 2026-08-15; AFC/FIFA
// run those age groups as U-20 and U-17, so their coverage is collected under
// those categories instead (see CATEGORY_TOPICS.ages in topic.mjs).
//
// The countries those two categories used to monitor came along with them:
// JOR was U-19 only, and TPE/IND/IRN were U-16 only. They are listed here —
// and in the app's defaultRoster.ts — so that folding the age groups together
// doesn't quietly drop the opponents that were only ever tracked at that
// level.
export const CATEGORY_COUNTRIES = {
  nadeshiko: ['USA', 'ESP', 'ENG', 'SWE', 'GER', 'BRA', 'NED', 'FRA', 'CAN', 'AUS', 'NZL', 'COL', 'KOR', 'CHN', 'PRK', 'VIE', 'PHI', 'UZB', 'TPE', 'THA', 'MYA', 'JOR', 'IND'],
  u20: ['ESP', 'BRA', 'USA', 'NED', 'NGA', 'COL', 'FRA', 'MEX', 'PRK', 'KOR', 'CHN', 'AUS', 'VIE', 'UZB', 'TPE', 'THA', 'MYA', 'JOR'],
  u17: ['PRK', 'ESP', 'USA', 'COL', 'NGA', 'BRA', 'ENG', 'MEX', 'KOR', 'CHN', 'AUS', 'PHI', 'THA', 'BAN', 'VIE', 'MAS', 'TPE', 'IND', 'IRN'],
};
