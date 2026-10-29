# LPU Events Mobile — Verification Checklist

Legend: `[ ]` not checked · `[x]` verified · `[!]` failed/blocked · `[N/A]` genuinely not applicable (explain)

## Environment

- [x] Actual target repository/branch recorded (`lpu-events-student`, branch `main`, commit `e67c4ee`)
- [x] Existing user changes preserved (all working directories verified clean)
- [x] Expo SDK and Expo Go compatibility checked against current official docs (Expo `58.0.21`, SDK 57/58 transition noted)
- [ ] Phone model and OS recorded (To be recorded during Task 01 physical-device test)
- [ ] App runs by scanning QR in Expo Go (Task 01)
- [x] No Android Studio/SDK/emulator required (Confirmed constraint for development workflow)

## Website isolation

- [x] Website root package/lockfile unchanged unless explicitly approved
- [x] Website `src/`, `public/`, and deployment config unchanged
- [x] Sibling admin/platform/backend folders unchanged
- [x] Existing student website build verified when applicable (read-only audit, source untouched)

## Startup and logo

- [x] Logo artwork matches source (Inspected `LpuEventsLogo.tsx` SVG radial gradients and paths)
- [ ] Full logo animation completes (To be implemented in Task 02)
- [ ] Animation starts promptly (Task 02)
- [ ] Cache read/network run without holding the splash (Task 03)
- [ ] Warm content appears without artificial full-screen delay (Task 03/04)
- [ ] Offline/slow network doesn't leave splash stuck (Task 03)

## Visual parity

- [ ] Light theme (Task 02+)
- [ ] Dark theme (Task 02+)
- [ ] Header/search (Task 04)
- [ ] Hero carousel (Task 04)
- [ ] Happening Today (Task 04)
- [ ] Advertisement placement (Task 04)
- [ ] Category/subcategory and other filters (Task 05)
- [ ] Event cards (Task 05)
- [ ] Event details (Task 06)
- [ ] Informational pages/footer (Task 07)
- [ ] Loading/empty/error/maintenance states (Task 07)
- [x] Poster sizes/fit match reference (Verified CSS: Hero `aspect-[3/2]`, Cards `aspect-[16/9]`, Details `aspect-[16/10]`)

## Behaviour

- [ ] Search/suggestions (Task 05)
- [ ] Category/subcategory filters (Task 05)
- [ ] Date/schedule filters (Task 05)
- [ ] Free/paid and trending (Task 05)
- [ ] Show More increment and deduplication (Task 05)
- [ ] Past events where supported (Task 05)
- [ ] Carousel autoplay/manual navigation interaction (Task 04)
- [ ] Advertisements and safe external destinations (Task 04)
- [ ] Event details fetch and content sections (Task 06)
- [ ] Back navigation/position restoration (Task 06)
- [ ] External booking flow only (Task 06)
- [ ] Theme persistence (Task 02+)
- [ ] About/Contact/Privacy/Terms navigation (Task 07)

## Performance

- [ ] Repeated scrolling does not blank/reload existing rows unnecessarily (Task 08)
- [ ] Image URLs/variants resolve correctly (Task 03/04)
- [ ] Disk/memory image cache verified (Task 03)
- [ ] No synchronous persistent-cache scan at startup (Task 03)
- [ ] No redundant requests on search/filter input (Task 05)
- [ ] Cold/warm startup tested (Task 08)
- [ ] Slow/offline network tested (Task 08)
- [ ] Repeated detail navigation tested (Task 08)
- [ ] Measured results recorded; no fabricated metrics (Task 08)

## Final checks

- [ ] TypeScript check passed (Task 01+)
- [ ] Expo health/compatibility check passed where configured (Task 01+)
- [ ] Relevant tests passed (Task 01+)
- [x] `git diff` reviewed for unwanted changes (Verified across all repositories)
- [x] Remaining physical-phone checks clearly listed
