# Task 01 — Isolated Expo Foundation

**Do only Task 01. Do not implement the UI, API layer, or later tasks. Stop at the end.**

## Preconditions

Task 00 has been reviewed/accepted. Read the master docs and check `IMPLEMENTATION_STATUS.md`. Review `git status --short`; do not overwrite user work.

## Goal

Create a minimal, valid Expo/React Native app directly in the root of `lpu-events-app/`, which is a sibling of `lpu-events-student/`. It must open in Expo Go on a physical phone without Android Studio or Android SDK/emulator setup. Leave the existing student website unchanged.

## Steps

1. Confirm the current working directory is `lpu-events-app/`. Inspect every existing file. The `docs/` folder is expected and must remain intact. Do not create a nested `mobile/` directory.
2. Check official Expo create-app, SDK, Router and Expo Go compatibility documentation. Select a template/version actually compatible with the installed Expo Go on the target phone. Do not assume today's latest SDK works in Expo Go.
3. Follow workspace instructions on package managers and Git boundaries. All Expo dependencies must be isolated in `lpu-events-app/package.json` and its single lockfile; never install them into `lpu-events-student/`.
4. Create the smallest Expo project with a route/screen and TypeScript configuration. Because `lpu-events-app/` already contains the handbook in `docs/`, first determine whether the official scaffolder supports adding a project to this non-empty directory. If it refuses, create the scaffold in a clearly named temporary sibling directory, inspect the generated files, then selectively merge the scaffold into `lpu-events-app/`, preserving `docs/` and all existing user files. Remove the temporary scaffold only after verifying successful merge. Do not put the app under another subdirectory.
5. Keep the first screen minimal: app identity, simple proof-of-life state, no fabricated event catalogue, no generic redesign.
6. Add only dependencies required for the starter. Do not install every package mentioned elsewhere in the handbook yet.
7. Add only app scaffold files inside `lpu-events-app/`. Do not edit `lpu-events-student/` package/lock/config or any sibling workspace project.
8. Run supported validation (`npx expo-doctor` if applicable, and TypeScript check if configured). Start `npx expo start`, open QR in Expo Go, and verify a physical-phone render where the agent can access that workflow. Never claim physical-phone verification if it was not performed.
9. Review the diff for repository boundary violations; update status/checklist docs.

## Acceptance criteria

- Expo app starts with a supported SDK and opens in Expo Go on the target phone (or the precise physical-device blocker is documented honestly).
- No Android Studio, emulator, SDK installation or local native compilation required.
- App project dependencies are isolated in `lpu-events-app/`, separate from the website.
- No web UI, API, placeholder event cards or later features have been implemented.
- Existing website source/config remains unchanged.

## Report and stop

List files created, commands/tests and results, SDK/Expo Go compatibility decision with official link, physical-phone verification status, and website-isolation check. Update living trackers. **Do not begin Task 02.**
