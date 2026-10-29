# Ordered Implementation Roadmap

**Execution policy: one task per Antigravity instruction. Stop after each task.** The tasks are intentionally split so UI, backend, performance, and navigation errors are found early rather than hidden inside a large one-shot implementation.

| Task | Task file | Scope | Must not include | Exit condition |
|---|---|---|---|---|
| 00 | `tasks/T00_REPOSITORY_AUDIT_AND_DOCS.md` | Audit current workspace/source; reconcile docs and trackers | Any application code, dependency install, website edit | Facts/path/risks documented; stop |
| 01 | `tasks/T01_EXPO_FOUNDATION.md` | Create isolated Expo project and prove Expo Go connection | Product UI beyond minimal starter/health screen | Starter opens on physical phone; website intact |
| 02 | `tasks/T02_DESIGN_SYSTEM_AND_LOGO.md` | Website-derived tokens, shared native primitives, complete logo animation | Homepage/event features | Theme tokens and launch sequence pass parity checks |
| 03 | `tasks/T03_NATIVE_API_AND_CACHE.md` | Typed API adapter, native cache, timeout/error/dedup | Full UI flows or new backend | Real public homepage/feed/detail data verified |
| 04 | `tasks/T04_HOME_AND_CAROUSELS.md` | Header, search entry point, hero, ads, Happening Today | Full filters/details/static pages | Homepage parity and interaction checks pass |
| 05 | `tasks/T05_SEARCH_FILTERS_EVENT_HUB.md` | Search/filter/event feed/pagination | Event details/static page expansion | Discovery functions use real data and stay responsive |
| 06 | `tasks/T06_EVENT_DETAILS.md` | Native details screen and external registration | Internal ticket/payment/account feature | Real event detail & external URL flow works |
| 07 | `tasks/T07_REMAINING_PAGES_AND_STATES.md` | About/Contact/Privacy/Terms/footer and states | Features absent from current website | Remaining in-scope website functions mapped |
| 08 | `tasks/T08_PARITY_PERFORMANCE_AUDIT.md` | Screenshot and performance QA; fix verified regressions | New feature development | QA matrix completed, discrepancies recorded/fixed |
| 09 | `tasks/T09_FINAL_VERIFICATION.md` | Final verification report, documentation and readiness assessment | Store submission/deployment unless asked | Truthful completion report with remaining manual checks |

## Dependencies

- Task 01 depends on Task 00 being reviewed/accepted.
- Task 02 depends on Task 01.
- Task 03 depends on Tasks 00–01 and can be implemented in parallel with design planning only if the user explicitly asks; otherwise stay sequential.
- Task 04 depends on Tasks 02–03.
- Task 05 depends on Tasks 02–04.
- Task 06 depends on Tasks 02–03 and native navigation; in the default sequential plan it follows Task 05.
- Task 07 depends on the design system and navigation.
- Task 08 depends on all feature tasks.
- Task 09 depends on Task 08.

## What if a task fails?

Do not continue merely because the task has a prompt. Identify the root cause, fix it within the current task boundary, rerun checks, document any blocker, and stop. If the task cannot be completed without a product decision or a change outside the permitted folder, explain the decision and wait.
