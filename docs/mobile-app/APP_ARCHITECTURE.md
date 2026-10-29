# Native App Architecture

## Core rule

Reuse existing product data contracts and pure business logic where safe. Rebuild the UI, routing, storage, animation and rendering for React Native. Do not import browser UI components, browser globals, Tailwind web classes, Framer Motion DOM components, service workers, or the browser cache manager into the native bundle.

## Recommended structure inside the `lpu-events-app/` project root

Adjust only after inspecting the actual repository and selected Expo template.

```text
lpu-events-app/
├── app/                         # Expo Router routes/layouts
│   ├── _layout.tsx
│   ├── index.tsx                # Homepage/discovery
│   ├── events/[eventId].tsx     # Event details
│   ├── about.tsx
│   ├── contact.tsx
│   ├── privacy.tsx
│   └── terms.tsx
├── src/
│   ├── api/                     # Typed public API client and parsing
│   ├── cache/                   # Asynchronous native cache/repository
│   ├── components/              # Native UI components
│   ├── features/                # Search, filters, carousel, details flows
│   ├── hooks/                   # Data/state hooks where useful
│   ├── theme/                   # Website-derived design tokens
│   ├── utils/                   # Safe shared pure transformations
│   └── types/                   # Native-specific boundary types if needed
├── assets/                      # Genuine logo, fonts (if licensed), and required assets
├── app.json
├── package.json
└── tsconfig.json
```

Do not create folders solely to fill this diagram. Keep initial architecture lean and align names with the selected Expo template.

## Layers

### 1. Native screens and components

Render with `View`, `Text`, `Pressable`, `ScrollView` where appropriate, `FlatList` for the main event feed, `TextInput`, Expo Router, and Expo-compatible image/animation packages. Make hit targets accessible. Use `SafeAreaView`/safe-area handling supported by the selected Expo SDK. Keep each component's responsibility narrow.

### 2. Feature/state layer

Own selected filters, search text, theme, visible pages, selected event, loading/error state and navigation state. Use pure selectors where possible. Do not scatter duplicate data-fetch logic across cards or screen components.

### 3. Data repository

Expose small methods such as:

- `getHomepage({ forceRefresh? })`
- `getEventPage(filters, pagination)`
- `getEventDetails(eventIdOrSlug)`
- `getCategories()` only if not included in the homepage/snapshot payload
- `searchEvents(query, filters)` using the current server/client strategy

These names are proposals. Preserve existing endpoint contracts, test against real response shapes, and avoid redundant service methods that wrap nothing.

### 4. Native cache

Use asynchronous storage such as AsyncStorage for appropriate small persisted data, with in-memory state/cache for current session. Treat the public-content manifest revision as a cache version when using immutable snapshots. Avoid repeated full-catalogue copies unless measuring shows a benefit. If storage size or query semantics later require a database, document the measured reason before adding one.

### 5. Backend

Use existing public Cloudflare-backed endpoints and public-content snapshots. Public student browsing must not depend on a new login or mobile-only backend. Do not call raw Supabase tables from UI components.

## State and cache approach

- Startup: render shell immediately; begin asynchronous cache read and network refresh in parallel.
- Cache hit: show cached content when valid, then revalidate in background and update visible state when newer data arrives.
- Cache miss: show useful skeletons while loading homepage data.
- Detail navigation: use an in-memory event summary immediately if available; fetch full detail only when needed.
- Search: reuse the existing weighted local search if the loaded dataset is sufficient; otherwise use the existing public search endpoint with debounce and stale-response protection.
- Filter changes: use server filtering where the existing website uses it; never refetch on every text input character if local data already suffices.
- Pagination: load/render incrementally; deduplicate by stable event ID.
- Network errors: preserve valid cached content and show a recoverable inline state rather than blanking the entire app.

## Navigation

Use native stack/file-based navigation and sensible Android back behaviour. Event details should be a real native route, not an HTML route loaded inside a WebView. Preserve the user's discovery position when navigating back where practical. Deep links/sharing should not be implemented by inventing a new website route contract; inspect current event URLs and decide how public links should behave in the app.

## Avoid premature abstractions

Do not introduce Redux, a large query framework, dependency injection frameworks, a local SQL database, or multiple duplicated repository/cache layers without a specific demonstrated need. Start with a typed, testable minimal architecture and add only what the feature requires.
