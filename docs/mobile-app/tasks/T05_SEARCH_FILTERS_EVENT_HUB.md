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
