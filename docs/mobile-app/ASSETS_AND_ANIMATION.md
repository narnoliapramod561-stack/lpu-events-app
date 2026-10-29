# Assets, Poster Treatment, Logo, and Launch Animation

## Find genuine assets before recreating anything

Inspect the current student repository's `public/`, relevant SVG/image files, and the actual logo source in `index.html`, `src/components/LpuLogo.tsx`, `src/components/LpuEventsLogo.tsx`, and other references. Inspect actual variants with file listings and, if useful, image dimensions. Do not assume a requested `_mobile`, `_tablet`, or `_desktop` file exists just because a helper function constructs that URL.

Copy only assets genuinely needed by the native app into `lpu-events-app/assets/`. Keep source website assets untouched. Where remote event images should remain dynamic, reuse the current production URLs and cache them through the native image loader.

For SVG artwork, inspect whether it depends on CSS animations, filters, masks or browser-only features. Use an Expo Go-compatible solution such as a suitable `react-native-svg` implementation or a faithful native animation of the extracted logo parts. Verify the final result on a phone.

## Full logo animation

The referenced `docs/performance/PHASE-0-STARTUP.md` says the web `index.html` includes an inline startup shell and coordinator, with a `MIN_VISUAL_MS` value of 950 ms and a logo FLIP transition of 0.75 s. These timings are existing web behaviour that was investigated because it delayed useful content. Verify current code before relying on the details.

Mobile requirement:

1. Identify the exact logo art, sequence, easing, scaling/position transitions, sheen/opacity details and final end state from actual source.
2. Reproduce the whole intended animation, not a simplified spinner or an arbitrary fade of a static logo.
3. Begin at the earliest practical native render frame.
4. Run data loading concurrently with the animation.
5. Do not force a minimum full-screen visual duration if content is ready earlier unless source/product behaviour genuinely requires it and it has been explicitly approved.
6. Never block content awaiting network data just to finish the animation.
7. Avoid an artificial second delay after both animation and useful content are ready.
8. Test interrupted app state, warm launch, cold launch, slow network and no network. Avoid leaving the splash/overlay stuck.
9. Keep any OS-managed launch screen simple and compatible with Expo Go. The animated portion belongs to the native app UI because Expo Go may not reproduce the final standalone app's OS splash exactly.

Official reference: https://docs.expo.dev/versions/latest/sdk/splash-screen/

## Poster fit and image boxes

Follow the source component's actual CSS treatment. Existing project reference dimensions are recorded in `UI_PARITY_SPEC.md`. Use `contain` for posters where the complete poster must remain visible. Use `cover` only where the website intentionally crops a photographic background to fill the box. Never stretch an image.

If the website's source logic tries a responsive suffix, prove that resource exists before using that URL. If no appropriate variant exists, request the real base asset or use a valid generated/served variant only when the existing image pipeline supports it. Do not clone the current known 404-then-fallback problem into native.

## Animation libraries

First determine which mechanisms the website actually uses. Framer Motion web components cannot be imported as DOM views in React Native. Choose a native-compatible approach that Expo Go supports at the selected SDK, and use the smallest dependency set that can reproduce the observed animation. Do not add Lottie, Reanimated, Skia, or native modules by default if the chosen effect can be implemented with existing compatible primitives.

## Licensing and configuration

Do not add web font files, logo assets, or external imagery without confirming they are already project assets or are licensed for bundling. Do not put API credentials, private CDN tokens, telemetry secrets, or admin environment values in `lpu-events-app/assets/` or app configuration.
