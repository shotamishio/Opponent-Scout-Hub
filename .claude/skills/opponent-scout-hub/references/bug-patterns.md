# Bugs this codebase has actually had

Every one of these was found by reading real collected output — never by
reading the code and reasoning about it. Several were shipped and reported by
the user, which is the expensive way to find them. When you add an entry, keep
the same shape: what was seen, why it happened, what fixed it, and what it
tells you about the next bug.

## Table of contents

1. [Wrong data that looks right](#1-wrong-data-that-looks-right)
2. [Search: the query is not the filter](#2-search-the-query-is-not-the-filter)
3. [Parsing external formats](#3-parsing-external-formats)
4. [Reach: the data was never collected](#4-reach-the-data-was-never-collected)
5. [State and the browser](#5-state-and-the-browser)
6. [Build vs dev](#6-build-vs-dev)

---

## 1. Wrong data that looks right

**Every category showed identical news.** Queries were built from the country
name only, with no notion of the age category, so なでしこ and U-17 held
byte-identical item lists for all 12 shared countries. Nothing on screen could
reveal it — you had to compare two categories' data.
→ Build queries per (country, category), and gate items by age group both ways:
youth markers stay off the senior screen, and each youth screen takes only its
own age.
**Lesson:** compare across categories/countries as a matter of routine. A
screen that looks plausible in isolation can still be the wrong screen's data.

**Right country, right age, right gender — wrong sport.** U-19 was almost
entirely women's cricket; U-17 Korea was volleyball; senior Canada was
baseball; U-20 Australia was basketball. All genuinely national women's teams
of that age group.
→ Name the sport in the query, and reject other sports by **name and jargon**.
Cricket reports never say "cricket": "outclass China by 7 wickets in final
T20I" is the whole headline.
**Lesson:** when a filter checks N attributes, ask what an item can match on
all N and still be wrong.

**Fabricated data styled like real data.** Coach name picked by hashing the
country code, with invented career, record, win rate and quotes.
→ Deleted, replaced with Wikipedia lookups plus links out. See the data
integrity rule in SKILL.md.

**A trust rule that trusted too much.** "Anything on the country's own
federation domain is on-topic" let RFEF's *men's* Nations League fixture onto
the senior screen. Measured against real data, the exemption had rescued
exactly zero items.
→ Narrow it to what the domain actually proves: the country, not the gender.
Federations publish men's and women's football on one site.
**Lesson:** before adding an exemption, measure what it would rescue. Before
keeping one, measure what it did rescue.

## 2. Search: the query is not the filter

**FIFA's names are not media's names.** Searching `"Korea DPR"` or `"China PR"`
matches almost nothing, and Google News silently degrades a no-hit phrase query
into loose keyword matching — returning near-random articles rather than
nothing. Hence `search` (media name) separate from `en` (FIFA name) in
`roster.mjs`.

**`when:` is not honoured reliably.** A `when:120d` query returned 2013, 2014
and 2018 headlines.
→ Enforce recency in code against `publishedAt`. Also reject headlines naming
their own year two or more years back ("2019 ESPYS") — republished archive
pages carry a fresh feed date.

**Official sources lose to wire services.** The general query produced **0 T1
items out of 67**. Federation announcements simply don't rank.
→ Query the federation site explicitly (`site:<domain>`) as a second pass, and
merge. Federations publish in their own language, so ask for the women's term
in several (`women`/`femenina`/`feminina`/`féminine`/`Frauen`/`kvinnor`/`nữ`).

**Language changes the label.** Spanish and Portuguese federations write
`sub-17`, not `U-17`. Age matching that only knew English would have let their
youth releases onto the senior screen — the same leak, reopened by a new
source. Caught by a test written while adding federation search.
**Lesson:** when you add a source in a new language, re-check every pattern
that reads a headline, not just the query.

## 3. Parsing external formats

**Wikipedia infobox capture ran into the next field.** North Korea's U-17 coach
came out as `Captain             =`. Infoboxes are usually one field per line —
but not always, and an empty coach field on an inline infobox means the capture
swallows the next field's name.
→ Cut the value at the first `|` that is *not* inside `[[…]]` or `{{…}}` (piped
links legitimately contain one), and reject any value still holding an `=`.
**Lesson:** for hand-edited formats, assume every layout variant exists
somewhere. Sanity-check the *shape* of what you extracted, not just that the
regex matched.

**Junk that isn't news.** Satire sites, ticket resellers and odds aggregators
all produce article-shaped results.
→ Block by domain; keyword filters won't catch them.

## 4. Reach: the data was never collected

**A country the app offers but the collector never heard of.** Italy was added
to U-20 and stayed permanently empty. The collector's list was the *default
rosters*; the add dialog offers the whole 42-country pool. No amount of
pressing 再収集 could help — that button re-reads collected data, it doesn't
collect.
→ Collect the whole pool: if the dialog can offer it, the collector covers it.
**Lesson:** when the user says "the button doesn't work", check whether the
button is even the thing that produces the data.

## 5. State and the browser

**The watch list reset on reload** because it lived only in React state — and a
deploy causes a reload. Now in `localStorage`, validated entry by entry on
load so a country code or category from an older version is dropped instead of
breaking the screens. Files (`RosterTransfer.tsx`) carry it between machines,
since a static site has no server to sync through.

**A confirmation message that unmounted itself.** Import set `manage: false`,
which unmounted the panel the message lived in — the user saw nothing and
couldn't tell if it worked.
**Lesson:** when an action reports its own result, check the reporter survives
the action.

**Chromium ignored `link.download`** for a detached anchor with a non-ASCII
filename; the file saved as `download` with no extension.
→ Append the anchor to the document before clicking, and keep the filename
ASCII.

**Runtime-fetched data reaching an `href`.** Once data is fetched at runtime
rather than bundled, a `javascript:` URL in a title or profile link would
execute on click. `safeHref` permits only `http(s)`, on bundled data too.

## 6. Build vs dev

**Flags vanished only in the production build.** Small SVGs get inlined as data
URIs, and the `(` `)` inside them collided with CSS `url(...)`. Invisible in
`npm run dev`.
→ `url("${src}")`. **Lesson:** for asset and path problems, test the built
output served from a subdirectory, not the dev server.
