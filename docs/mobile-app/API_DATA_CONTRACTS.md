# Existing Public API and Data Contracts

## Endpoints observed in the website client

The browser client `src/shared/client.ts` uses `_fetchPublic()` and builds requests to the student site's public API. When running on the production student domain it uses relative paths; elsewhere it defaults to `https://lpuevents.live`.

Native requests must use a valid absolute base URL unless the app's API adapter has another explicit configured origin.

### Task 06 detail fields verified

The native detail screen uses the existing validated `EventDetails` contract:
`id`, `name`, `description`, `start_at`, `end_at`, `venue_name`,
`registration_mode`, `pricing_type`, `price_amount`, `external_registration_url`,
`banner_media_id`, `media_assets`, `organizations`, `categories`,
`subcategories`, `status`, and sorted `event_content_sections`. Detail loading
uses `PublicApiClient.getEventDetails(identifier)` rather than direct UI
fetching, so cache key `detail:<identifier>`, stale refresh, retry, and
request deduplication remain shared with Task 03.

| Purpose | Observed route pattern | Notes |
|---|---|---|
| Homepage bundle | `GET https://lpuevents.live/api/public/homepage` | Aggregated categories, carousel, featured, trending, ads, settings and event feed |
| Filtered events | `GET https://lpuevents.live/api/public/events?...` | Query parameters are built by `fetchEventFeed()` |
| Search | `GET https://lpuevents.live/api/public/search?q=...` | Native search sends `event_name_only=true` and active event-feed filters |
| Event details | `GET https://lpuevents.live/api/public/events/{uuid}` | The detail method supports UUID extraction and slug lookup logic; verify exact fallback path behaviour |
| Version/health metadata | `GET https://lpuevents.live/api/public/version` | Optional, if relevant to current architecture |
| Public content manifest | `GET https://images.lpuevents.live/public-content/manifest.json` | Snapshot client default; verify current manifest availability and schema |

These patterns come from the referenced repository source and must be checked against current route handlers/deployment. Do not assume all status codes or error bodies from this summary.

## Homepage response

`HomepageBundleData` / `HomepageSnapshotPayload` expose fields:

- `categories: CategoryFeedItem[]`
- `carousel: CarouselItemFeedItem[]`
- `featured: any[]` (existing contract currently uses loose nested/flat shapes; inspect actual examples and normalize explicitly)
- `trending: EventFeedItem[]`
- `settings: { key: string; value: any }[]`
- `events: EventFeedItem[]`

Do not replace the existing response with mocked data or invent a server response format. Validate JSON at the boundary and handle malformed/incomplete payloads.

## Event feeds

Observed `fetchEventFeed()` options:

- `category_id`
- `subcategory_id`
- `pricing_type`
- `timeline`
- `date`
- `limit`
- `offset`
- `show_past`
- `force_fresh` (client behaviour; do not assume it is sent as a query parameter)

The native Event Hub uses 9-item pages and the server `offset`. It sends
`timeline=today|tomorrow|this_week`, or `date=YYYY-MM-DD` for By Date. The
UI never sends `category_id=all`.

The inspected method clamps `limit` to 1–50 and `offset` to a nonnegative number. It serializes the filters supported in the method into URL query parameters. Inspect current backend handler for accepted values and defaults.

The UI uses or has used timelines including `today`, `tomorrow`, `this_week`, and `upcoming`, plus a date value in `YYYY-MM-DD` form. Verify current valid values and timezone logic in `src/shared/date.ts` and the route implementation before porting.

## Search

The native Event Hub starts search at two characters, debounces by 300 ms, and
uses the existing public search endpoint with `event_name_only=true`. Results
rank event-name prefixes before event-name contains matches; organizer, venue,
description and taxonomy fields are not searched.

The API client's `searchEvents()` supports query, limit, offset,
category/subcategory, pricing, timeline/date and event-name-only filtering.
Out-of-order responses are ignored using a request generation.

## Event details and registration

- The website resolves an ID/slug, attempts detail retrieval, and may use existing event summaries for instant UI.
- Event records have status/date/venue/category/organizer metadata and registration fields, including `registration_mode` and `external_registration_url` in the shared types.
- The public student product uses an organizer-provided external destination; the app must not implement internal payment or ticketing.
- When an external URL exists, preserve the site's booking disclaimer flow if the current implementation requires it, then use native `Linking.openURL` after validating the URL scheme and catching failures.
- Track existing event views/clicks only if the current approved analytics integration is intentionally supported; do not invent a mobile analytics project or expose secrets.

## Snapshot system

Observed contracts in `src/shared/snapshot.ts`:

- `SnapshotManifest`: `schema_version`, `revision`, `published_at`, `resources`, `meta`.
- Resource pointers for homepage, catalogue, categories and event-details directory, with optional archive catalogue.
- Immutable revision resources for homepage, event catalogue, categories, details and optionally archive catalogue.
- Compact public catalogue records have published event metadata and explicitly restrict registration modes to `NONE` or `EXTERNAL` in the declared compact type.

Observed snapshot client responsibilities in `src/shared/snapshotClient.ts`:

- Manifest cache/revalidation.
- Immutable payload fetch/cache and single-flight request deduplication.
- Homepage/categories/catalogue/detail snapshot fetches.
- Local catalogue search/filtering helpers.
- Fallback to existing `/api/public/*` endpoints in higher-level code.

Important: the existing snapshot client uses `persistentCache`, which is browser-oriented. Port its contracts and logic selectively; do not import the browser cache wholesale. Confirm production data schema/version and current manifest generation before making snapshots the only source of truth.

## Native HTTP implementation requirements

- Base URL must be explicit and environment-safe; never rely on `window.location`.
- Use JSON `Accept` headers and validate response content type/status where meaningful.
- Add timeout/cancellation so a dead connection cannot spin the launch screen indefinitely.
- Deduplicate identical in-flight requests.
- Keep stale data visible on nonfatal refresh failure.
- Discard out-of-order search responses if a newer query has already been submitted.
- Validate/canonicalize external URLs. Permit only the schemes required by current links; reject `javascript:`, unknown schemes and protocol-relative destinations.
- Do not cache errors as valid event payloads. Respect server/cache semantics and the manifest revision.
- Never embed admin credentials, service-role keys, private keys, or server secrets in Expo configuration or JS.

## Native Task 03 implementation

The native client in `src/api/publicApi.ts` uses the absolute origins
`https://lpuevents.live/api/public` and
`https://images.lpuevents.live/public-content`. It exposes typed homepage,
event-feed, search, detail, manifest, catalogue, and snapshot-detail methods.
Observed production payloads are validated before they are returned or cached.

`src/cache/nativeCache.ts` combines a process-local `Map` with versioned,
asynchronous AsyncStorage records. Cache keys are `homepage`,
`events:<query>`, `search:<query>`, `detail:<identifier>`,
`snapshot:manifest`, and revision-qualified snapshot payload keys. TTLs are
30 minutes for homepage, 1 minute for feeds/search, 2 minutes for details,
1 minute for the manifest, and 24 hours for immutable snapshots. Stale values
remain available for one additional TTL while single-flight revalidation runs.
Persistent reads are individual asynchronous key reads; startup never scans
storage. Storage failures leave the memory tier usable.

Snapshot URLs are built from the manifest resource pointers and revision.
Invalid or unavailable snapshots fall back to the existing public API, so
snapshots are an optimization rather than a mandatory dependency. HTTP errors,
maintenance responses, malformed JSON/shapes, network failures, and timeouts
are represented as typed user-safe errors.
