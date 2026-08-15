// Ported from Scout Hub.dc.html lines 891-897.
import type { ModeKey, RosterGroup } from '@/types';
import type { CountryCode } from './pool';

export type RosterEntry = [CountryCode, RosterGroup];

export const DEFAULT_ROSTER: Record<ModeKey, RosterEntry[]> = {
  nadeshiko: [
    ['USA', 'WC'], ['ESP', 'WC'], ['ENG', 'WC'], ['SWE', 'WC'], ['GER', 'WC'], ['BRA', 'WC'], ['NED', 'WC'], ['FRA', 'WC'],
    ['CAN', 'OLY'], ['AUS', 'OLY'], ['NZL', 'OLY'], ['COL', 'OLY'],
    ['KOR', 'AFC'], ['CHN', 'AFC'], ['PRK', 'AFC'], ['VIE', 'AFC'], ['PHI', 'AFC'], ['UZB', 'AFC'],
  ],
  u20: [
    ['ESP', 'WC'], ['BRA', 'WC'], ['USA', 'WC'], ['NED', 'WC'], ['NGA', 'WC'], ['COL', 'WC'], ['FRA', 'WC'], ['MEX', 'WC'],
    ['PRK', 'AFC'], ['KOR', 'AFC'], ['CHN', 'AFC'], ['AUS', 'AFC'], ['VIE', 'AFC'], ['UZB', 'AFC'],
  ],
  u19: [
    ['KOR', 'AFC'], ['CHN', 'AFC'], ['PRK', 'AFC'], ['AUS', 'AFC'], ['VIE', 'AFC'],
    ['THA', 'AFC'], ['TPE', 'AFC'], ['MYA', 'AFC'], ['UZB', 'AFC'], ['JOR', 'AFC'],
  ],
  u17: [
    ['PRK', 'WC'], ['ESP', 'WC'], ['USA', 'WC'], ['COL', 'WC'], ['NGA', 'WC'], ['BRA', 'WC'], ['ENG', 'WC'], ['MEX', 'WC'],
    ['KOR', 'AFC'], ['CHN', 'AFC'], ['AUS', 'AFC'], ['PHI', 'AFC'], ['THA', 'AFC'], ['BAN', 'AFC'],
  ],
  u16: [
    ['KOR', 'AFC'], ['CHN', 'AFC'], ['PRK', 'AFC'], ['AUS', 'AFC'], ['VIE', 'AFC'],
    ['THA', 'AFC'], ['TPE', 'AFC'], ['BAN', 'AFC'], ['IND', 'AFC'], ['PHI', 'AFC'],
  ],
};
