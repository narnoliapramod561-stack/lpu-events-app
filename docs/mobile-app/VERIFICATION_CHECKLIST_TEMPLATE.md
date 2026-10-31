# LPU Events Mobile — Verification Checklist

Legend: `[ ]` not checked · `[x]` verified · `[!]` failed/blocked · `[N/A]` genuinely not applicable (explain)

## Environment

- [ ] Actual target repository/branch recorded
- [ ] Existing user changes preserved
- [ ] Expo SDK and Expo Go compatibility checked against current official docs
- [ ] Phone model and OS recorded
- [ ] App runs by scanning QR in Expo Go
- [ ] No Android Studio/SDK/emulator required

## Website isolation

- [ ] Website root package/lockfile unchanged unless explicitly approved
- [ ] Website `src/`, `public/`, and deployment config unchanged
- [ ] Sibling admin/platform/backend folders unchanged
- [ ] Existing student website build verified when applicable

## Startup and logo

- [ ] Logo artwork matches source
- [ ] Full logo animation completes
- [ ] Animation starts promptly
- [ ] Cache read/network run without holding the splash
- [ ] Warm content appears without artificial full-screen delay
- [ ] Offline/slow network doesn't leave splash stuck

## Visual parity

- [ ] Light theme
- [ ] Dark theme
- [ ] Header/search
- [ ] Hero carousel
- [ ] Happening Today
- [ ] Category/subcategory and other filters
- [ ] Event cards
- [ ] Event details
- [ ] Informational pages/footer
- [ ] Loading/empty/error/maintenance states
- [ ] Poster sizes/fit match reference

## Behaviour

- [ ] Search/suggestions
- [ ] Category/subcategory filters
- [ ] Date/schedule filters
- [ ] Free/paid and trending
- [ ] Show More increment and deduplication
- [ ] Past events where supported
- [ ] Carousel autoplay/manual navigation interaction
- [ ] External destinations are validated and safely opened; no native ad SDK is installed
- [ ] Event details fetch and content sections
- [ ] Back navigation/position restoration
- [ ] External booking flow only
- [ ] Theme persistence
- [ ] About/Contact/Privacy/Terms navigation

## Performance

- [ ] Repeated scrolling does not blank/reload existing rows unnecessarily
- [ ] Image URLs/variants resolve correctly
- [ ] Disk/memory image cache verified
- [ ] No synchronous persistent-cache scan at startup
- [ ] No redundant requests on search/filter input
- [ ] Cold/warm startup tested
- [ ] Slow/offline network tested
- [ ] Repeated detail navigation tested
- [ ] Measured results recorded; no fabricated metrics

## Final checks

- [ ] TypeScript check passed
- [ ] Expo health/compatibility check passed where configured
- [ ] Relevant tests passed
- [ ] `git diff` reviewed for unwanted changes
- [ ] Remaining physical-phone checks clearly listed
