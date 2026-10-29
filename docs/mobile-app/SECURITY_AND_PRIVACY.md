# Security, Privacy, and Scope Boundaries

## Public data and authentication

The student surface is public. Do not add student login, signup, passwords, OTP, Google Sign-In, profile/account screens, or any authentication dependency for browsing public event data. Admin authentication is out of scope; do not connect the native app to admin APIs.

## API and credentials

- Use the existing public API/immutable public-content resources.
- Never include service-role keys, database passwords, private API credentials, admin tokens, or secrets in the native bundle.
- Public client configuration must be limited to intentionally public values and documented as such.
- Do not copy `.env.production` contents or other secret files into `lpu-events-app/` or its docs.
- Do not add new backend endpoints/database tables as a workaround for a client-side issue.
- Do not alter server authorization, caching, or content publication rules in this mobile project.

## External URLs

For ad redirects, contact links and organizer registration:

- Validate and normalize the URL.
- Support only schemes required by current functionality (`https`/`http`, and `mailto`/`tel` when relevant).
- Reject unsafe or unknown schemes and protocol-relative URLs.
- Show clear UI feedback if `Linking.openURL` fails.
- Keep user awareness of external registration. LPU Events does not process the booking/payment and must not claim that it does.

## Tracking and telemetry

The website includes browser-oriented Sentry, PostHog and Clarity integrations. Do not import these browser SDKs into the native app. Do not create new analytics projects, credentials, data collection events, or consent behaviours without inspecting current policy/configuration and recording the need. If mobile telemetry is not needed for a task, leave it out; it is not a pretext to expand the product.

## Advertisements

Preserve the existing admin-managed direct advertisement content and placement rules wherever the native app can support them. Web AdSense placements may not be portable as-is. Do not silently replace them with AdMob, new tracking, affiliate ads, or fabricated content. Document the exact incompatibility and leave a decision for the owner if a true native ad integration would be a new product/monetization decision.

## Permissions and data minimization

Do not request location, contacts, camera, microphone, photo-library, notification or other device permissions without a currently existing, required use case. No permissions are assumed necessary for public event discovery. Do not add push notifications.
