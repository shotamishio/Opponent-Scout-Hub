// Basic per-country facts for the screens. Nothing here is generated any
// more: match results, schedules and team notes were dropped when the app
// moved to real news (see collectedData.ts), and the coach profile followed
// when it moved to Wikipedia — the coach now comes from getCoach() in
// collectedData.ts, keyed by category as well as country, since each age
// group has its own head coach.
import { POOL, type CountryCode } from '@/data/pool';
import { flag } from './flag';

export interface CountryData {
  code: CountryCode;
  ja: string;
  en: string;
  rank: number;
  conf: string;
  flag: string;
  flagSm: string;
}

export function countryData(code: CountryCode): CountryData {
  const c = POOL[code];
  return {
    code,
    ja: c.ja,
    en: c.en,
    rank: c.rank,
    conf: c.conf,
    flag: flag(code, 320),
    flagSm: flag(code, 40),
  };
}
