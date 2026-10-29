# Project Context — LPU Events Mobile App

## Goal

Build a native mobile client for LPU Events, whose existing student website is the visual and functional source of truth. Match the site's current mobile presentation as closely as practical while translating browser UI to React Native-native controls.

Repository reference: `https://github.com/narnoliapramod561-stack/lpu-events-student`

## Product scope

LPU Events is primarily a public event-discovery product. The student website is publicly accessible. The app should allow the same discovery and details flows and redirect users to external registration destinations when provided by an organizer.

The app does not own ticket booking, payments, ticket generation, reservations, refunds, or ticket verification.

## Features to preserve where they currently exist

- LPU Events logo and complete intro animation.
- Header/navigation and search with suggestions.
- Existing light/dark theme behaviour.
- Hero carousel with manual controls and autoplay behaviour.
- Super Admin-managed carousel content and direct advertisements.
- Happening Today slider and its existing View All flow.
- Event Hub and its current card presentation.
- Category/subcategory, schedule/date, free/paid, trending, and search filters actually implemented by the current site.
- Existing ad insertion/placement settings and ad click destinations that can legitimately be supported on native.
- Show More/incremental loading and past-event browsing where the current website exposes it.
- Event details, poster, date/time/venue, organizer, content sections, related events where present, sharing, and external registration disclaimer/link.
- Existing About Us, Contact Us, Privacy Policy, Terms of Service, footer links, announcement/maintenance/loading/empty/error states.

The current checkout must be inspected before treating this list as exhaustive. If functionality has changed, document the discrepancy and follow the current website unless a newer canonical project decision clearly overrides it.

## Explicit exclusions

Do not invent or add:

- Student account/login/signup/authentication/profile.
- Favorites, saved events, student-specific history, or personal dashboards.
- Push notifications or an in-app notification center.
- Internal registration or ticket booking.
- Payment, refunds, ticket wallet, QR attendance verification, or reservations.
- Admin/organizer/Super Admin features.
- New product modules, bottom tabs, onboarding flow, or monetization products that are not in the website.
- New database tables, backend services, or public endpoints without separately approved need.

## Visual fidelity rule

The existing website's actual code/assets/screenshots are the reference. Generic event-app patterns, invented visual elements, and replacement stock images are not acceptable substitutes. Native adaptation is allowed only where a browser-specific element cannot operate on native, and such limitations must be documented—not silently disguised.

## Performance rule

Make the app feel fast through early first render, asynchronous cache reads, cached images, prefetching only high-value assets, request deduplication, responsive list virtualization, and minimal rerendering. Do not achieve a visually attractive splash screen by hiding usable content behind a fixed delay.

## Primary working mode

Use Expo Go on a physical phone as the development feedback loop. No Android Studio or local Android emulator/SDK setup is required. Verify current Expo Go/SDK compatibility at implementation time. A future standalone EAS build is a separate delivery consideration; it is not a reason to abandon the requested Expo Go workflow.
