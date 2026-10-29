# Task 00 — Workspace Audit and Documentation Reconciliation

**Do this task alone. Stop when complete. Do not create app code or install dependencies.**

## Goal

Validate the supplied handbook against the user's actual `lpu1/` workspace and the current `lpu-events-student/` repository. The app project root is the sibling folder `lpu-events-app/`; the website is a read-only reference.

## Steps

1. Confirm the workspace root and verify `lpu-events-app/` is a sibling of `lpu-events-student/`, not inside it. Confirm this handbook is located at `lpu-events-app/docs/mobile-app/`.
2. Read applicable workspace/agent instructions in `lpu1/` and relevant source-repository instructions read-only. Identify package-manager and Git conventions without modifying them.
3. Inspect `git status --short` in `lpu-events-student/` and other relevant Git roots. Do not write to or reset any source repository. Record any pre-existing changes that could affect verification.
4. Inspect the current contents of `lpu-events-app/` and its `docs/mobile-app/` folder. Preserve all existing files. Do not initialize Expo or overwrite any file.
5. Verify the source paths and behaviour in `REPOSITORY_REFERENCE.md`, especially homepage, theme, logo/launch source, carousel, filters, event hub, event details, client, snapshot types/client, images, settings and search logic.
6. Review the actual source mobile layout and the documented image-box dimensions. Identify design tokens, assets, logo animation dependencies and known UI implementation constraints.
7. Review the current workspace boundaries. The folders `lpu-events/`, `lpu-events-admin/`, `packages/`, `supabase/`, and all other siblings must not be modified.
8. Check official Expo documentation and the actual Expo Go compatibility path referenced in `EXPO_GO_DEVELOPMENT.md`. Record the current recommendation; do not create the app yet.
9. Verify existing public endpoint names, response shapes, current public-content snapshot contracts, and whether the snapshot manifest is reachable if a request is available. Clearly distinguish code inspection from live verification.
10. Reconcile documentation assertions and open questions. Create `IMPLEMENTATION_STATUS.md` and `VERIFICATION_CHECKLIST.md` from the supplied templates only when absent, merging carefully if they already exist.
11. Review changes and prove that only documentation/status files inside `lpu-events-app/docs/mobile-app/` were changed.

## Allowed changes

Only documentation/status files under `lpu-events-app/docs/mobile-app/`.

## Not allowed

- No `create-expo-app` command.
- No dependency installs.
- No app source code, assets, package files, lockfiles or Expo configuration.
- No edits to `lpu-events-student/`, any other sibling repository, database, root config or deployment settings.
- No commits, pushes, or deployments.
- No implementation of Tasks 01+.

## Acceptance criteria

- The sibling-folder boundary is confirmed and the target path is `lpu-events-app/`.
- Source facts are checked against the current read-only website checkout.
- Verified findings are separated from assumptions and unresolved items.
- Living status/checklist files are created or reconciled.
- All writes remain inside `lpu-events-app/docs/mobile-app/`.
- The report confirms that no app or website source code changed.

At the end, **STOP and wait for the user to request Task 01**.
