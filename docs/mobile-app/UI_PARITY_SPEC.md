# UI Parity Specification — Native Must Look Like the Website

## Source of truth

The current checked-out student website is the design reference. Inspect actual mobile CSS and assets, and capture local-reference screenshots if a browser preview is available. Do not design from generic event-app examples.

The target is maximum visual parity on the same viewport and content—not merely similar features. Native rendering has unavoidable differences in font rasterization, safe areas, scroll physics, and system bars; document those differences and correct all controllable ones.

## Task 02 implemented parity

The native startup surface now uses the website's `#fafa-f5`-family startup backdrop, 512x512 Sunset Blend SVG artwork, and extracted light/dark design tokens. The animation uses native SVG and `Animated` values: 0.65 s scale/opacity entrance, six circle layers staggered by 30 ms, text/connector fade, the source's 0.55 s sheen sweep beginning at 220 ms, and a 0.1 s handoff. The reference requested Google-hosted Plus Jakarta Sans and Outfit; no font files are shipped in the website, so native text uses Android's system `sans-serif` fallback rather than pretending a web font is bundled.

## Task 04 native homepage mapping

The native homepage now uses [app/index.tsx](../../app/index.tsx) as one vertical scroll surface. It maps the inspected website components as follows:

| Website reference | Native implementation |
|---|---|
| `src/components/Navbar.tsx` | `src/components/HomeHeader.tsx` with LPU Events logo, search entry point, theme control, and menu affordance |
| `src/components/HeroCarousel.tsx` | `src/components/NativeHeroCarousel.tsx` with API carousel resolution, event fallback slides, `contain` posters, autoplay, pagination, arrows, and interaction pause |
| `src/components/HappeningTodaySlider.tsx` | `src/components/HappeningTodayNative.tsx` with horizontal `FlatList`, event metadata, configured direct-ad insertion, and View All boundary |

The homepage reads `getHomepageWithSnapshot()` from the existing Task 03 client. `homepageModels.ts` resolves the event/media carousel records, `happening_today_config`, and media object keys without adding another client or cache. The retired advertisement feed and injection settings are not part of the contract.

The website's mobile hero reference is `aspect-[3/2]`; native derives the same ratio from viewport width and uses `Image.resizeMode="contain"` so posters are not unintentionally cropped. Happening Today retains the website's approximately `16:9` card image treatment. The native implementation has not yet been screenshot-compared on a physical Android device; font rasterization and safe-area/scroll physics remain documented platform differences. Browser AdSense rendering is web-only and has no native app counterpart.

### Task 06 event details mapping

The native details route follows the inspected website order: back/share row,
full-width 16:9 poster using `contain`, title, category/subcategory chips,
cancellation notice when applicable, organizer, date/time/venue information
panel, organizer-defined content tabs, and the conditional external booking
CTA. Native uses the existing glass tokens, orange action gradient language,
safe-area insets, and one vertical `ScrollView`; web-only QR and HTML
injection are not added. The retired direct-advertising system is not rendered.

### Task 07 informational pages and navigation

The native app now maps the website's `/about`, `/contact`, `/privacy`, and
`/terms` routes to a shared safe-area `ScrollView` shell. Cards use the existing
light/dark surface, outline, typography, spacing, and orange action tokens.
The header drawer mirrors the mobile destinations and the footer exposes the
same public informational links. Categories remain an Event Hub section, so
the header and footer category links scroll to that existing surface rather
than creating a duplicate route.

Native differences are intentional: browser AdSense/cookie UI, browser share/QR
download, hover states, SEO metadata, and service-worker behavior are not
applicable to the Android surface. No AdMob SDK or direct-ad renderer is included. External policy and contact links use
native `Linking`/mailto handoff.

### Task 08 parity audit

The shared light/dark palette is now also applied to the Expo Router stack
surface, Android status bar, and header search control. This closes the
verified cross-screen theme mismatch without introducing a new visual style.
Theme storage hydration is guarded so a persisted dark selection is not
replaced by the initial light default during startup.

### Correction audit notes

The live payload was checked rather than inferred. The first configured carousel item is an `EVENT` for “Guest Lecture by Senior official of Akhil Bharti Organization”; its `events.media_assets` is null. The website's shared image resolver therefore selects `/defaults/events/subcategories/academics_guest-lecture.webp`. Native now bundles and selects that same genuine asset, while preserving remote media URLs when present. It no longer uses the first event feed item as a carousel fallback.

The website's root also uses a fixed 1600x900 `lpu-events-campus-glass-background.webp` layer with `cover` sizing and center positioning. Native uses the same asset as a non-animated background layer behind the one vertical scroll surface, avoiding per-card blur or continuous animation. The corrected header uses a cyan-to-blue gradient, white LPU text, orange Events text, and translucent bordered controls to match the tested mobile reference.

Physical-device screenshot and smoothness comparison remain pending and must be recorded in `VERIFICATION_CHECKLIST.md`; no homepage UI is included in Task 02.

## Visual properties to extract and match

For every relevant component, record the exact current values where discoverable:

- Width, height, padding, margin, gap, alignment, responsive breakpoints.
- Font family, size, weight, line height, letter spacing, truncation and wrapping.
- Light/dark background, surface opacity, foreground, border and accent colours.
- Gradient direction/stops, radii, shadow blur/offset/opacity, borders and transparency.
- Icon glyph, dimensions, stroke width, alignment and active/disabled state.
- Image box ratio, image fit, object position, placeholder/fallback, overlays and background.
- Animation direction, duration, easing, opacity, scale, controls, autoplay interval and interruption rules.
- Loading skeletons, empty states, pressed states, selection states and error feedback.

Do not invent “equivalent” tokens until you have extracted the website values. Avoid global redesigns and do not replace the current glass/light/dark language with standard Material cards.

## Source files to map to native equivalents

| Existing website component | Native screen/component responsibility |
|---|---|
| `Navbar.tsx` and logo components | Native header, search input/suggestions, theme toggle, existing menu and branding |
| `HeroCarousel.tsx` | Native carousel retaining composition, content order, controls and timings |
| `UnifiedAdSlot.tsx`, `SponsorBanner.tsx`, related ad components | Existing supported direct-ad treatment and configured placement |
| `HappeningTodaySlider.tsx` | Native horizontal list/card presentation and View All interaction |
| `CategoryFilter.tsx` | Native filter sections, chips, date selection and category search |
| `EventGrid.tsx` | Virtualized event cards, ad insertion, loading/empty states |
| `EventDetailsView.tsx` | Details hierarchy, tabs/sections, poster, CTA, share and related content |
| Static view components and `Footer.tsx` | Existing informational pages and footer/link destinations |

This mapping is an inspection list, not permission to reuse web JSX directly. Every native component must use React Native primitives (or Expo-compatible native packages).

## Current CSS token references found in `src/index.css`

Verify these in the actual checkout before using them. They are starting references, not permission to omit the rest of the CSS.

### Light theme

- Background: `#f4f7fb`
- Surface: `rgba(255, 255, 255, 0.72)`
- Surface 2: `rgba(255, 255, 255, 0.52)`
- Surface 3: `rgba(255, 255, 255, 0.82)`
- Outline: `rgba(255, 255, 255, 0.85)`
- Primary: `#ff6b00`
- Primary dim: `#d95a00`
- Primary subtle: `rgba(255, 107, 0, 0.12)`
- Text: `#0f172a`
- Muted text: `#64748b`
- Variant text: `#334155`
- On-primary: `#ffffff`

### Dark theme

- Background: `#1c1c1e`
- Surface: `rgba(44, 44, 46, 0.78)`
- Surface 2: `rgba(58, 58, 60, 0.72)`
- Surface 3: `rgba(72, 72, 74, 0.65)`
- Outline: `rgba(255, 255, 255, 0.10)`
- Primary: `#ffffff`
- Primary dim: `#e5e5ea`
- Primary subtle: `rgba(255, 255, 255, 0.10)`
- Text: `#f5f5f7`
- Muted text: `#aeaeb2`
- Variant text: `#8e8e93`
- On-primary: `#1c1c1e`

### Typography

The CSS token order starts with `Plus Jakarta Sans`, then fallback fonts. Determine which font files are actually shipped or fetched by the website and whether they may be bundled into the app. Use the closest lawful, actual available font, bundle it only if the repo has the correct licensed asset, and test its line metrics. Do not assume a web CSS font import will work in React Native.

### Existing mobile radii tokens noted in CSS

- xs: 8px
- sm: 12px
- md: 16px
- lg: 20px
- xl: 24px

Extract additional exact design values from component classes and CSS. The website's many glass-panel/card variants should not all be flattened into one generic style.

## Canonical mobile image-box references

The project's latest documented CSS box sizes are:

| Context | Mobile reference box | Aspect ratio (approx.) |
|---|---:|---:|
| Hero carousel | 366 × 229 px | 1.598:1 |
| Event Hub cards | 366 × 206 px | 1.777:1 |
| Happening Today cards | 335 × 189 px | 1.772:1 |
| Event details banner | 366 × 280 px | 1.307:1 |
| Event details modal | 366 × 260 px | 1.408:1 |

These values describe CSS reference boxes from current design documentation, not a universal physical-screen width or source-image dimensions. Verify responsive sizing against current CSS and a screenshot. Adapt width to the viewport; preserve the intended box ratio and full poster artwork, using contain/background space where the website does so. Do not crop or stretch a poster just to fill the frame.

Desktop reference boxes (useful for understanding the source design even though Expo Go is primarily phone-tested): hero 940×540; event cards 590×332; Happening Today 598×336; details banner 1024×520; details modal 896×380.

## Interaction parity

- Manual carousel swipe/drag and buttons work even with autoplay enabled.
- Manual interaction restarts the slide timer per current site rules.
- Event cards open the correct event, not a hardcoded/mock detail screen.
- Search suggestions use the current event matching behaviour and route to the selected event.
- Filters can be combined as the website permits and can be reset correctly.
- Show More respects the server-configured increment and doesn't duplicate items.
- Ad clicks open only the validated configured destination.
- Event details open and back navigation preserve sensible discovery/scroll state.
- Theme toggle changes all applicable screens and persists as expected.
- External registration preserves the current disclaimer and opens the external organizer URL.

## Screenshot comparison protocol

For each stage with UI:

1. Capture a reference website screenshot at the same viewport dimensions, theme, and representative content.
2. Capture a native screenshot from the physical phone or an available device preview.
3. Compare region layout, baseline/alignment, type scale, card dimensions, poster fit, visual effects, and visible content.
4. List the largest differences and fix them before adding unrelated polish.
5. Record platform-only differences separately.

A single screenshot of the homepage is not enough. Compare hero, Happening Today, filter/Event Hub, event details, dark theme, and loading/empty states.
