# Task 07 — Remaining Website Pages and Cross-Screen States

**Do only Task 07. Do not start the app-wide performance audit or final release assessment. Stop when in-scope pages/states are implemented.**

## Preconditions

Tasks 00–06 accepted. Inspect the current static page components, footer links, announcement/maintenance components and any navigation state in the website.

## Goal

Complete the remaining existing student website functions without broadening the product.

## Scope

- About Us.
- Contact Us.
- Privacy Policy.
- Terms of Service.
- Footer destinations/links relevant to the existing site.
- Theme persistence across routes.
- Campus announcement/dismiss behaviour where present.
- Maintenance/warming, loading, empty, missing event, and recoverable error states.
- Ad/registration link failure feedback where still outstanding.

## Steps

1. Port exact existing copy/content/links from the current source. Do not invent text, company details or contact addresses.
2. Use a common native screen layout where it preserves parity; avoid duplicating page-shell logic.
3. Ensure each link has working behaviour and safe external opening where applicable.
4. Ensure theme changes apply consistently to every completed screen.
5. Verify network/maintenance errors do not strand the user; preserve useful cached content and allow retry where appropriate.
6. Confirm no student login/profile/notification center has been added.

## Acceptance criteria

- All remaining in-scope source pages have native counterparts.
- Footer and navigation destinations work.
- Loading/empty/maintenance/error states are usable and visually consistent.
- No new product capability introduced.

Update the trackers, note what needs physical-phone verification, and **stop before Task 08**.

## Task 07 implementation record

### Website route inventory (read-only audit)

- `/` — homepage, hero carousel, Happening Today, categories/Event Hub, footer.
- `/events/:id` — event details and external registration handoff.
- `/about` — About LPU Events.
- `/contact` — contact channels and mail preparation form.
- `/privacy` — privacy and Google AdSense disclosures.
- `/terms` — terms and organizer responsibility boundary.
- Mobile navigation also exposes Events, Event Categories, About Us, Contact Us, Privacy Policy, and Terms of Service. Search is an inline header surface; categories/subcategories are part of Event Hub rather than separate routes.

Website-only behaviour intentionally omitted: browser AdSense rendering, cookie banner, QR/download/share web modal, service worker/SEO metadata, and desktop hover interactions. Native does not add authentication, profiles, booking, payments, tickets, or notifications.

### Native implementation

- Added Expo Router routes `app/about.tsx`, `app/contact.tsx`, `app/privacy.tsx`, and `app/terms.tsx`.
- Added shared native `InfoPage` shell with light/dark tokens, safe-area scrolling, source-derived content, retry-free static states, and Android back navigation.
- Added native header drawer and footer links, including the category destination (scrolls to the existing Event Hub) and safe mailto handoff.
- Persisted theme selection through the existing AsyncStorage dependency.
- Reused the existing public homepage/feed/detail API and cache; no new endpoint or cache was introduced.

### Verification

The required automated checks passed on 2026-10-31:

- `npm run typecheck`
- `npx expo install --check`
- `npx expo-doctor` (21/21)
- `npm run test:native-api`
- `npx expo export --platform android`

Physical Android verification remains required for visual comparison, drawer dismissal, mail client handoff, theme persistence after restart, hardware back, and restoration of Event Hub scroll/filter state.

### Navigation audit correction

- The native Categories destination now targets the measured Event Hub category tier from both the header drawer and footer; it does not create a second categories route.
- The native footer now includes Categories alongside About Us, Contact Us, Privacy, and Terms.
- Search remains on the homepage/Event Hub surface, preserving the existing 300 ms event-name-only search, active filters, prefix-before-contains ranking, and trending restoration.
