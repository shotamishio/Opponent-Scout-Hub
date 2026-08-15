// State shape mirrors Scout Hub.dc.html lines 898-904 (`state = {...}`).
import type { ModeKey, ScreenKey, TierKey } from '@/types';
import type { CountryCode } from '@/data/pool';
import { DEFAULT_ROSTER, type RosterEntry } from '@/data/defaultRoster';

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

export const initialAppState: AppState = {
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
  roster: {
    nadeshiko: [...DEFAULT_ROSTER.nadeshiko],
    u20: [...DEFAULT_ROSTER.u20],
    u17: [...DEFAULT_ROSTER.u17],
  },
};
