# Task 07 — Remaining Website Pages and Cross-Screen States

**Do only Task 07. Do not start the app-wide performance audit or final release assessment. Stop when in-scope pages/states are implemented.**

## Preconditions

Tasks 00–06 accepted. Inspect the current static page components, footer links, announcement/maintenance components and any navigation state in the website.

## Goal

Complete the remaining existing student website functions without broadening the product.

## Scope

- About Us.
- Contact Us.
- Privacy Policy.
- Terms of Service.
- Footer destinations/links relevant to the existing site.
- Theme persistence across routes.
- Campus announcement/dismiss behaviour where present.
- Maintenance/warming, loading, empty, missing event, and recoverable error states.
- Ad/registration link failure feedback where still outstanding.

## Steps

1. Port exact existing copy/content/links from the current source. Do not invent text, company details or contact addresses.
2. Use a common native screen layout where it preserves parity; avoid duplicating page-shell logic.
3. Ensure each link has working behaviour and safe external opening where applicable.
4. Ensure theme changes apply consistently to every completed screen.
5. Verify network/maintenance errors do not strand the user; preserve useful cached content and allow retry where appropriate.
6. Confirm no student login/profile/notification center has been added.

## Acceptance criteria

- All remaining in-scope source pages have native counterparts.
- Footer and navigation destinations work.
- Loading/empty/maintenance/error states are usable and visually consistent.
- No new product capability introduced.

Update the trackers, note what needs physical-phone verification, and **stop before Task 08**.
