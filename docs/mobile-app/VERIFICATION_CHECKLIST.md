# LPU Events Mobile — Verification Checklist

Legend: `[ ]` not checked · `[x]` verified · `[!]` failed/blocked · `[N/A]` genuinely not applicable (explain)

## Environment

- [x] Actual target repository/branch recorded (`lpu-events-student`, branch `main`, commit `e67c4ee`)
- [!] Existing website changes preserved (student website had pre-existing changes; no website files were modified by this task)
- [x] Expo SDK decision checked against current official docs (SDK 57 selected because SDK 58 store Expo Go support is transitional)
- [ ] Android phone model, OS, and installed Expo Go version recorded (not available in this session)
- [ ] App runs by scanning QR in matching Android Expo Go (requires user)
- [x] No Android Studio/SDK/emulator required (Confirmed constraint for development workflow)

## Website isolation

- [!] Website root package/lockfile unchanged unless explicitly approved (website has pre-existing source changes; no task-caused edits)
- [!] Website `src/`, `public/`, and deployment config unchanged (pre-existing student source changes were observed; no task-caused edits)
- [x] Sibling admin/platform/backend folders unchanged
- [x] Existing student website build verified when applicable (read-only audit, source untouched)

## Startup and logo

- [x] Logo artwork matches source (Inspected `LpuEventsLogo.tsx` SVG radial gradients and paths)
- [x] Full logo animation is implemented with native SVG/Animated primitives; physical completion check pending
- [x] Animation starts immediately from the route without network or artificial delay
- [x] Cache read/network run without holding the splash (Task 03 data layer is asynchronous)
- [x] Warm content appears without artificial full-screen delay (Task 04 shell/data load runs concurrently with splash)
- [x] Timeout/network errors and stale-data fallback are handled (Task 03)

## Visual parity

- [x] Light theme tokens extracted and implemented (physical screenshot comparison pending)
- [x] Dark theme tokens extracted and implemented (future screens will consume the same token module)
- [x] Header/search entry point (Task 04 correction: cyan/blue gradient, logo, search, theme, menu)
- [x] Hero carousel mapping (Task 04 correction: production carousel + deterministic Guest Lecture artwork)
- [x] Happening Today (Task 04 correction: real homepage events, horizontal cards, metadata)
- [x] No native advertising feed, renderer, or AdMob SDK; browser AdSense remains web-only
- [x] Category/subcategory and other filters (Task 05 implementation; physical interaction pending)
- [x] Event cards (Task 05 implementation; physical interaction pending)
- [x] Event details route, poster, metadata, description, sections, and conditional external CTA (Task 06 implementation; physical comparison pending)
- [x] Informational pages/footer (Task 07 native routes and shared shell implemented; physical comparison pending)
- [x] Loading/empty/error/maintenance states (homepage/Event Hub/detail recoverable states implemented; physical interruption testing pending)
- [x] Poster sizes/fit match reference (Verified CSS: Hero `aspect-[3/2]`, Cards `aspect-[16/9]`, Details `aspect-[16/10]`)

## Behaviour

- [x] Search minimum length, debounce, event-name-only ranking and active-filter composition (Task 05 implementation)
- [x] Category/subcategory filters and incompatible-child reset (Task 05 implementation)
- [x] Date/schedule filters with local timezone boundaries (Task 05 implementation)
- [x] Free/paid and manual trending restore behavior (Task 05 implementation)
- [x] Show More pagination and stable-ID deduplication (Task 05 implementation)
- [ ] Past events where supported (Task 05)
- [ ] Carousel autoplay/manual navigation interaction (requires physical Android run)
- [x] External destinations are validated and opened safely; no native ad click targets exist
- [x] Event details fetch and content sections (Task 06 implementation)
- [x] Back navigation/position restoration through Expo Router stack (automated/source verified; physical hardware-back pending)
- [x] External booking flow only, URL validated and opened with `Linking` (source verified; physical browser handoff pending)
- [x] Theme persistence is hydration-safe (AsyncStorage-backed; physical restart verification pending)
- [x] About/Contact/Privacy/Terms navigation (Expo Router routes, drawer, footer; physical hardware-back pending)

## Performance

- [ ] Repeated scrolling does not blank/reload existing rows unnecessarily (Task 08)
- [x] Image URLs resolve from production media object keys; native uses one `contain` image per poster (live data path; phone image-load check pending)
- [ ] Disk/memory image cache verified (Task 04)
- [x] No synchronous persistent-cache scan at startup (Task 03)
- [x] No redundant requests on search/filter input (300 ms debounce and request generation guard implemented)
- [ ] Cold/warm startup tested (Task 08)
- [ ] Slow/offline network tested (Task 08)
- [ ] Repeated detail navigation tested (Task 08)
- [ ] Measured results recorded; no fabricated metrics (Task 08)

### Task 08 audit evidence

- [x] Root navigation surfaces and status-bar style now follow the active theme.
- [x] Header search foreground, surface, and outline now follow the active theme.
- [x] Theme persistence no longer writes the default value before asynchronous hydration.
- [x] API/cache architecture preserved after inspection; no duplicate request path or cache rewrite introduced.
- [!] Physical frame, memory, cold/warm, image-cache, and scroll measurements unavailable because no Android profiler/device results were provided.
- [!] Homepage/Event Hub vertical list virtualization remains a known limitation: the inner list is intentionally non-scrolling inside the single homepage scroll surface.

## Final checks

- [x] TypeScript check passed (`npm run typecheck`)
- [x] Expo health/compatibility check passed (`npx expo-doctor`, 21/21)
- [x] Android Expo Go match URL resolved (`npx expo-go url android 57` -> Expo Go `57.0.9` APK)
- [x] Metro tunnel started (`npx expo start --tunnel --go --clear` -> `Tunnel connected`, `Tunnel ready`)
- [x] Android physical launch and Task 02 visuals confirmed by user
- [x] App-only diff reviewed; student and admin websites were not modified
- [x] Remaining physical-phone checks clearly listed

## Task 07 automated evidence

- [x] `npm run typecheck`
- [x] `npx expo install --check`
- [x] `npx expo-doctor` (21/21)
- [x] `npm run test:native-api`
- [x] `npx expo export --platform android`
- [ ] Physical Android route, drawer, footer, theme restart, mailto, and hardware-back checks

## Task 07 route inventory

- [x] `/`, `/events/:id`, `/about`, `/contact`, `/privacy`, and `/terms` audited against the read-only student source
- [x] Header destinations audited: Events, Event Categories, About Us, Contact Us, Privacy Policy, Terms of Service
- [x] Footer destinations audited: About Us, Categories, Contact Us, Privacy Policy, Terms of Service, contact mail
- [x] Search/category surfaces confirmed to remain in Event Hub; no duplicate native search or category route
- [N/A] Website-only AdSense/cookie banner, SEO metadata, service worker, hover states, and browser QR/download modal are not native Android surfaces

## Task 02 physical-device checks

- [x] User confirmed the logo appears correctly on a physical Android phone.
- [x] User confirmed circle assembly, sheen, proportional final state, and immediate handoff.
- [x] User confirmation recorded on 2026-10-31; device details were not supplied.

## Task 03 data-layer checks

- [x] Real production homepage, event feed, event details, search, manifest, and homepage snapshot responses inspected.
- [x] Native API response validation, timeout, HTTP/maintenance, and network error handling implemented.
- [x] AsyncStorage + Map cache, TTLs, stale fallback, revision keys, and single-flight deduplication implemented.
- [x] Snapshot resource pointers and revision are used; invalid/unavailable snapshots fall back to API.

## Task 04 automated verification

- [x] `npm run typecheck`
- [x] `npx expo install --check`
- [x] `npx expo-doctor` (21/21)
- [x] `npx expo export --platform android`
- [x] `npm run test:native-api` (homepage, snapshot, cache, timeout, malformed response, and fallback checks)
- [ ] Homepage cached rendering, empty-data, stale/offline, carousel gesture, ad placement, and scroll tests require a native test runner/physical Android pass; no results are claimed here.
- [x] User physically tested the corrected Task 04 homepage on Android and confirmed that its UI matches the reference; this agent did not perform a separate screenshot capture.

## Task 04 correction evidence

- [x] Live production homepage payload inspected: configured carousel contains Guest Lecture and other event slides; the first Guest Lecture event has no media asset and uses the website's `academics_guest-lecture.webp` fallback.
- [x] Reference background inspected: `lpu-events-student/public/lpu-events-campus-glass-background.webp`, 1600x900.
- [x] Genuine website default assets copied into the app; no student/admin files were modified.
- [x] Native hero no longer falls back to the first event feed item when the configured carousel is empty.
- [x] Native bundle includes the corrected hero/background assets.
- [x] User physically tested the corrected homepage on Android and confirmed its UI matches the reference on 2026-10-31; device details were not supplied.

## Task 05 automated evidence

- [x] `npm run typecheck`
- [x] `npx expo install --check`
- [x] `npx expo-doctor` (21/21)
- [x] `npm run test:native-api`
- [x] `npx expo export --platform android`
- [ ] Physical Android checks for scrolling, filter controls, search timing, loading states, and theme switching remain pending.

## Task 06 automated evidence

- [x] Event Hub View Details pushes the selected event ID through Expo Router.
- [x] Detail API uses `GET /api/public/events/{event-id}` through the shared
  `PublicApiClient` and cache.
- [x] Poster uses the shared remote-media and deterministic default-image
  resolver with `contain` rendering and image-error fallback.
- [x] Full description and organizer-defined content sections render without
  injecting HTML.
- [x] Date range and 12-hour time formatting match the existing native helper
  and inspected website behavior.
- [x] Optional category, subcategory, organizer, venue, description, and
  external URL fields omit empty labels.
- [x] Booking CTA appears only for valid HTTP(S) organizer URLs and uses
  native `Linking`; no internal booking/payment flow exists.
- [x] Loading skeleton, cached refresh, not-found/error, retry, cancelled,
  light/dark, visible back, and router fallback states are implemented.
- [x] `npm run typecheck`
- [x] `npx expo install --check`
- [x] `npx expo-doctor` (21/21)
- [x] `npm run test:native-api`
- [x] `npx expo export --platform android`
- [ ] Physical Android hardware-back, browser handoff, scroll, and same-viewport
  screenshot comparison remain pending; do not claim visual parity yet.

## Task 06 light-mode correction evidence

- [x] Root theme provider owns the selected theme instead of the device
  `useColorScheme()` value.
- [x] Light Mode defaults to the bright token palette and remains active when
  navigating from Event Hub to Event Details.
- [x] Light detail background overlay, title, organizer, glass panels,
  metadata accents, controls, tabs, and description use light-theme values.
- [x] Category/subcategory badges removed from the detail presentation only;
  API models remain unchanged.
- [x] Dark palette remains available through the same provider toggle.
- [ ] Physical Android Light/Dark screenshot comparison and browser handoff
  remain pending; no visual parity claim is made.

## Task 05 correction evidence

- [x] Read-only audit completed for the website mobile filter panel, card
  structure, poster ratio, metadata rows, footer CTA, glass styles, and
  responsive spacing.
- [x] Native shared header retained; duplicate Schedule section removed.
- [x] Schedule, Event Type, and Categories now render inside one unified
  translucent rounded panel with independent horizontal chip rows.
- [x] Event Hub heading now follows the filter panel with centered title,
  separator lines, and diamond accents.
- [x] Native cards now use the website's full-width 16:9 poster and
  structured Date/Schedule/Venue rows with circular icon backgrounds.
- [x] `npm run typecheck`
- [x] `npx expo install --check`
- [x] `npx expo-doctor` (21/21)
- [x] `npm run test:native-api`
- [x] `npx expo export --platform android` after correction
- [ ] Physical Android screenshot comparison at 694 x 1536

## Task 05 final visual refinement evidence

- [x] Website icon audit confirmed Lucide (`Calendar`, `Clock`, `MapPin`,
  `ArrowRight`, `LayoutGrid`, `Sparkles`, `Ticket`, `Flame`, and related
  controls).
- [x] Native Unicode symbols replaced with local SVG vectors.
- [x] Date ranges use website `DD/MM/YYYY – DD/MM/YYYY` formatting and
  schedule values use 12-hour AM/PM formatting.
- [x] Venue values remain API-driven and wrap to two lines when necessary.
- [x] Filter/card glass surfaces use the website-derived translucent opacity,
  gradient, border, and shadow values without adding expensive per-card blur.
- [x] `npm run typecheck`
- [x] `npx expo install --check`
- [x] `npx expo-doctor` (21/21)
- [x] `npm run test:native-api`
- [x] `npx expo export --platform android`
- [ ] Physical Android screenshot comparison of icons, metadata, and glass
  treatment at 694 x 1536

## Final filter panel correction evidence

- [x] Schedule chips render as inline horizontal pills; no icon-above-label
  treatment remains.
- [x] Today uses the inline green status dot.
- [x] Event Type chips use plain inline labels except the Trending flame.
- [x] Category chips use per-category vector icons, actual subcategory count
  badges, and navy selected All/category styling.
- [x] Section icon containers use vector Schedule, Event Type, and Categories
  shapes.
- [x] Filter panel uses responsive inset/padding, translucent gradient glass,
  softer border/shadow treatment, visible capsule backgrounds for every chip,
  and compact category count badges.
- [x] `npm run typecheck`
- [x] `npx expo install --check`
- [x] `npx expo-doctor` (21/21)
- [x] `npm run test:native-api`
- [x] `npx expo export --platform android`
- [ ] Physical Android filter-panel screenshot comparison at 694 x 1536

## Task 09 final end-to-end verification

### Automated verification

- [x] `npm run typecheck` — PASS
- [x] `npx expo install --check` — PASS; dependencies up to date
- [x] `npx expo-doctor` — PASS; 21/21 checks
- [x] `npm run test:native-api` — PASS; live homepage/feed/detail/manifest/snapshot plus cache, timeout, invalid-response, and fallback checks
- [x] `npx expo export --platform android` — PASS; Android bundle exported to `dist/`
- [x] `git diff --check` — PASS in the native repository
- [x] Resolved Expo config inspected — Android-only, SDK 57, icon and adaptive icon configured
- [x] Source audit — Expo Router routes, public API/cache, theme persistence, loading/error states, navigation, assets, permissions, and external URL boundaries inspected

### Physical Android verification

- [ ] **NOT VERIFIED:** cold launch and warm launch
- [ ] **NOT VERIFIED:** homepage, carousel, horizontal and vertical scrolling
- [ ] **NOT VERIFIED:** Event Hub search keyboard/debounce, filters, trending restore, pagination, empty/error states
- [ ] **NOT VERIFIED:** event details, poster, metadata, back navigation, hardware back, state restoration
- [ ] **NOT VERIFIED:** external booking browser handoff and contact email handoff
- [ ] **NOT VERIFIED:** header drawer and footer navigation
- [ ] **NOT VERIFIED:** light/dark mode and theme persistence after restart
- [ ] **NOT VERIFIED:** network unavailable behaviour and recovery after restoration
- [ ] **NOT VERIFIED:** repeated navigation, memory stability, image reuse, and scroll responsiveness

No physical-device result is converted to PASS. Earlier user-confirmed logo/homepage observations remain historical evidence only and do not cover this complete Task 09 checklist.

### Security and boundaries

- [x] No secrets, service-role keys, authentication, payment, ticketing, or unnecessary native permissions found in the native source/configuration.
- [x] Production API/content constants use HTTPS; no localhost or loopback endpoint found.
- [x] API errors are mapped to user-safe messages without response-body/detail leakage.
- [x] Public cache keys contain public payloads only; no user/session data path exists.
- [x] External HTTPS and mail handoffs validate/handle failures through `src/utils/externalLinks.ts`.
- [!] **NOT VERIFIED:** release-build debug flags, signing, and installed production artifact behaviour.

### Repository boundary

- [x] No files were intentionally changed outside `lpu-events-app/` during Task 09.
- [!] **NOT VERIFIED:** `lpu-events-student/` and `lpu-events-admin/` were already dirty when inspected, so their pre-task cleanliness cannot be proven from this workspace.
- [x] No generated Android native project or signing material was added.
