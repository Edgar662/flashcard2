# Authentication Strategy

## Mechanism

**Decision:** Supabase Auth, email + password for the MVP, issuing standard JWTs.
**Why:** It's already part of the chosen backend (see [Tech Stack](05-tech-stack.md)) — no separate auth service to run, and it integrates directly with Row Level Security via `auth.uid()` (see [Database Design](07-database-design.md)). Email/password is the lowest-friction option to build first; it doesn't preclude adding OAuth later (see below).

`supabase-js` handles token storage and silent refresh in the browser — the app does not implement its own token-refresh logic.

## What ships in the MVP

- Sign up (email + password) — creates an `auth.users` row; a Postgres trigger creates the matching `profiles` row (see [Database Design](07-database-design.md)).
- Sign in / sign out.
- Password reset via emailed link (Supabase Auth built-in flow).
- Email verification (Supabase Auth built-in; whether to *require* verification before use is a launch-config decision, not an architectural one).

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
