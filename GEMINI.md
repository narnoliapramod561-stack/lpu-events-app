# Mobile Application Guidelines (`lpu-events-app`)

## Stack & Target Environment
- **Runtime & Framework**: Expo SDK 58, React 19, React Native 0.88, Expo Router 58.
- **Target OS**: Android (Primary / First-Class), iOS.
- **Data Source**: Pre-rendered Cloudflare R2 snapshots with local AsyncStorage persistence.

---

## Tooling & MCP Protocols
- **Route & Component Navigation**: Use `codebase-memory` (`search_graph`, `trace_path`) for Expo Router file structure (`app/`), shared components, and client state.
- **API Documentation**: Use `context7` for Expo SDK 58 modules, React Native 0.88 primitives, and Expo Router navigation hooks.
- **Verification**: Run `npm run typecheck` (`tsc --noEmit`) in this subfolder after edits.

---

## Critical Architecture Guardrails
1. **Edge-First Offline-Ready Data Pattern**:
   - The app must read public events via R2 snapshots (`packages/shared/src/snapshotClient.ts`), hydrated and cached into AsyncStorage.
   - Do NOT query Supabase directly for public event feeds or details.
2. **Android-First Rendering Performance**:
   - Use virtualized list components for long lists; avoid unmemoized callbacks or inline objects in list items.
   - Guard against heavy runtime blurs and unoptimized SVGs that degrade frame rates on mid-range Android devices.
3. **Execution Speed**:
   - Surgical edits only. Zero boilerplate conversation or post-edit summaries.

