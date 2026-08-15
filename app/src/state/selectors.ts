// Ported from Scout Hub.dc.html: rosterOf (lines 905-908), the addable-country
// filter (line 1145), and the tier-filter predicate (line 1016).
import type { ModeKey, TierKey } from '@/types';
import { DEFAULT_ROSTER, type RosterEntry } from '@/data/defaultRoster';
import { POOL, type CountryCode } from '@/data/pool';
import { MODES, type Mode } from '@/data/modes';
import type { AppState } from './types';

export function rosterOf(state: AppState, mode: ModeKey): RosterEntry[] {
  return state.roster[mode] || DEFAULT_ROSTER[mode] || [];
}

export function currentMode(state: AppState): Mode {
  return MODES.find((m) => m.key === state.mode) || MODES[0];
}

export function addableCountries(state: AppState): CountryCode[] {
  const roster = rosterOf(state, state.mode);
  return (Object.keys(POOL) as CountryCode[]).filter((c) => !roster.some((r) => r[0] === c));
}

export function visibleNotes<T extends { tier: TierKey }>(state: AppState, notes: T[]): T[] {
  return notes.filter((n) => state.tiers.includes(n.tier));
}
