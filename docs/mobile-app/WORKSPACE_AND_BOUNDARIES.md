# Workspace Layout and Repository Safety

## Actual workspace layout

The user's `lpu1/` workspace contains (among other entries):

- `lpu-events/`
- `lpu-events-admin/`
- `lpu-events-student/` — **read-only source of truth for the current student website UI and behaviour**
- `lpu-events-app/` — **the dedicated native app project folder created by extracting this documentation ZIP**
- `packages/`, `supabase/`, and other tooling/configuration folders

This reflects the user's supplied workspace screenshot. Always verify the current filesystem before writing.

## Canonical boundary decision

**All app code must live inside `lpu1/lpu-events-app/`.** This folder is the Expo project root. Do not place app code inside `lpu-events-student/`, and do not create a nested `lpu-events-app/mobile/` folder.

The native app folder will contain:

- `app/` — Expo Router routes and layouts, if Expo Router is selected
- `src/` — native components, API client, cache, state and utilities
- `assets/` — app-required local assets
- `app.json` / applicable Expo configuration
- `package.json` and one appropriate lockfile
- `docs/mobile-app/` — the master plan, source references, per-task prompts and living verification trackers
- tests and other project configuration as required

The existing student website is a neighbouring project and reference, not the app's parent project.

## Rules

1. Keep all native app code, assets, configuration, dependencies, lockfiles, tests and app-specific docs inside `lpu-events-app/`.
2. Treat `lpu-events-student/` as read-only. Inspect its files and run its build only when appropriate, but do not edit its source, package files, lockfiles, Vite configuration, assets, deployment configuration or documentation as part of app work.
3. Do not edit `lpu-events/`, `lpu-events-admin/`, workspace-level `packages/`, `supabase/`, or root-level security/deployment files unless the user explicitly authorizes a specific change.
4. Before every task, inspect `pwd`, current workspace structure, applicable agent instructions, and `git status --short` for every relevant Git repository. Preserve pre-existing changes.
5. Do not initialize a nested Git repository in `lpu-events-app/` or commit/push/deploy unless explicitly authorized. If the user later asks to version this project, clarify/review the workspace's Git setup first.
6. Do not copy `.env.production`, service-role credentials, admin credentials, secrets, or private environment values from the website into the app.
7. If scaffold tooling refuses to initialize because `lpu-events-app/` already contains docs, create a temporary scaffold in a clearly named temporary directory, then selectively merge app scaffold files into `lpu-events-app/` without overwriting `docs/` or any existing user files. Remove the temporary directory only after confirming the merge succeeded and it contains no user work.
8. Do not generate mixed package managers or multiple lockfiles. Select one package manager based on actual project instructions and official Expo guidance.
9. The ZIP is extracted into the `lpu1/` workspace root, so `lpu-events-app/` appears as a sibling of the existing website/admin repositories.

## Target tree

```text
lpu1/
├── lpu-events/                 # leave unchanged
├── lpu-events-admin/           # leave unchanged
├── lpu-events-student/         # read-only website reference
│   ├── src/
│   ├── public/
│   └── package.json
├── lpu-events-app/             # ALL native app code lives here
│   ├── app/
│   ├── src/
│   ├── assets/
│   ├── docs/
│   │   └── mobile-app/
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
├── packages/                   # inspect read-only only if needed
└── supabase/                   # do not modify
```

The diagram shows the intended final structure, not files that already exist. Create only what's needed for the currently requested task.

## Before every code task

- Confirm the working directory is `lpu-events-app/`.
- Check any existing `lpu-events-app/` files and preserve all user changes.
- Inspect the source website only as a reference.
- Keep all writes under `lpu-events-app/` unless an explicit owner-approved exception exists.
- At the end, inspect changed files and prove no unapproved sibling-project files were modified.
