# 0020. Supabase Becomes the Repository Backend

**Status:** Accepted
**Date:** 2026-06-28
**Related:** docs/07-database-design.md, ADR-0004, ADR-0007, ADR-0008, ADR-0015, ADR-0018

## Context

ADR-0015 deliberately built `decksApi`/`cardsApi` against `localStorage` as an interim measure, behind the same `DecksRepository`/`CardsRepository` interfaces a real backend would eventually satisfy. The Supabase project (ADR-0001) and its schema (docs/07-database-design.md, ADR-0007, ADR-0008) were designed, documented, and now exist as an executable migration (`supabase/migrations/20260627234219_init_schema.sql`) — it's time to make the swap ADR-0015 anticipated.

## Problem

How should the repositories move from `localStorage` to Supabase without the UI, hooks, or feature components needing to change — and what, if anything, about the surrounding design should change now that the backend is a real relational database instead of a flat array in `localStorage`?

## Alternatives Considered

- **Rewrite the repositories AND their call sites together** — touching hooks/components while swapping the backend would conflate two changes (what storage is used vs. how it's consumed) into one diff, making it harder to verify that the repository-pattern promise (ADR-0004) actually held.
- **Keep the localStorage repositories as a fallback alongside the Supabase ones** (e.g. an env-var toggle) — would mean maintaining two implementations of the same interface indefinitely for no real benefit once Supabase is live; explicitly the kind of duplicate/temporary code this migration was asked to avoid.
- **Set `user_id` explicitly from the client on every insert** (fetching the current user and passing `user_id` in the payload) — works, but means every repository write needs to know about "who is logged in," duplicating what the database can already do via a column default.

## Decision

We will replace `decksApi`/`cardsApi`'s internals with calls to `supabase.from(...)`, keeping the `DecksRepository`/`CardsRepository` interfaces byte-for-byte identical to the localStorage version. No hook (`useDecks`, `useCreateDeck`, etc.) changed. A few implementation details worth recording:

- **`user_id` defaults to `auth.uid()`** on every table that has one (`decks`, `cards`, `card_review_state`, `review_logs`), so repository code never sets it explicitly on insert — the database fills it in, and the RLS `with check` clause (ADR-0008) still validates it against the real parent regardless of what a client sends.
- **The `cards.deck_id` foreign key now has real `on delete cascade`.** `useDeleteDeck` (features/decks/hooks) no longer calls `cardsApi.removeByDeck()` before deleting a deck — that orchestration was ADR-0018's workaround for localStorage having no real foreign keys. Doing it again here would be the database and the client both deleting the same rows, which is exactly the duplicate logic this migration was asked to avoid. `cardsApi.removeByDeck()` itself is kept on the interface — "clear every card in a deck without deleting the deck" is still a meaningful, separate operation — it's just no longer called from the delete-deck path.
- **The old `normalizeDeck()` defensive fallback (coercing an invalid stored `language` to `'en'`) is gone.** It existed because `localStorage` had no schema enforcement; Postgres's `check (language in (...))` constraint (ADR-0017) now makes an invalid value impossible to store in the first place, so the application no longer needs to guard against it.
- **Optimistic updates** were added to `useUpdateDeck`/`useDeleteDeck`/`useUpdateCard`/`useDeleteCard` (not create — see below), via a small shared helper (`src/lib/optimisticList.ts`) rather than four near-identical inline implementations. `localStorage` had no real latency to hide; a real network round trip does. Create was left non-optimistic: the form dialog already shows a disabled, pending-labeled submit button and stays open until the request settles, which is adequate feedback without fabricating a temporary client-side row with a fake id.
- **The Supabase client is now typed** (`createClient<Database>`), using a hand-written `src/types/database.ts` matching the migration exactly — see that file's header for how to replace it with a real `supabase gen types typescript` output later.

## Consequences

**Positive:**

- Confirms the repository pattern (ADR-0004) did what it was built for: zero changes to any hook, component, or page to swap the entire storage backend.
- Two duplicate-logic risks were removed rather than carried forward: cascade orchestration (now the database's job alone) and language-validity fallback (now a database constraint, not an app-level guard).
- Optimistic updates make the now-real network latency invisible for the most frequent interactions (edit, delete) without the complexity of optimistic create.

**Negative / risks:**

- The hand-written `Database` type can drift from the real schema if the migration changes without a matching type update — there is no CI check enforcing this yet (would require a live project to generate against). Treat schema changes and `database.ts` changes as one PR until that's automated.
- Optimistic updates mean the UI can briefly show a state the server later rejects (e.g. an update that fails RLS or validation). `onError` rolls the cache back in that case, but a user could see a flash of the "wrong" state — judged an acceptable tradeoff at this app's current scale and interaction patterns.
