# Task 03 — Native Public API Client and Cache

**Do only Task 03. Do not build the complete homepage or event screen UI. Stop after data-layer verification.**

## Preconditions

Tasks 00–02 accepted. Read `API_DATA_CONTRACTS.md`, `APP_ARCHITECTURE.md`, `PERFORMANCE_REQUIREMENTS.md`, and the current shared client/type files. Confirm current API availability before writing assumptions into code.

## Goal

Build the smallest typed native repository that reads real public LPU Events data and caches it without importing browser-only dependencies.

## Steps

1. Inspect and verify `src/shared/client.ts`, `src/shared/types.ts`, `src/shared/snapshot.ts`, `src/shared/snapshotClient.ts`, live/development route implementations if available, and current public payloads.
2. Implement an explicit absolute base URL and an HTTP helper using `fetch` compatible with React Native.
3. Add status/content-type/JSON shape checks, timeouts or cancellation, retry policy appropriate for public GETs, and user-safe error values.
4. Implement request deduplication and stale-response handling. Ensure repeated same-key fetches share one in-flight request.
5. Use asynchronous native persistent storage for a bounded subset of public homepage data and details. Do not synchronously enumerate cache during startup. Version cached shapes and honour snapshot revisions if using snapshots.
6. First implement the homepage bundle path as defined in the actual current repository. Add feed/search/detail adapters using real observed query parameters/responses. Do not add a new endpoint.
7. Decide from evidence whether to use API or snapshot data first. Do not hardwire snapshot-only mode without verifying current manifest/schema/availability and fallback.
8. Reuse pure search/date/types helpers only after confirming they have no browser/global dependencies. Do not import `persistentCache.ts`, browser Supabase proxy, web telemetry, or service-worker registration wholesale.
9. Add tests for response parsing, timeout/error, cache hit/revalidation, in-flight deduplication, query serialization, and stale query responses where practical.
10. Use real endpoint responses or transparent sanitized fixtures derived from real structures. Do not invent successful live payloads.

## Acceptance criteria

- Homepage bundle data can be fetched using the public API in the native environment.
- Event page and event-details requests follow current route contracts.
- Warm data is available from asynchronous cache; refresh failures do not blank valid content.
- No raw database access or secret credentials are used.
- No app UI feature beyond the minimum API test harness is implemented.

Document which endpoints were actually tested and network availability. Update trackers and **stop before Task 04**.
