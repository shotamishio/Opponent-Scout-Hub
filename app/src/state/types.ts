// State shape mirrors Scout Hub.dc.html lines 898-904 (`state = {...}`).
import type { ModeKey, ScreenKey, TierKey } from '@/types';
import type { CountryCode } from '@/data/pool';
import type { RosterEntry } from '@/data/defaultRoster';
import { loadRoster } from './rosterStorage';

export interface AppState {
  mode: ModeKey;
  screen: ScreenKey;
  code: CountryCode;
  gridVar: 'a' | 'b';
  detailVar: 'a' | 'b';
  tiers: TierKey[];
  manage: boolean;
  addOpen: boolean;
  video: 'idle' | 'run' | 'done';
  videoStep: number;
  url: string;
  saved: boolean;
  roster: Record<ModeKey, RosterEntry[]>;
}

/**
 * Built lazily rather than as a module constant: it reads localStorage, and
 * that shouldn't happen as a side effect of importing this module.
 */
export function createInitialState(): AppState {
  return {
    mode: 'nadeshiko',
    screen: 'home',
    code: 'ESP',
    gridVar: 'a',
    detailVar: 'a',
    tiers: ['T1', 'T2'],
    manage: false,
    addOpen: false,
    video: 'idle',
    videoStep: 0,
    url: 'https://www.youtube.com/watch?v=press-conf-esp-0812',
    saved: false,
    // Restored from the browser, so a country added by hand is still there on
    // the next visit — see rosterStorage.ts.
    roster: loadRoster(),
  };
}
