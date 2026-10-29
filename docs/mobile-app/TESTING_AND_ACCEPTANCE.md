# Testing Strategy and Acceptance Criteria

## General rule

Acceptance criteria are requirements, not claimed test results. Record the actual command, device, result and any unverified cases for every task.

## Automated checks where applicable

- TypeScript checking with the project's actual configuration.
- `npx expo-doctor` or its current documented equivalent.
- Component/unit tests for pure search/filter transformations and API parsing.
- API response shape and error-handling tests using typed fixtures derived from real production/dev responses (no fabricated fixture presented as live data).
- Navigation/back handling tests where practical.
- Lint/build checks if the selected template/repository defines them.
- Ensure no website package/deployment config changed unintentionally; run the existing student website build when a task could have affected it.

Do not add a test framework solely for the sake of having one before checking the current repo and Expo template. Keep tests meaningful.

## Physical phone acceptance checks

Use Expo Go on the target phone. Record phone model/Android version and Expo Go compatibility used.

### Startup

- Kill app and launch: logo animation starts promptly and plays fully.
- Cold start with network: first useful content appears as soon as data is available.
- Warm start with cached content: content appears promptly, without a full-screen artificial wait.
- Slow or unavailable network: animation doesn't get stuck and cached content or a useful error/retry state is shown.
- Return from background: no repeated splash loop or broken navigation.

### Visual parity

- Compare screenshots at a known viewport, light/dark themes and equivalent content.
- Check logo, header, hero card, carousel controls, Happening Today, filters, event cards, ads, details, and remaining pages.
- Verify poster fit/aspect ratio and consistent spacing.
- Confirm typography, borders, gradients, radii, and card shadows against current source design.

### Functionality

- Search suggestions open the correct event.
- Search/filter combinations behave as in the website.
- Date/schedule, category/subcategory, free/paid and trending controls work where currently supported.
- Show More uses the server-configured increment, prevents duplicates and handles end-of-feed state.
- Past events work where exposed.
- Hero and Happening Today sliders allow manual interaction and obey autoplay rules.
- Direct advertisement click targets resolve correctly.
- Event details load real data, preserve content section behaviour and link to related events where applicable.
- Back navigation restores discovery context/position where practical.
- External booking opens the organizer URL, not an internal checkout.
- Theme persists across app restarts.
- About, Contact, Privacy and Terms links open the correct native pages.
- Maintenance, loading, empty and network-error states remain usable.

### Scroll/performance

- Scroll through at least 30 event cards repeatedly; previously viewed rows must not flash blank due to unnecessary remount/refetch.
- Navigate into and out of details repeatedly.
- Monitor crashes, image request errors, memory growth and janky transitions.
- Test fast and slow network, cold and warm cache.

### Website regression check

The native project must not affect the student site. Verify `git diff` has no unapproved edits to existing website files, and run the existing student site build if any root/config files were changed or if nested-package configuration could affect it. Report if it was not run.

## Definition of done for a feature task

A feature is done only when:

1. Real data is connected (or a missing backend contract is documented explicitly).
2. The expected happy path and relevant error/empty paths work.
3. UI is checked against the source site.
4. Type/lint/tests relevant to the change pass.
5. Physical-device checks are completed by the agent where possible; remaining manual checks are listed precisely.
6. Living status and verification docs are updated.
7. No later roadmap task was started.
