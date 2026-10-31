# Decisions and Open Questions

## Canonical decisions — do not silently reverse

1. **Native app, not wrapper:** React Native + Expo; no WebView embedding of the student website.
2. **Exact website design direction:** existing student website is the UI reference. No redesign, generic template, stock art or extra app-only features.
3. **Scope:** only current student-facing discovery and details functionality. No student login/profile, push/in-app notifications, internal booking, payments or ticket wallet.
4. **Public backend:** reuse existing public Cloudflare-backed API and public-content snapshots where verified; do not query database directly from UI or create a mobile-only backend by default.
5. **External booking:** open organizer-supplied external registration URLs outside LPU Events, preserving the current disclosure flow.
6. **Development workflow:** Expo Go on a physical phone; no Android Studio or local Android SDK/emulator requirement.
7. **Workspace boundary:** `lpu-events-app/` is a standalone sibling folder at the `lpu1/` workspace root and is the Expo project root. All app code, assets, dependencies, configuration and app docs live there. `lpu-events-student/` is read-only source/reference; never place app code inside it.
8. **One task per request:** the agent must stop when the requested task is complete. A roadmap is not authorization to do every task now.
9. **Logo:** reproduce the complete original animation, while removing unnecessary blocking delay after content becomes ready.
10. **Image treatment:** preserve complete posters and the documented display box ratios; never stretch/crop the full poster by accident.
11. **Task 01 SDK selection:** use Expo SDK 57 (`expo` `~57.0.31`) for the Expo Go workflow while SDK 58 store support is transitional; confirm the target phone's installed Expo Go version before marking the foundation verified.
12. **Platform scope:** Android-only. Do not create iOS builds, simulator tests, TestFlight artifacts, or iOS-specific implementation.

## Questions resolved by source inspection (Task 00 Audit)

- **Does current local checkout match remote default branch and reference paths?**
  - **Verified:** Yes. `lpu-events-student` is on `main`, tracked to `origin/main` (commit `e67c4ee`), with a clean working tree.
- **Which branch is active, and are there uncommitted user changes?**
  - **Verified:** Active branch is `main`. `git status --short` returned 0 uncommitted changes.
- **Is the website repo standalone or part of root workspace setup?**
  - **Verified:** `lpu-events-student/` is a standalone Git repository with its own `package.json`. The root workspace `lpu1/package.json` contains convenience proxy scripts (`npm --prefix`) rather than an npm/yarn monorepo workspace.
- **Does `lpu-events-app/` contain any app files in addition to docs?**
  - **Verified:** No. `lpu-events-app/` contains only `README.md` and `docs/mobile-app/`. No premature code or nested `mobile/` directory exists.
- **Is there a shared package under `packages/`?**
  - **Verified:** `packages/shared/src/` exists and contains pure shared types and utilities. However, `lpu-events-student/src/shared/` contains the actual active version of those files (e.g. updated `client.ts` with Web Locks and edge endpoint routing).
- **What source assets provide the complete logo animation?**
  - **Verified:** The logo artwork is pure SVG in `LpuEventsLogo.tsx` (viewBox 0 0 512 512) featuring 6 radial gradients, overlapping circle layers, sheen linear gradient, drop shadows, and text elements. The startup animation in `index.html` orchestrates entry transitions, circle stagger (0.00–0.15s), typography cascade, and sheen sweep (0.55s duration, 0.22s delay; ~770ms total duration, safety timeout 850ms).
- **Which font files are available/licensed for native bundling?**
  - **Verified:** Website loads Google Fonts (`Plus Jakarta Sans`, `Geist`, `Inter`, `Outfit`) via web fonts. In native Expo, `@expo-google-fonts/plus-jakarta-sans` and `@expo-google-fonts/outfit` can be loaded dynamically.
- **What are current live homepage/event/detail payload shapes and statuses?**
  - **Verified Live:** `GET https://lpuevents.live/api/public/version` -> 200 OK (`version: 0, status: READY`). `GET https://lpuevents.live/api/public/homepage` -> 200 OK with `categories` (13), `carousel` (4), `featured` (0), `trending` (0), `advertisements` (0), `settings` (6), and `events` (9).
- **Is the snapshot manifest publicly available?**
  - **Verified Live:** `GET https://images.lpuevents.live/public-content/manifest.json` -> 200 OK. Schema version is `1.0.0`, revision `rev_20261021T081230Z_34c0cd`, resources pointing to `homepage`, `catalogue`, `categories`, and `event_details_dir`.
- **Which ad placements are database-managed vs AdSense?**
  - **Verified:** Live settings show `ad_system_config.global_enabled: false`. Placements for `hero_carousel`, `event_hub`, and `happening_today` specify provider `"direct"`. No AdMob should be installed; only direct native advertisements from the feed should be supported.
- **Does current website use initial count 9 or 10?**
  - **Verified:** In live production settings, `initial_event_limit` is omitted, and the live homepage API returns exactly 9 events. Both `App.tsx` and `client.ts` use fallback `9`. The native app should default to 9.
- **Do filters (`today`, `tomorrow`, `this_week`, etc.) work as documented?**
  - **Verified:** Timeline filters in `App.tsx` and `client.ts` accept `today`, `tomorrow`, `this_week`, `upcoming`, and ISO date `YYYY-MM-DD`.
- **What phone/OS and Expo Go version will be the test target?**
  - **Open after Task 01:** The agent cannot access the user's Android phone. The official SDK 57 matching command resolved Expo Go `57.0.9`; the user must install/use that APK or confirm the store app supports SDK 57 and confirm the placeholder opens.

## Known mismatch resolution

The inspected `src/App.tsx` and `src/shared/client.ts` both use a fallback `limit` of 9, and the live production API returns 9 events. The fallback of 9 is confirmed authoritative and should be adopted by the native app.

## Current status

Task 00 (Workspace Audit and Documentation Reconciliation) is **VERIFIED** on 2026-10-29. Task 01 is **IMPLEMENTED — NOT VERIFIED** on 2026-10-30: local foundation checks passed, but Expo Doctor was TLS-blocked and physical-device launch remains pending.
