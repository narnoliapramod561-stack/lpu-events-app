# Start Here — Strict One-Task-at-a-Time Contract

## Project objective

Create a proper React Native application with Expo for LPU Events. It must faithfully reproduce the **existing student website's mobile UI and currently supported student-facing functionality**, while using native controls, native navigation, native scrolling, and native image loading. A WebView wrapper is expressly forbidden.

## The most important operating rule

**Do not execute the whole roadmap in one run. Complete only the one task explicitly requested by the user.**

- A task is not permission to implement later tasks.
- At the end of a task, run its checks, update status/checklist documents, report real results, and stop.
- Do not begin the next task unless the user explicitly provides its task prompt or asks to continue with that task.
- Do not create an enormous PR or replace large groups of files just to finish faster.
- When a task depends on unresolved information, inspect available sources, document the finding, and avoid guessing.
- A working Expo starter is not a finished app; a screenshot/mockup is not functional parity.

## Required reading order

Before editing any file, read:

1. `PROJECT_CONTEXT.md`
2. `WORKSPACE_AND_BOUNDARIES.md`
3. `REPOSITORY_REFERENCE.md`
4. `UI_PARITY_SPEC.md`
5. `APP_ARCHITECTURE.md`
6. `API_DATA_CONTRACTS.md`
7. `PERFORMANCE_REQUIREMENTS.md`
8. `ASSETS_AND_ANIMATION.md`
9. `EXPO_GO_DEVELOPMENT.md`
10. `SECURITY_AND_PRIVACY.md`
11. `TESTING_AND_ACCEPTANCE.md`
12. `IMPLEMENTATION_ROADMAP.md`
13. `DECISIONS_AND_OPEN_QUESTIONS.md`

Then read only the corresponding task file for the stage the user has requested.

## Initial Antigravity Prompt — copy this first

> You are working in my existing `lpu1` workspace. The dedicated mobile app project folder is `lpu-events-app/`, a sibling of `lpu-events-student/`, `lpu-events-admin/`, and `lpu-events/`. Read `lpu-events-app/docs/mobile-app/00_START_HERE.md` and all required context documents listed there.
>
> **Do Task 00 only:** inspect the current `lpu1` workspace and the actual `lpu-events-student` source repository in read-only mode, reconcile this handbook against the sources, and update documentation/status files only inside `lpu-events-app/docs/mobile-app/`. Do not create Expo app code, install packages, change the student website, edit workspace root configuration, or begin Task 01. Current source wins if earlier notes differ.
>
> **Project boundary:** all future native app code, assets, dependencies, Expo configuration, lockfiles, tests, and app-specific docs must live inside `lpu-events-app/`. This folder itself will be the Expo project root. Do not put app code under `lpu-events-student/` and do not create a second nested `mobile/` directory. The `lpu-events-student/` repository is a read-only product/design/API reference for this task and all app tasks unless the owner explicitly authorizes a source change.
>
> Respect all other workspace boundaries. Do not modify `lpu-events`, `lpu-events-admin`, `packages`, `supabase`, or root-level configuration. Read sibling folders only when necessary and do so read-only. Check repository agent instructions and `git status --short` before inspection; never overwrite existing user work.
>
> Validate every repository-specific assertion you can verify, note what you could not verify, resolve path discrepancies, and record exact source paths. Update the supplied tracker templates into `IMPLEMENTATION_STATUS.md` and `VERIFICATION_CHECKLIST.md` inside `lpu-events-app/docs/mobile-app/` if those living files do not already exist. Do not overwrite useful existing documentation without review.
>
> At the end, report (1) files reviewed, (2) documentation files created/updated, (3) verified facts versus assumptions, (4) risks/blockers, (5) commands actually run, and (6) explicit confirmation that no app source code, website code, package files, or root configuration was changed. Then STOP and wait for me to request Task 01.

## How to advance

When Task 00 is accepted, provide only `tasks/T01_EXPO_FOUNDATION.md` as the next prompt. For every later step, provide exactly one matching task file. The task file itself repeats the stop rule.

## Status meanings

Use only these labels in the living tracker:

- `NOT STARTED`
- `IN PROGRESS`
- `BLOCKED`
- `IMPLEMENTED — NOT VERIFIED`
- `VERIFIED`

Never label a task `VERIFIED` unless its stated checks were actually run and passed. Record physical-phone checks separately from checks the agent can run locally.
