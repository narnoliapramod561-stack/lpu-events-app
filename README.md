# LPU Events App — Dedicated Native App Project Folder

This folder is the standalone project root for the LPU Events native mobile app.

## Workspace placement

Extract this ZIP into the root of your existing `lpu1` workspace. It will create:

```text
lpu1/
├── lpu-events-student/   # existing website; reference only, leave unchanged
├── lpu-events-admin/     # existing admin site; leave unchanged
└── lpu-events-app/       # all native app code will live here
```

**Do not extract this folder inside `lpu-events-student/`.** All Expo files, native UI, components, API/cache implementation, assets, dependencies, configuration, tests and app documentation must stay in `lpu-events-app/` itself. The folder root is the Expo project root; do not create another nested `mobile/` folder.

## Start correctly

1. Open `lpu1` in Antigravity.
2. Open `lpu-events-app/docs/mobile-app/00_START_HERE.md`.
3. Copy and run the `Initial Antigravity Prompt` section. This runs **Task 00 only**: inspect/reconcile docs and workspace; do not create application code yet.
4. After reviewing Task 00, give Antigravity only `lpu-events-app/docs/mobile-app/tasks/T01_EXPO_FOUNDATION.md`.
5. Continue one task at a time. Task 01 provides the minimal Expo Router foundation; each task must be tested and reported before proceeding.

## Important

The current website is a read-only visual, product and public-API reference; do not modify its source or configuration.

## Development Commands

For complete instructions on running and testing the app with Expo Go on a physical phone, see [docs/mobile-app/LOCAL_DEVELOPMENT.md](docs/mobile-app/LOCAL_DEVELOPMENT.md).

```bash
cd lpu-events-app && npx expo start
```
