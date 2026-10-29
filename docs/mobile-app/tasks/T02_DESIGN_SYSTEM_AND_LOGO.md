# Task 02 — Website-Derived Design System and Full Logo Animation

**Do only Task 02. Stop before implementing homepage modules or data loading.**

## Preconditions

Task 01 is accepted and the starter opens in Expo Go. Inspect current files and Git status. Read `UI_PARITY_SPEC.md` and `ASSETS_AND_ANIMATION.md`.

## Goal

Create native design tokens and reusable visual primitives derived from the website, then reproduce the complete logo animation and efficient launch handoff.

## Steps

1. Inspect actual `src/index.css`, logo components, inline logo/art in `index.html`, source assets, and related animation CSS/JavaScript. Update documentation if the active source differs.
2. Identify exact light/dark token values, fonts actually available/licensed, radii, gradients, border and shadow language. Store only the tokens needed by planned components.
3. Find and reuse the genuine logo/art assets. Check SVG/browser-only features and create a compatible native equivalent only where necessary.
4. Implement a consistent native theme/provider or equivalent minimal theme state, including persisted theme only if the existing site supports it and a native cache choice is clear.
5. Implement the logo with the complete intended sequence and final state. Begin animation immediately after first native render. Run a simple non-blocking startup shell; do not add fixed artificial waits.
6. Separate OS-managed splash handling from the in-app animation. Expo Go differences must be documented.
7. Add reusable primitives only when real screens need them (for example themed surface, heading/text variants, buttons or loading skeleton). Do not build an entire unrequested design framework.
8. Add basic visual tests/screenshots if supported. Compare colors, sizing and logo animation with the source reference.

## Acceptance criteria

- Light/dark palette matches actual source values.
- Real logo artwork and complete animation are used; no placeholder icon/spinner substitution.
- Animation begins promptly and does not wait for network.
- No arbitrary minimum delay remains after animation/content readiness.
- Starter and website still work independently.

Update trackers, list any animation differences not yet resolved, state exact phone checks needed, and **stop before Task 03**.
