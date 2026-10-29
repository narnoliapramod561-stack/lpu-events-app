# Performance Requirements and Acceptance Strategy

## Principles

1. Useful UI should render before the network completes.
2. Full logo animation may complete, but must not create an artificial wait after content is ready.
3. Event lists must remain smooth and not repeatedly blank/reload when scrolling away and back.
4. Cache reads/writes must be asynchronous when using persistent native storage.
5. Avoid redundant API requests, duplicate image loads, repeated parsing, and whole-screen rerenders.
6. Measure on a real mid-range phone where possible; a fast desktop Metro/browser view is not proof of mobile performance.
7. Avoid claiming a numeric target is met without measuring it.

## Launch sequence

- Native app shell appears immediately.
- Start logo animation immediately after native view can render.
- Trigger cache read and start the initial homepage fetch without waiting for the animation.
- Display cached homepage as soon as it is available.
- If cache is missing, present lightweight skeleton placeholders and the first valid content as soon as returned.
- Continue refreshing stale data in the background.
- End the animation on its intended end state, then reveal/retain content without a second artificial delay.
- Handle offline and maintenance states with a retry action, not an infinite blocking splash.

Avoid blocking JS startup with large JSON scans or importing heavy optional feature modules. Delay nonessential work until after first useful content appears.

## Data performance

- One aggregated homepage request should provide initial homepage modules where supported by the current API.
- Request category/settings separately only if absent from the existing payload or needed by an existing route.
- Use single-flight deduplication for the same resource.
- Debounce search input (a reasonable short delay; determine through usability testing), cancel or ignore obsolete requests, and use local search if the required catalogue is already available.
- Preserve server-side filter semantics. Don't download the entire event archive repeatedly in order to locally filter one page.
- Use stable event IDs as keys, deduplicate pagination merges, and protect against overlapping load-more requests.
- Keep event details lightweight; fetch a full event record only when required and reuse already available summaries during navigation.

## List performance

- Use `FlatList` for the main long vertical event feed and `horizontal` virtualized lists for large horizontal sequences where necessary.
- Keep homepage sections in one natural scroll surface. Avoid nested vertical scrolling lists unless the current UI genuinely demands them.
- Memoize repeatable cards and callbacks where it reduces measured work.
- Avoid calculating complex filters or image URLs separately inside every rendered card; precompute/select in the data layer where useful.
- Tune `initialNumToRender`, `windowSize`, `maxToRenderPerBatch`, and batching delays only after profiling. Overly large batches can block touch interactions; overly small batches cause blank gaps.
- Test scroll position restoration when opening and closing details.
- Avoid `blur`/animated transforms on every item, and don't apply a persistent GPU layer or `will-change` equivalent to all cards.

Reference: https://reactnative.dev/docs/optimizing-flatlist-configuration

## Images

Prefer Expo's `expo-image` after verifying the version against the chosen Expo SDK. Use its memory/disk cache policies and appropriate `contentFit` behaviour.

- Full posters must remain readable and not be distorted.
- Use correct aspect ratios and image source selection; verify all generated source URLs actually exist.
- Avoid issuing one request for a missing responsive suffix followed by a fallback request.
- Avoid using a full-resolution image as its own low-resolution placeholder.
- Do not render a second blurred copy behind each visible card as a default visual effect.
- Prefetch only imminent high-value images such as the first hero and initial visible cards, with a reasonable concurrency/byte budget. Do not prefetch the entire feed.
- Ensure recycled/off-screen items don't trigger unnecessary transitions or flicker when scrolling back.

Reference: https://docs.expo.dev/versions/latest/sdk/image/

## Animation and responsiveness

- Native animation must use Expo Go-compatible APIs/dependencies.
- Prefer `transform` and `opacity` for transitions, avoiding repeated layout recalculation.
- Pause or reduce continuous carousel animation when screens are not active, without breaking the current autoplay/manual interaction rules.
- Keep touch handling responsive during image loading and list pagination.
- Use appropriate reduced-motion/accessibility behaviour where feasible without removing the default full logo animation the product requires.

## Cache policy

- Use an in-memory fast path in the current process.
- Use AsyncStorage or another justified native persistence option for serialized public payloads.
- Do not synchronously scan all persistent records at startup.
- Use TTLs/revision checks and stale-while-revalidate behaviour.
- Version persisted payload schemas so a future app update can safely discard/transform incompatible records.
- Keep cache operations from causing repeated full-object JSON parsing during component renders.
- Avoid a redundant two- or three-layer cache architecture unless every layer has a clear purpose.

## Measurement protocol

Record test device/model, OS, app/Expo SDK, network condition, whether data/image caches were warm, and number of repetitions. Evaluate:

- Cold start to first visible native frame.
- Cold start to first useful event content.
- Warm launch to cached homepage.
- Time until hero's first image loads.
- Scroll responsiveness over at least 30+ event cards.
- Search/filter responsiveness with both warm and cold data.
- Memory stability across repeated navigation and scrolling.
- Request count and image request failures.

Do not set an arbitrary pass based on one run. Compare medians across repeated cold and warm tests and record observed limitations. Use built-in dev instrumentation carefully; development mode can be materially slower than release.
