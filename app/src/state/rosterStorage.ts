// Keeps each category's opponent list in the browser between visits.
//
// Without this, a country added through the "＋対戦国を追加" dialog lasted
// only until the tab was closed or reloaded — including the reload that
// follows a deploy of the site. A watch list an analyst has curated should
// last until they remove the country themselves, so it is stored locally and
// only ever changed by the add/remove actions.
//
// Stored in the browser rather than the repository because the published site
// is static: there is nothing to save to, and it is one analyst's own list.
// The consequence is that it doesn't follow them to another browser.
import { MODES } from '@/data/modes';
import { POOL, type CountryCode } from '@/data/pool';
import type { ModeKey, RosterGroup } from '@/types';
import { DEFAULT_ROSTER, type RosterEntry } from '@/data/defaultRoster';

const STORAGE_KEY = 'osh.roster.v1';

export type RosterMap = Record<ModeKey, RosterEntry[]>;

export function defaultRosterMap(): RosterMap {
  return Object.fromEntries(MODES.map((mode) => [mode.key, [...DEFAULT_ROSTER[mode.key]]])) as RosterMap;
}

const GROUPS: RosterGroup[] = ['WC', 'OLY', 'AFC', 'ADD'];

/**
 * Reads the saved roster, falling back to the defaults. Entries are validated
 * one by one: a country or category that no longer exists (the U-19/U-16
 * categories were removed once already) is dropped rather than allowed to
 * break the screens, and a category missing from the saved data falls back to
 * its default rather than coming up empty.
 */
export function loadRoster(): RosterMap {
  const fallback = defaultRosterMap();
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). Not fatal.
    return fallback;
  }
  if (!raw) return fallback;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;
    const result = fallback;
    for (const mode of MODES) {
      const saved = (parsed as Record<string, unknown>)[mode.key];
      if (!Array.isArray(saved)) continue;
      const entries = saved.filter(isRosterEntry);
      // An empty list is a legitimate choice — the user removed everything —
      // so it is kept as-is rather than being refilled with the defaults.
      result[mode.key] = entries;
    }
    return result;
  } catch {
    return fallback;
  }
}

export function saveRoster(roster: RosterMap): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
  } catch {
    // Out of quota or storage blocked: the list still works for this session.
  }
}

function isRosterEntry(value: unknown): value is RosterEntry {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const [code, group] = value as [unknown, unknown];
  return (
    typeof code === 'string' &&
    Object.prototype.hasOwnProperty.call(POOL, code) &&
    typeof group === 'string' &&
    GROUPS.includes(group as RosterGroup)
  );
}

export function isKnownCountry(code: string): code is CountryCode {
  return Object.prototype.hasOwnProperty.call(POOL, code);
}

// --- Export / import -------------------------------------------------------
//
// The saved list lives in one browser, so it doesn't follow the analyst to
// another machine. A file is the way across: written by hand from the app,
// read back on the other machine. Deliberately a plain readable JSON file —
// small enough to check by eye, and to hand to someone else.

const FILE_FORMAT = 'opponent-scout-hub.roster';
const FILE_VERSION = 1;

export function serializeRoster(roster: RosterMap): string {
  return JSON.stringify({ format: FILE_FORMAT, version: FILE_VERSION, exportedAt: new Date().toISOString(), roster }, null, 2);
}

export interface ImportResult {
  roster: RosterMap;
  /** Countries kept, per category, for the confirmation message. */
  counts: { mode: ModeKey; count: number }[];
  /** Entries dropped because the country or category is unknown to this version. */
  skipped: number;
}

/**
 * Reads an exported file back. Everything is validated: the file may come
 * from an older version of the app (the U-19/U-16 categories existed once)
 * or have been edited by hand, and a bad entry must be dropped rather than
 * left to break the screens. Throws only when the file isn't one of ours at
 * all, so the caller can say why.
 */
export function parseRosterFile(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('JSONとして読み取れませんでした');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('中身が空か、形式が違います');

  const container = parsed as Record<string, unknown>;
  // Accept both the wrapped file and a bare category->entries map, so a
  // hand-trimmed file still loads.
  const source = (container.roster ?? container) as Record<string, unknown>;
  if (container.format !== undefined && container.format !== FILE_FORMAT) {
    throw new Error('このアプリの対戦国リストではありません');
  }

  const roster = defaultRosterMap();
  const counts: { mode: ModeKey; count: number }[] = [];
  let skipped = 0;
  let matchedAnyCategory = false;

  for (const mode of MODES) {
    const saved = source[mode.key];
    if (!Array.isArray(saved)) continue;
    matchedAnyCategory = true;
    const entries = saved.filter((entry) => {
      const ok = isRosterEntry(entry);
      if (!ok) skipped++;
      return ok;
    }) as RosterEntry[];
    roster[mode.key] = entries;
    counts.push({ mode: mode.key, count: entries.length });
  }
  // Categories this version no longer has (U-19/U-16) are counted as skipped
  // so the user is told something was left out rather than silently losing it.
  for (const key of Object.keys(source)) {
    if (!MODES.some((mode) => mode.key === key) && Array.isArray(source[key])) {
      skipped += (source[key] as unknown[]).length;
    }
  }
  if (!matchedAnyCategory) throw new Error('対戦国リストが見つかりませんでした');

  return { roster, counts, skipped };
}
