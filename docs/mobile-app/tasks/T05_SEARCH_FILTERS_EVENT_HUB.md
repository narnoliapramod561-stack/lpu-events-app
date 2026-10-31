# Task 05 — Search, Filters, and Event Hub

**Do only Task 05. Do not implement details screens or remaining informational pages. Stop after Event Hub verification.**

## Preconditions

Tasks 00–04 accepted. Read `src/components/CategoryFilter.tsx`, `src/components/EventGrid.tsx`, `src/shared/clientSearch.ts`, filter logic in `src/App.tsx`, API feed method, taxonomy and current server settings again.

## Goal

Reproduce the current Event Hub/search/filter experience using real data and performant native lists.

## Scope

Implement only those of these controls that the current website actually exposes:

- Search with current suggestions and weighted result behaviour.
- Category and subcategory search/filter.
- Schedule/date filtering.
- Free/paid filtering.
- Trending selection and its current reset/restore behaviour.
- Event cards with correct metadata/image/CTA presentation.
- Configured direct-ad insertion positions.
- Initial event count and Show More increment from server settings.
- Past-event discovery when exposed by the website.
- Loading, no-result, reset-filter, and feed-end behaviour.

## Steps

1. Extract actual source filter combinations, defaults, URL/search semantics, valid timeline values and ordering.
2. Use a native `TextInput`, accessible `Pressable` controls and scrollable chips/sheets matching the source UI. Do not invent bottom tabs or a new filter dashboard.
3. Use a virtualized `FlatList` for the main event feed. Avoid a second nested vertical feed inside the homepage scroll surface unless required by the source design.
4. Keep local query results instant where source data/search logic allows. Debounce server search and cancel/ignore obsolete requests.
5. Merge pagination by stable event ID and prevent duplicate concurrent load-more requests.
6. Use the server's `initial_event_limit`, `show_more_increment` and ad settings. Audit the repository fallback of 9 versus any expected 10 default; record the actual production setting and avoid changing the website.
7. Use the website's actual sorting/date/time logic. Preserve the user's list position when details are later opened.
8. Test combinations and clearing/resetting behavior against the source website.

## Acceptance criteria

- Search, suggestions, filters, trending, pagination and direct-ad insertion use real data/current rules.
- Scroll through 30+ items without obvious row blanking, unnecessary re-fetch, or severe interaction jank.
- No duplicates on Show More or fast repeated filter changes.
- No unrequested feature added.

Update trackers with actual test results and **stop before Task 06**.

## Implementation status (2026-10-31)

Implemented in the native app:

- `EventHub` uses the public `/api/public/events` and `/api/public/search`
  endpoints, 9-item pages, active filter query parameters, and stable-ID
  incremental loading.
- Timeline controls are All, Today, Tomorrow, This Week and By Date.
  Date matching is local-calendar and inclusive for multi-day events.
- Event type controls are All, Free, Paid and manually curated Trending.
  Trending resets timeline/category/subcategory and restores the previous
  selections when leaving it.
- Category and subcategory controls are sourced from the homepage taxonomy,
  support in-memory search, and clear an incompatible child on parent change.
- Search is event-name-only, starts at two characters, debounces 300 ms,
  ranks prefixes before contains matches, composes with active server filters,
  and ignores stale responses.

Automated checks passed: typecheck, Expo dependency check, Expo Doctor
(21/21), native API/cache checks, and Android export. Physical Android Event Hub
interaction has not been performed in this environment. Task 06 was not
started.

## Correction status (2026-10-31)

The native layout was corrected against the read-only mobile source:

- Shared branded header is retained.
- Schedule, Event Type, and Categories are one divided glass panel.
- Event Hub title follows the panel with the website-style separator accents.
- Cards use full-width 16:9 posters, orange titles, circular metadata rows,
  and the mobile inline filled-orange View Details action.

The correction passes typecheck, Expo checks, Expo Doctor, native API/cache
tests, and Android export. Physical Android same-viewport screenshot comparison
at 694 x 1536 remains required; no visual parity result is claimed until that
device check is performed.

## Final visual refinement (2026-10-31)

The targeted refinement replaced native Unicode symbols with local SVG
Lucide-equivalent vectors, matched the website's `DD/MM/YYYY` date ranges and
12-hour schedule formatting, preserved API-driven venue text with wrapping,
and translated the measured glass panel/card/chip opacity, borders, gradients,
and shadows without introducing a scrolling blur dependency.

Automated checks pass. Physical Android screenshot comparison remains pending;
no full visual parity claim is made without that device evidence.

## Final filter panel correction (2026-10-31)

The filter-only correction now renders website-matching inline horizontal
chips, the Today status dot, the Trending flame, per-category icons and real
subcategory count badges, plus navy selected All/category treatment. Schedule,
Event Type, and Categories section icons remain vector-based inside the
translucent rounded containers. The final dimension/glass pass adds responsive
panel inset and padding, softer translucent gradient layers, lighter borders
and shadows, visible capsule backgrounds for every option, orange Schedule and
Event Type All states, and compact circular category badges. Automated checks
and Android export pass; physical same-viewport comparison remains pending.
