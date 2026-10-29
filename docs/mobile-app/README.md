# LPU Events Native Mobile App — Documentation Pack

**Purpose:** Give Antigravity a complete, repository-specific specification and one-task-at-a-time implementation process for building the LPU Events student website as a genuine Expo/React Native app.

## What is in this pack?

- `00_START_HERE.md` — execution rules and the exact starting instruction.
- `PROJECT_CONTEXT.md` — product scope and explicit exclusions.
- `WORKSPACE_AND_BOUNDARIES.md` — how to work safely inside the user's existing `lpu1` workspace.
- `REPOSITORY_REFERENCE.md` — inspected student website files, existing behaviour, and known engineering details.
- `UI_PARITY_SPEC.md` — visual replication requirements and the mobile website reference dimensions.
- `APP_ARCHITECTURE.md` — proposed native architecture and project structure.
- `API_DATA_CONTRACTS.md` — existing public endpoints, snapshot approach, payloads, filters, and integration constraints.
- `PERFORMANCE_REQUIREMENTS.md` — startup, list, image, caching, networking, and performance acceptance requirements.
- `ASSETS_AND_ANIMATION.md` — real logo/artwork reuse and full logo-animation handoff requirements.
- `EXPO_GO_DEVELOPMENT.md` — Expo Go setup without Android Studio.
- `SECURITY_AND_PRIVACY.md` — boundaries for public data, external links, credentials, analytics, and excluded features.
- `TESTING_AND_ACCEPTANCE.md` — test strategy and release-quality gates.
- `IMPLEMENTATION_ROADMAP.md` — task dependencies and completion order.
- `DECISIONS_AND_OPEN_QUESTIONS.md` — decisions already established and items that must be inspected rather than guessed.
- `IMPLEMENTATION_STATUS_TEMPLATE.md` and `VERIFICATION_CHECKLIST_TEMPLATE.md` — living project trackers.
- `tasks/` — one standalone prompt for each implementation stage.

## Install this pack into the workspace

1. Open the existing `lpu1` workspace in Antigravity.
2. Extract this ZIP into the **`lpu1/` workspace root**, not into `lpu-events-student/`.
3. The ZIP creates `lpu-events-app/` as a sibling next to `lpu-events-student/` and `lpu-events-admin/`. The app code will live directly in `lpu-events-app/`; do not create another nested `mobile/` directory.
4. Open `lpu-events-app/docs/mobile-app/00_START_HERE.md` and copy the prompt in its **Initial Antigravity Prompt** section into Antigravity.
5. Antigravity should complete **Task 00 only**. That task audits and reconciles documentation, and must not create app code or install packages.
6. After reviewing the report, provide only `lpu-events-app/docs/mobile-app/tasks/T01_EXPO_FOUNDATION.md`. Continue one task at a time.

## Important

This pack is a specification and workflow, not an already-created or tested app. Do not treat acceptance criteria as test results. The actual repository checkout is the source of truth if it differs from these notes. Antigravity must verify source code, file paths, assets, dependency state, and current official Expo compatibility before implementation.
