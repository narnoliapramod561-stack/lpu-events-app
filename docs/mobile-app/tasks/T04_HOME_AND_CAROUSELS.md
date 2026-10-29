# Task 04 — Homepage, Header, Hero, and Happening Today

**Do only Task 04. Do not implement the full Event Hub, event details, or remaining pages. Stop after homepage acceptance.**

## Preconditions

Tasks 00–03 accepted. Use real API/repository methods and the visual spec. Inspect the latest website component code again before translating it.

## Goal

Implement the home screen's upper content as native components with high visual parity.

## Scope

- Existing header and LPU Events logo placement.
- Search input and suggestions entry point (full search/filter task follows in Task 05).
- Existing light/dark theme control.
- Hero carousel with real slide resolution, artwork, text hierarchy, controls, indicators, autoplay/manual rules and event/ad action.
- Existing supported direct-ad placement under/around the hero according to real configuration.
- Happening Today cards and existing View All flow/navigation.
- Initial loading, empty, maintenance and recoverable failure states where the module needs them.

## Steps

1. Capture or obtain source reference screenshots for the existing mobile website at a recorded viewport.
2. Map each source component to native primitives; do not reuse web JSX or Tailwind classes.
3. Read real homepage bundle/settings and resolve its nested event/ad/carousel records explicitly.
4. Reproduce the actual card layouts and ratios from the source. Use Expo-compatible image caching and avoid duplicate blurred layers.
5. Ensure swipe/drag/manual controls remain usable when autoplay is on. Manual interaction resets the timer as in the source. Avoid continuous autoplay when the screen is not active if it wastes resources.
6. Wire click-through to actual event routes and validated direct-ad URLs.
7. Read settings from the backend rather than introducing new hardcoded placements or values.
8. Compare side-by-side screenshots; fix layout/typography/asset differences before marking complete.

## Acceptance criteria

- Homepage modules render real server data.
- Logo/header/hero/Happening Today closely match current site design.
- Carousel interactions work, content order is correct, ad placements obey current config.
- Startup content appears without artificial splash wait.
- No fake event cards or unrequested UI additions.

Record visual deviations, tested API evidence, tests, and phone checks. Update trackers and **stop before Task 05**.
