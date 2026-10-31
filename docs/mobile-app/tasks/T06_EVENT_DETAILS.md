# Task 06 — Event Details and External Registration

## Implementation record (2026-10-31)

Implemented in `app/events/[id].tsx`. Event Hub cards now push the selected
event's real `id` through Expo Router. The screen calls the existing
`PublicApiClient.getEventDetails(id)` endpoint (`GET /api/public/events/{id}`)
and therefore retains the Task 03 cache, stale-while-refresh, retry, and
single-flight behavior.

The native screen renders the API's `banner_media_id`/`media_assets` through
the shared `eventImageSource` resolver, preserving the poster with `contain`
and the existing subcategory fallback. It renders name, category,
subcategory, organizer, date range, time range, venue, status, pricing,
description, and sorted `event_content_sections` as scrollable tabs.

`external_registration_url` is accepted only for HTTPS/HTTP URLs. The
`Book Ticket` action opens that organizer URL with React Native `Linking`;
there is no native reservation, payment, ticket generation, or verification.
Header back and Android hardware back return through the existing router
stack, preserving the Event Hub screen state.

Automated checks are recorded in `IMPLEMENTATION_STATUS.md` and
`VERIFICATION_CHECKLIST.md`. Physical Android comparison remains pending and
must not be described as visual parity until completed.

## Task 06 correction — Light Mode parity

The detail route previously read Android's `useColorScheme()` independently
from Home's local toggle. On a dark-configured phone this made Event Details
dark even after Light Mode was selected. `src/theme/ThemeContext.tsx` now
owns the selected app theme at the root and both Home and Details consume it;
the provider defaults to Light Mode and preserves the selection during route
navigation.

Light Details now uses the bright campus background, light glass surfaces,
navy title/value text, orange organizer and date labels, yellow time accents,
pink venue accents, circular metadata icons, and dashed light separators.
Category/subcategory badges were removed from the presentation because they
are not present at that position in the inspected website detail view. API
fields remain unchanged. Dark mode continues to use the dark token palette.

**Do only Task 06. Do not build static pages or perform the final app-wide audit. Stop after details flow verification.**

## Preconditions

Tasks 00–05 accepted. Inspect the latest `EventDetailsView.tsx`, share/disclaimer components, shared event types and current detail endpoint behaviour.

## Goal

Implement native event-detail route/screen matching the current mobile website and its external booking rules.

## Required behaviour

- Correct event identity and actual full poster.
- Name, date/time, venue, category/organizer and applicable pricing/register metadata.
- About the Event and organizer-defined content sections/tabs that are part of current source.
- Existing detail advertisements that can be represented correctly on native.
- Related-event navigation if current site includes it.
- Share behaviour using supported native APIs, not a fake button.
- Existing external-registration disclaimer and external URL opening.
- Back behaviour preserving discovery context/scroll position where practical.
- Loading/error/invalid-ID handling and safe repeat navigation.

## Steps

1. Inspect detail payload and any fallback from slug to UUID; do not assume every route token is a UUID.
2. Reuse the event summary already in memory for a fast first render when it matches; request full details if missing/incomplete.
3. Keep the poster's full artwork and use the documented banner dimensions/fit.
4. Convert content sections safely to native content without blindly rendering web HTML. Support only structured/text formats present in actual data; document other formats instead of injecting browser HTML.
5. Use `Linking.openURL` (with safe URL validation and error handling) for actual organizer registration after the existing disclosure step. Do not process booking/payment inside LPU Events.
6. Use native share APIs compatible with Expo Go for the existing share action. Do not add new deep-link contracts without a decision.
7. Test Android back, header back, missing data, slow detail requests, and repeated open/close.

## Acceptance criteria

- Real event details load correctly from the native route.
- Source layout and section behaviour are replicated closely.
- External booking opens an external destination only; no internal ticketing/auth is added.
- Back navigation returns to the expected discovery context.

Update all relevant trackers, state phone verification requirements, and **stop before Task 07**.
