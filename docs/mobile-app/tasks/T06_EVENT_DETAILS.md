# Task 06 — Event Details and External Registration

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
