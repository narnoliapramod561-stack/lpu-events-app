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
