# 0021. Real Authentication Replaces the Simulated Sign-In Flow

**Status:** Accepted
**Date:** 2026-06-28
**Related:** docs/10-authentication.md, ADR-0004, ADR-0009, ADR-0020

## Context

ADR-0009 chose Supabase Auth and built the supporting infrastructure (`AuthProvider`, `useAuth`, `RequireAuth`) early, but deliberately left sign-in/sign-up simulated — `RequireAuth` was built but not applied to any route, since a real guard with no real session would only bounce every visit back to `/login`. With Supabase now the repository backend (ADR-0020), every deck/card operation is RLS-scoped to a real authenticated user, so a real session is no longer optional infrastructure — it's required for the app to do anything.

## Problem

How should sign-in, sign-up, and sign-out be implemented, and how should routes that need a session now enforce that?

## Alternatives Considered

- **Keep `LoginForm` accepting an `onSubmit` callback prop**, with `LoginPage` calling Supabase and passing the result down — was the original placeholder shape. Every other form in the app (`DeckFormDialog`, `CardFormDialog`) already owns its own mutation and error/pending state internally rather than taking a callback; keeping `LoginForm` as the one exception would be an inconsistency with no benefit, since `LoginForm` is only ever used in one place.
- **Show Supabase's raw error message text on failure** — simplest, but leaks English-only, sometimes technical text into a UI that's otherwise fully translated (ADR-0016), undermining "no hardcoded strings" for the sake of saving one mapping step.

## Decision

`LoginForm` and the new `SignUpForm` are fully self-contained: each calls its own mutation (`useSignIn`/`useSignUp`, built on a new `authApi` in `features/auth/api`), owns its pending/error state, and redirects on success. `RequireAuth` is now applied to every route under `AppLayout` (`/`, `/decks`, `/decks/:deckId`, `/settings`); a new, symmetric `RedirectIfAuthenticated` guard wraps `/login` and `/signup` so an already-signed-in user visiting either lands back on the app instead of seeing a sign-in form again.

Sign-up handles both Supabase configurations rather than assuming one: if the project has email confirmation disabled, `signUp` returns a session immediately and the form redirects like sign-in; if confirmation is required, it returns no session and the form shows a "check your email" message instead. Error messages are mapped to translated strings rather than shown raw — `Invalid login credentials` (Supabase's stable, well-known message for bad credentials) gets a specific translated message; anything else falls back to a generic translated "couldn't sign in/up" message rather than guessing at every possible Supabase error string.

`useSignOut` clears the entire TanStack Query cache on success. Without this, signing out and a different user signing in on the same browser tab (no page reload in between) could briefly show the first user's cached decks/cards before queries refetch — RLS guarantees the refetched data is correct, but the stale flash isn't, and clearing the cache is cheaper than reasoning about which queries might leak data across identities.

A `SignOutButton` (features/auth/components) plus a sidebar footer showing `auth.signedInAs` (the signed-in user's email) were added to `app/layout/Sidebar.tsx` and `MobileDrawer.tsx` — there was previously no way to sign out of the app at all.

## Consequences

**Positive:**

- Every form in the app now follows the same shape (owns its mutation, error, and pending state) — no special-cased callback-prop pattern for login specifically.
- The app correctly handles either email-confirmation setting without needing to know in advance which one the connected Supabase project uses.
- No stale cross-user data flash on sign-out/sign-in within the same tab.

**Negative / risks:**

- Error-message mapping only special-cases one Supabase error string (`Invalid login credentials`); other failure modes (rate limiting, network errors, weak-password rejection on sign-up) all collapse to a generic message. Acceptable for now — revisit if real usage shows users need more specific guidance for a particular failure mode.
