# 0019. Route-Based Code Splitting and a Reviewed Chunk-Size Threshold

**Status:** Accepted
**Date:** 2026-06-28
**Related:** docs/05-tech-stack.md, ADR-0001, ADR-0016

## Context

Preparing for Vercel deployment surfaced Vite's default production build warning: the app's entire route tree was bundled into a single ~770kB (raw, minified) chunk, past Vite's 500kB default `chunkSizeWarningLimit`. The goal is a clean `npm run build` (no warnings) without over-optimizing — i.e. without restructuring things that aren't actually broken.

## Problem

How should the bundle be organized to minimize what loads before a page can render, and how should genuinely necessary remaining weight be handled?

## Alternatives Considered

- **Leave one eager bundle and just raise/silence the warning threshold without changing anything** — fastest, but leaves real, fixable waste in the critical path: every page's form code (react-hook-form + Zod) was loading on first paint regardless of which page a user actually opened, and Zod was being pulled in just to validate two non-empty environment-variable strings in `env.ts`.
- **Hand-configure `rollupOptions.output.manualChunks` to split vendor groups** — gives fine-grained control, but needs ongoing maintenance as dependencies change, and duplicates what splitting at the route boundary already achieves more naturally (users navigate through routes, not through arbitrary vendor groupings).
- **Replace `@supabase/supabase-js` with a lighter client, or defer i18next/auth initialization** — would shrink the eager bundle further, but each is a real architectural change (reopening ADR-0001's backend choice, or how/when auth state becomes available) for a marginal gain — exactly the over-optimization this pass was asked to avoid.

## Decision

We will lazy-load every route's page component via React Router's `lazy` route field (`{ path, lazy: () => import('./Page').then(m => ({ Component: m.Page })) }`), not a manual `React.lazy`/`Suspense` wrapper. Separately, `env.ts`'s two-field environment check no longer uses Zod — replaced with a plain `readEnvVar` check — since Zod's only other use (Login/Deck/Card form validation) is already isolated behind those same lazy route boundaries and doesn't need to load before any form is opened. The remaining eager bundle (~650kB raw / ~194kB gzip) is `react-dom` + `react-router` + `@supabase/supabase-js`'s bundled sub-clients (auth/realtime/storage/postgrest) + i18next + TanStack Query + the mobile nav drawer's Radix Dialog dependency tree — all loaded by design, since auth state, the i18n instance, and the server-state cache must exist before any page renders. `build.chunkSizeWarningLimit` is raised from Vite's 500kB default to 700kB to reflect this reviewed baseline.

## Consequences

**Positive:**

- Forms (react-hook-form + Zod, ~28kB gzip) and each page's own feature code now load only when a user visits a route that actually needs them, not on every visit to the app.
- Removing Zod from `env.ts` shrank the eager bundle for zero behavior change — the same fail-fast validation, without a ~25kB dependency to perform two string checks.
- The chunk-size warning now reflects a deliberately reviewed number; a future change that meaningfully grows the _eager_ bundle still triggers it.

**Negative / risks:**

- This is "fix what's eager, accept what's structurally necessary," not "chase the warning to zero." Appropriate at this app's current size; worth re-auditing if a new always-on global feature (e.g. real-time sync) substantially grows the eager bundle again.
