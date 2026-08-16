---
name: opponent-scout-hub
description: Working rules for the Opponent Scout Hub repo — the JFA women's-football opponent scouting app (React app in app/, news+Wikipedia collector in collector/, GitHub Actions collect-and-deploy). Use this skill for ANY work in this repository, even small-looking ones: changing what news is collected, adding or removing countries or categories, editing any screen, chasing "wrong data is showing" or "nothing is showing" reports, or touching the workflow. It carries the data-integrity rule this project lives by, how to verify changes when the sandbox cannot reach Google News or Wikipedia, and the bug patterns that have already bitten this codebase more than once.
---

# Opponent Scout Hub

A scouting tool for a professional analyst working with the Japan women's
national teams. It collects real news about opponent countries three times a
day and publishes to GitHub Pages. Three parts:

| Path | Role |
|---|---|
| `collector/` | Plain-JS Node scripts. Fetch news (Google News RSS) + head coaches (Wikipedia), filter, write `app/src/data/collected/*.json`. |
| `app/` | React + TypeScript + Vite. Reads those JSON files; no data generation of its own. |
| `.github/workflows/collect-and-deploy.yml` | 3x/day: collect → commit JSON → build → deploy Pages. |

The work log `Opponent Scout Hub - 作業ログ.md` is the project's memory — read
chapter 3 for what was built and why, chapter 7 for what's next. Update it
when you finish something; the user reads it between sessions.

## The rule everything else follows

**Never show the analyst something that isn't sourced.** This app once shipped
invented coach careers, invented match records and invented "federation
technical director" quotes, all styled identically to real collected news. For
a scouting tool that is worse than an empty screen, because nothing on screen
said which half was real.

So, when data can't be obtained:

- Leave it empty and say so plainly on screen, with the reason.
- Never fill a gap with a plausible-looking placeholder, a hash-derived value,
  or a "sample" that isn't visibly labelled as one.
- When you remove a fabricated feature, remove the components too — a dormant
  `HonoursTable.tsx` invites someone to wire it back up.

The same rule drives the filtering: a country with no on-topic news gets an
empty column, never another country's or another sport's news.

## The sandbox cannot reach the sources

`news.google.com`, `en.wikipedia.org` and most federation sites are blocked by
the network policy here. Do not conclude a feature is broken from that, and do
not try to work around it — GitHub Actions has open network and is where the
collector really runs.

Verify anyway, in this order — it has caught real bugs every time:

1. **Replay the committed data.** `app/src/data/collected/*.json` holds real
   headlines from live runs. Write a throwaway script in the scratchpad that
   runs your new filter over them and prints keep/drop per item. Read the
   drops, not just the counts: over-filtering is the failure you can't see in
   a total.
2. **Use git history as a second corpus.** `git show <sha>:app/src/data/collected/u19.json`
   recovers data from before a change — that is how the U-19 cricket regression
   was proven fixed after the category was deleted.
3. **Unit-test the parsing and filtering** (`collector/npm test`, no network).
   Real headlines from the live data make the best fixtures.
4. **Run the app in a browser** for UI work: `npm run build && npx vite preview
   --port 4173`, drive it with Playwright (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`),
   and check both the success and the failure path.
5. **After merge, read the run log.** It prints per category: on-topic items,
   how many came from federation sites, and how many coaches were identified.
   Those three numbers are the real verdict.

## Two lists that must stay in step

Most "nothing is showing" reports trace back to these drifting apart:

- **Categories**: `app/src/types.ts` `ModeKey` ↔ `collector/lib/topic.mjs`
  `CATEGORY_TOPICS` ↔ `collector/lib/roster.mjs` `CATEGORY_COUNTRIES`, plus
  `app/src/data/modes.ts`, `defaultRoster.ts`, `asia20.ts`. Edit `ModeKey`
  first and let TypeScript point at the rest.
- **Countries**: `app/src/data/pool.ts` (what the app can offer) ↔
  `collector/lib/roster.mjs` `COUNTRIES` (what gets collected). If the add
  dialog can offer a country, the collector must cover it, or that country is
  permanently empty and no button can fix it.

The collector is deliberately plain JavaScript and does not import from
`app/` — a scheduled job stays more reliable without a TS toolchain. The price
is hand-syncing; pay it deliberately.

## Common tasks

- **Change what news is collected** → `collector/lib/topic.mjs` (queries and
  filters) and `collector/lib/roster.mjs` (countries, search names, aliases).
- **Change trust tiers or federation sites** → `collector/lib/officialDomains.mjs`.
- **Coach data** → `collector/lib/wikipedia.mjs`.
- **Screens** → `app/src/components/screens/…`; collected data reaches them
  through `app/src/state/CollectedContext.tsx` hooks, never by importing JSON.
- **Anything user-visible** → also update `app/README.md`, which is written
  for the analyst, in Japanese, not for developers.

## Before you commit

- `cd collector && npm test`
- `cd app && npx tsc --noEmit && npm run build`
- Replayed the change over real collected data, and read the dropped items.
- Work log updated: what changed, why, and what to check after the next run.

## Shipping

Develop on the branch you were given, push, and open a PR — the user merges.
A merged PR cannot take further commits: if yours is already merged, restart
the branch from `origin/main` and open a **new** PR. The workflow does not run
on pull requests, so no checks will appear; say so rather than letting the
absence look like a failure. Merging triggers a collect+deploy of roughly a
quarter of an hour.

## Bugs this codebase has already had

Read `references/bug-patterns.md` before debugging a data-quality report, and
add to it when you find a new one. Every entry there was found by looking at
real collected output, not by reasoning about the code — that is the habit
worth copying.
