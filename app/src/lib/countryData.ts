// Slimmed down from the original design's synthetic version: match
// results/schedule/team-notes are no longer fabricated here — real news
// comes from collectedData.ts instead (see NewsTierColumns.tsx). Only the
// coach profile remains sample data for now (no free source identified yet
// for coaching records/reputation — flagged in the Coach screen itself).
import { POOL, type CountryCode } from '@/data/pool';
import { flag } from './flag';
import { coach, type Coach } from './coach';

export interface CountryData {
  code: CountryCode;
  ja: string;
  en: string;
  rank: number;
  conf: string;
  flag: string;
  flagSm: string;
  coach: Coach;
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
    coach: coach(code),
  };
}
