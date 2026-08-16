// Action set covers every setState closure in Scout Hub.dc.html's renderVals()
// (lines 1112-1171).
import type { ModeKey, ScreenKey, TierKey } from '@/types';
import type { CountryCode } from '@/data/pool';
import type { AppState } from './types';
import type { RosterEntry } from '@/data/defaultRoster';
import { rosterOf } from './selectors';

export type AppAction =
  | { type: 'SET_MODE'; mode: ModeKey }
  | { type: 'GO_SCREEN'; screen: ScreenKey }
  | { type: 'OPEN_COUNTRY'; code: CountryCode }
  | { type: 'SET_GRID_VAR'; value: 'a' | 'b' }
  | { type: 'SET_DETAIL_VAR'; value: 'a' | 'b' }
  | { type: 'TOGGLE_TIER'; tier: TierKey }
  | { type: 'TOGGLE_MANAGE' }
  | { type: 'OPEN_ADD' }
  | { type: 'CLOSE_ADD' }
  | { type: 'ADD_COUNTRY'; code: CountryCode }
  | { type: 'REMOVE_COUNTRY'; code: CountryCode }
  | { type: 'REPLACE_ROSTER'; roster: Record<ModeKey, RosterEntry[]> }
  | { type: 'SET_URL'; url: string }
  | { type: 'START_ANALYZE' }
  | { type: 'SET_VIDEO_STEP'; step: number }
  | { type: 'FINISH_ANALYZE' }
  | { type: 'SAVE_MEMO' };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MODE':
      // Source: pick:()=>this.setState({mode:x.key, screen:'home'}) — line 1119
      return { ...state, mode: action.mode, screen: 'home' };
    case 'GO_SCREEN':
      return { ...state, screen: action.screen };
    case 'OPEN_COUNTRY':
      return { ...state, code: action.code, screen: 'country' };
    case 'SET_GRID_VAR':
      return { ...state, gridVar: action.value };
    case 'SET_DETAIL_VAR':
      return { ...state, detailVar: action.value };
    case 'TOGGLE_TIER': {
      const tiers = state.tiers.includes(action.tier)
        ? state.tiers.filter((t) => t !== action.tier)
        : [...state.tiers, action.tier].sort();
      return { ...state, tiers };
    }
    case 'TOGGLE_MANAGE':
      return { ...state, manage: !state.manage };
    case 'OPEN_ADD':
      return { ...state, addOpen: true };
    case 'CLOSE_ADD':
      return { ...state, addOpen: false };
    case 'REPLACE_ROSTER':
      // Whole-list replacement, from an imported file. Edit mode stays on:
      // the import controls live there, and leaving it would take the
      // "loaded N countries" confirmation off screen with them.
      return { ...state, roster: action.roster, addOpen: false };
    case 'ADD_COUNTRY':
      return {
        ...state,
        addOpen: false,
        roster: {
          ...state.roster,
          [state.mode]: [...rosterOf(state, state.mode), [action.code, 'ADD']],
        },
      };
    case 'REMOVE_COUNTRY':
      return {
        ...state,
        roster: {
          ...state.roster,
          [state.mode]: rosterOf(state, state.mode).filter((r) => r[0] !== action.code),
        },
      };
    case 'SET_URL':
      return { ...state, url: action.url };
    case 'START_ANALYZE':
      return { ...state, video: 'run', videoStep: 0 };
    case 'SET_VIDEO_STEP':
      return { ...state, videoStep: action.step };
    case 'FINISH_ANALYZE':
      return { ...state, video: 'done' };
    case 'SAVE_MEMO':
      return { ...state, saved: true };
    default:
      return state;
  }
}
