# Authentication Strategy

## Mechanism

**Decision:** Supabase Auth, email + password for the MVP, issuing standard JWTs.
**Why:** It's already part of the chosen backend (see [Tech Stack](05-tech-stack.md)) — no separate auth service to run, and it integrates directly with Row Level Security via `auth.uid()` (see [Database Design](07-database-design.md)). Email/password is the lowest-friction option to build first; it doesn't preclude adding OAuth later (see below).

`supabase-js` handles token storage and silent refresh in the browser — the app does not implement its own token-refresh logic.

## What ships in the MVP

- Sign up (email + password) — creates an `auth.users` row; a Postgres trigger creates the matching `profiles` row (see [Database Design](07-database-design.md)). **Built** (ADR-0021): `SignUpForm` handles both possible outcomes of `supabase.auth.signUp` — an immediate session if the connected project has email confirmation disabled, or a "check your email" message if it's required, since the app doesn't assume either setting.
- Sign in / sign out. **Built**: `LoginForm` calls `signInWithPassword`; a `SignOutButton` in the sidebar calls `signOut` and clears the query cache (see ADR-0021).
- Automatic session persistence and restoration on reopen. **Built**: `AuthProvider` (src/app/providers) reads the existing session via `supabase.auth.getSession()` on mount and stays in sync via `onAuthStateChange` — this was infrastructure from day one (ADR-0009), just unused by any real sign-in until now.
- Automatic redirect to `/login` when signed out, and away from `/login`/`/signup` when already signed in. **Built**: `RequireAuth` and the symmetric `RedirectIfAuthenticated` (src/app/routes) are applied to every route.
- Password reset via emailed link (Supabase Auth built-in flow). **Not built yet** — no "forgot password" entry point or reset-password page exists in the UI. Supabase Auth supports the flow; only the app-side form is missing.
- Email verification (Supabase Auth built-in; whether to _require_ verification before use is a project-level setting in the Supabase dashboard, not something this app's code controls either way).

## How authorization actually works

**Decision:** The database — not the frontend — is the authorization boundary.

Every table's Row Level Security policy checks `auth.uid()` (the user id embedded in the validated JWT) against row ownership (see [Database Design](07-database-design.md) for the exact policies). The frontend additionally guards routes (redirecting signed-out users away from "your decks," etc.), but that's a UX nicety, not the security mechanism — a client-side check can always be bypassed by calling the API directly, so it must never be the only thing standing between a user and someone else's data.

This is called out explicitly because it's a common mistake: treating "the UI doesn't show a button for it" as if it were "the user can't do it." Here, the actual guarantee comes from Postgres refusing the query.

## Sessions across devices

Each device/browser holds its own session/JWT (refreshed automatically by `supabase-js`). Signing out on one device does not sign out another — this is standard JWT-session behavior and is the expected behavior, not a gap. There's no "active sessions" management UI in the MVP; it's a reasonable post-MVP addition if users ask for it.

## Deliberately deferred

- **OAuth providers** (Google, etc.) — Supabase Auth supports these natively; adding one later is a config + a button, not an architecture change. Not in the MVP simply because email/password alone is enough to validate the core product loop.
- **Multi-factor authentication** — same reasoning; revisit if/when the user base or data sensitivity justifies the added friction.
- **Magic-link / passwordless sign-in** — a nice-to-have, not core to validating the MVP.

None of these are blocked by anything in the current design — they're additive to the same Supabase Auth setup.
