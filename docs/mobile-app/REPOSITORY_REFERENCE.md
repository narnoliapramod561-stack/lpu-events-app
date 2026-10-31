# Student Repository Reference and Verified Starting Facts

**Reference checkout inspected for this handbook:** `narnoliapramod561-stack/lpu-events-student`, default branch `main`, through GitHub repository/file access on 2026-10-29. Antigravity must compare these notes against the actual local checkout and branch before implementation.

## Important source files

| Area | Reference file | What to inspect/reuse |
|---|---|---|
| App orchestration | `src/App.tsx` | Initial bundle, states, filters, navigation, page rendering, server settings |
| Theme and visual tokens | `src/index.css` | Light/dark colors, type stacks, spacing/radii, glass treatments and responsive styles |
| Web entry/telemetry | `src/main.tsx` | Browser-only telemetry and service-worker initialization; do not import blindly into native |
| Navbar/search | `src/components/Navbar.tsx` | Search, suggestions, menu, theme control, logo placement |
| Logo | `src/components/LpuLogo.tsx`, `src/components/LpuEventsLogo.tsx` | Actual branding and component artwork |
| Launch shell | `index.html`, `src/components/SplashScreen.tsx` | Inline startup animation and its timing/handoff; inspect SVG/CSS/JS in context |
| Hero | `src/components/HeroCarousel.tsx` | Event/media slide models, durations, order, controls, and event selection |
| Happening Today | `src/components/HappeningTodaySlider.tsx` | Event cards, config-driven motion, and View All behaviour |
| Filters | `src/components/CategoryFilter.tsx` | Category/search/date/schedule/free-paid/trending interactions |
| Events | `src/components/EventGrid.tsx` | Event card display, image handling, and empty/loading state |
| Details | `src/components/EventDetailsView.tsx` | Detail fields, content sections/tabs, external booking, share, and related events |
| Footer/static pages | `src/components/Footer.tsx` and relevant `*View.tsx` files | Existing page destinations and copy |
| Category taxonomy | `src/utils/categories.ts` | Canonical category/subcategory data |
| Image URL logic | `src/utils/images.ts`, `src/shared/images/*` | Source selection, variants/fallbacks and media URL resolution |
| Shared types | `src/shared/types.ts` | Event, category, carousel, and settings contracts |
| Public API client | `src/shared/client.ts` | Public endpoints, response contracts, filters, fallback behavior |
| Snapshot client | `src/shared/snapshotClient.ts`, `src/shared/snapshot.ts` | Manifest/revision/public-content cache and catalogue/detail contracts |
| Search logic | `src/shared/clientSearch.ts` | Pure event search/scoring; assess if safe to reuse in native |
| Browser cache | `src/shared/persistentCache.ts` | Existing browser storage semantics; **not portable as-is** |
| Performance notes | `docs/performance/PHASE-0-*.md` | Existing documented startup/image/cache investigations; verify against current code |

## Existing web-stack observations

The referenced `package.json` contains React 18, Vite, Tailwind CSS, `@supabase/supabase-js`, Framer Motion, Lucide React, browser Sentry/PostHog, and `qrcode`. The website's `tsconfig.json` contains DOM types and web-style aliases. None of these facts implies those UI libraries can be used directly in React Native.

`src/main.tsx` includes browser-specific telemetry initialization and service-worker registration. `src/shared/persistentCache.ts` uses `window.localStorage`; `src/shared/client.ts` references browser globals and web fetch assumptions. These must not be imported blindly into the native app. No direct advertising feed or native ad SDK is part of the mobile implementation.

## Homepage bundle

`LpuEventsClient.fetchHomepageBundle()` reads the public `homepage` endpoint through `_fetchPublic()`. Its declared `HomepageBundleData` contains:

- `categories`
- `carousel`
- `featured`
- `trending`
- `advertisements`
- `settings`
- `events`

The current code registers media assets for bundled events and has a persistent-cache fallback in the browser client. The legacy direct-advertising feed has been retired; the clean homepage contract contains events/media carousel data and public settings only. Native code needs its own compatible storage.

## Event feeds and detail methods

The referenced client exposes:

- `fetchEventFeed()` with `category_id`, `subcategory_id`, `pricing_type`, `timeline`, `date`, `limit`, `offset`, `show_past`, and `force_fresh` options.
- `searchEvents()` with a query and options including limits, category/subcategory, and pricing filters.
- `fetchEventDetails(idOrSlug)` for details.
- Additional homepage module calls for categories, carousel, featured events, trending, and settings.

Inspect the complete method implementations and actual deployed route handlers before relying on options or edge-case semantics.

## Snapshot contracts

`src/shared/snapshot.ts` defines:

- `SnapshotManifest` with schema version, revision, publication time, resource pointers, and metadata.
- `HomepageSnapshotPayload` matching the homepage bundle shape.
- `CompactCatalogueEvent` for published-event discovery.
- `EventsCatalogueSnapshotPayload`, `CategoriesSnapshotPayload`, and `EventDetailSnapshotPayload`.
- `SNAPSHOT_PATHS` including manifest, revision homepage, catalogue, categories, event detail, and archive catalogue paths.

`src/shared/snapshotClient.ts` implements manifest caching, immutable payload caching, single-flight requests, homepage snapshots, categories, catalogue search, and detail snapshots. It references browser persistent cache and must be adapted or selectively rewritten for native use.

## Website settings that should stay configurable

`src/App.tsx` reads settings such as `initial_event_limit`, `show_more_increment`, `ad_placement_interval`, `happening_today_config`, `ad_system_config`, `platform_maintenance_mode`, and `site_notice_banner`. Current fallback values visible in the inspected file include 9 for the initial event limit, 5 for the Show More increment, and 6 for the ad interval. Treat server-provided configuration as authoritative. Compare those fallback values with the current product requirements and live website before deciding native defaults; never silently overwrite website behaviour.

## Known performance investigations in the repo

The repository includes `docs/performance/PHASE-0-BASELINE.md`, `PHASE-0-SCORECARD.md`, `PHASE-0-STARTUP.md`, `PHASE-0-IMAGES.md`, and `PHASE-0-CLIENT-CACHE.md`. These notes report investigations such as the startup shell's minimum visual time/handoff delay, synchronous browser-cache operations, duplicate cache tiers, and missing responsive image variants causing fallback requests. They are useful evidence, not blanket permission to change website code. The native app must avoid reproducing those problems; verify whether each issue still exists in the current checkout.

## Official-source hyperlinks

- Student repository: https://github.com/narnoliapramod561-stack/lpu-events-student
- App source: https://github.com/narnoliapramod561-stack/lpu-events-student/blob/main/src/App.tsx
- API client: https://github.com/narnoliapramod561-stack/lpu-events-student/blob/main/src/shared/client.ts
- Snapshot client: https://github.com/narnoliapramod561-stack/lpu-events-student/blob/main/src/shared/snapshotClient.ts
- Theme CSS: https://github.com/narnoliapramod561-stack/lpu-events-student/blob/main/src/index.css

## Accuracy rule

If branch/code has changed since this reference was inspected, update the documentation with the new facts, cite exact local paths/method names, and mark outdated observations as superseded. Do not claim this handbook has already verified the user's local checkout.
