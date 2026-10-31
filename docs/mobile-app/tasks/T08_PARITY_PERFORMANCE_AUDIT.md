# Task 08 — Visual Parity and Performance Audit

**Do only Task 08. Fix findings in this audit scope, then stop. Do not initiate store release or deploy.**

## Preconditions

Tasks 00–07 accepted. Read the full verification checklist and known issue/decision logs. Capture actual `git status` and current task baseline.

## Goal

Run a structured audit across the native app and source website, fix the largest verified mismatches and performance defects, and record evidence.

## Visual audit

Compare equivalent content and viewport/theme for:

- Logo animation and first useful frame.
- Header/search/theme controls.
- Hero carousel slide composition/control position/timing.
- Advertisements and their actual placements.
- Happening Today cards.
- Filter controls and Event Hub cards.
- All event poster/detail image boxes.
- Event details hierarchy, tabs/sections and external CTA.
- About/Contact/Privacy/Terms and footer.
- Loading/empty/maintenance/error states.

Use actual screenshots; don't claim screenshot parity if you only inspected source code. Document unavoidable native system differences.

## Performance audit

Test cold/warm starts, slow/offline network, repeated scrolling, fast search typing, filter changes, Show More concurrency, details open/close and image caching.

Find and fix issues within native-app scope, especially:

- Artificial splash or post-readiness delays.
- Synchronous work on launch.
- Duplicate requests or image URL retries.
- List row blanking/unnecessary remounts.
- Whole-screen rerenders on unrelated state changes.
- Expensive blur/shadow/animation on every list row.
- Cache pollution/stale-response races.
- Infinite loading or unhandled image/API errors.

Do not use native performance work as a reason to alter existing website source. If a website defect is relevant to parity, record it separately.

## Verification

Run available Expo/TypeScript/tests. Use the actual Expo Go physical-device workflow. Record device, OS, SDK, cache state, network and observed metrics, with repeated runs where possible. Compare cold vs warm. Do not invent benchmark numbers or mark a check passed without running it.

Review `git diff` to prove unrelated workspace folders were not changed and the student website remains buildable.

## Acceptance criteria

- All major parity checks have evidence or a clearly listed blocker.
- Major performance defects found in the app are fixed or documented with reason.
- Website is not unintentionally modified.
- Verification checklist is updated honestly.

Update documentation and **stop before Task 09**.

## Task 08 execution record (2026-10-31)

### Evidence-based findings

| Area | Finding | Evidence | Root cause | Decision |
|---|---|---|---|---|
| Theme/navigation | Stack transition surfaces were always light; the status bar used `auto` | `app/_layout.tsx` used `colors.light.background` and `StatusBar style="auto"` | Root navigation was not consuming the shared theme context | Fixed with theme-bound stack `contentStyle` and explicit light/dark status-bar styles |
| Theme persistence | A persisted dark theme could be overwritten by the initial light state before AsyncStorage hydration completed | `src/theme/ThemeContext.tsx` wrote on every initial render | Read and write effects ran independently | Fixed by delaying writes until hydration completes |
| Header/search | Search text was always dark and had no theme-bound surface/border | `src/components/HomeHeader.tsx` used `color: '#0f172a'` | Search control bypassed shared palette values | Fixed with palette text, surface, and outline |
| Homepage feed | Event Hub uses a vertical `FlatList` inside the homepage `ScrollView` | `src/components/EventHub.tsx` sets `scrollEnabled={false}` while `app/index.tsx` owns the outer scroll | One natural homepage scroll surface intentionally disables inner scrolling; this limits list virtualization as the feed grows | No speculative rewrite in Task 08; record as a measured-device follow-up |
| Images/background | Campus background is one static `ImageBackground`; posters use `contain` | `app/index.tsx`, `app/events/[id].tsx`, and native card/carousel components | No per-card blur or animated background layer found | No change required |
| API/cache | Single-flight, stale-while-revalidate, TTL and revision-aware cache paths are present | `src/api/publicApi.ts`, `src/cache/nativeCache.ts`; baseline API checks passed | Existing architecture already covers the requested behavior | Preserved |

### Changes made

- Made theme persistence hydration-safe.
- Bound Expo Router stack surfaces and Android status-bar appearance to the active theme.
- Corrected header search input foreground/background/border colors in both themes.
- Stabilized Event Hub row rendering by passing the stable event-selection callback through a memoized `renderItem`, avoiding a new parent-created press callback for every card on unrelated screen updates.
- Did not alter the API/cache architecture or add unmeasured memoization.

### Measurement record

Automated baseline and post-change checks are recorded in the root implementation status and verification checklist. No physical Android device, frame profiler, or release-build timing capture was available in this session; therefore no cold/warm, frame-rate, memory, or image-cache benchmark is claimed.
