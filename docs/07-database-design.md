# Database Design

Postgres, managed by Supabase. Schema is maintained as versioned SQL migrations in `supabase/migrations/` (see [Folder Structure](06-folder-structure.md)).

## Entity overview

```
auth.users (managed by Supabase Auth)
      │ 1
      │
      ▼ 1
  profiles
      │ 1
      │
      ▼ N
   decks ────────────┐
      │ 1             │ (future: forked_from_deck_id)
      │               │
      ▼ N             ▼
   cards          (self-reference, deferred)
      │ 1
      ├──────────────┐
      ▼ 1            ▼ N
card_review_state  review_logs
```

- A user has many decks.
- A deck has many cards.
- A card has exactly one review-state record and many historical review-log entries.

## Tables

### `profiles`
App-specific data about a user, separate from Supabase's own `auth.users` table (which we don't own the schema of).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK, references `auth.users(id)` | Same id as the auth user. |
| `display_name` | `text`, nullable | Shown in the UI; falls back to email if null. |
| `created_at` | `timestamptz`, default `now()` | |

Populated automatically by a Postgres trigger on `auth.users` insert (standard Supabase pattern) — the application never creates this row directly.

### `decks`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK, default `gen_random_uuid()` | |
| `user_id` | `uuid`, references `profiles(id)`, not null | Owner. |
| `name` | `text`, not null | |
| `description` | `text`, nullable | |
| `language` | `text`, nullable | Free-text tag (e.g. "Russian") — not an enum, since users study arbitrary subjects, not just languages (see [Product Vision](01-product-vision.md)). |
| `created_at` | `timestamptz`, default `now()` | |
| `updated_at` | `timestamptz`, default `now()` | Updated via trigger on row update. |

Index: `decks(user_id)`.

### `cards`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK, default `gen_random_uuid()` | |
| `deck_id` | `uuid`, references `decks(id)` on delete cascade, not null | |
| `front` | `text`, not null | |
| `back` | `text`, not null | |
| `notes` | `text`, nullable | Optional hint/mnemonic — see [MVP Scope](03-mvp-scope.md). |
| `created_at` | `timestamptz`, default `now()` | |
| `updated_at` | `timestamptz`, default `now()` | |

Index: `cards(deck_id)`.

**Decision:** `front`/`back`/`notes` are plain `text`, not JSON/rich-text, for the MVP.
**Why:** Matches the MVP scope (plain-text cards); rich content (images/audio/formatting) is an explicit fast-follow (see [Roadmap](13-roadmap.md)) and would change this to a structured format — deferring it avoids designing for a feature that isn't built yet.

### `card_review_state`

Holds the *current* spaced-repetition scheduling state for a card — kept in its own table rather than as columns on `cards`.

| Column | Type | Notes |
|---|---|---|
| `card_id` | `uuid` PK, references `cards(id)` on delete cascade | One-to-one with `cards`. |
| `state` | `text` enum: `new`, `learning`, `review`, `relearning` | Which phase of the algorithm the card is in. |
| `due_at` | `timestamptz`, not null, default `now()` | When the card next becomes eligible for study. |
| `interval_days` | `real`, not null, default `0` | Current scheduling interval. |
| `ease_factor` | `real`, not null, default `2.5` | SM-2-style ease multiplier. |
| `repetitions` | `integer`, not null, default `0` | Consecutive successful reviews. |
| `lapses` | `integer`, not null, default `0` | Times the card was rated "Again" after leaving the `new` state. |
| `last_reviewed_at` | `timestamptz`, nullable | |

Index: `card_review_state(due_at)` — the study session's core query is "give me this user's cards where `due_at <= now()`," and this index is what makes that fast as data grows.

**Decision:** Scheduling state is a separate table from `cards`, not extra columns on `cards`.
**Why:** Keeps `cards` purely about *content* (what import/export cares about) and `card_review_state` purely about *scheduling progress*. This separation means export/import logic doesn't need to special-case scheduling columns, and a future "reset my progress on this deck" feature is a delete on one table, not a selective column reset on another.
**Note on the algorithm itself:** the exact constants and transition rules (how much `ease_factor` changes on "Again" vs "Easy", how `interval_days` is computed) are an SM-2-family algorithm and are an implementation detail of the `domain/srs` module (see [Architecture](04-architecture.md)) finalized when the study module is actually built — not decided in this document, since this is a design doc, not an implementation.

### `review_logs`

Append-only history of every rating a user has given a card. Not used by the scheduling algorithm itself (which only needs current state), but kept from day one because:
- it's the only way to ever build stats/insights ([Roadmap](13-roadmap.md) Phase 3) without having thrown the data away,
- it's useful for debugging/tuning the algorithm later,
- append-only tables carry essentially no design risk to add now vs. later, unlike a column you might need to remove.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK, default `gen_random_uuid()` | |
| `card_id` | `uuid`, references `cards(id)` on delete cascade, not null | |
| `rating` | `text` enum: `again`, `good`, `easy` | |
| `reviewed_at` | `timestamptz`, not null, default `now()` | |
| `interval_before` | `real`, nullable | Interval prior to this review. |
| `interval_after` | `real`, nullable | Interval resulting from this review. |

Index: `review_logs(card_id)`.

## Row Level Security

RLS is enabled on every table. Authorization is enforced at the database, not just in application code (see [Architecture](04-architecture.md) §Security model).

Pattern for tables with a direct `user_id` (`decks`):

```sql
create policy "Users can manage their own decks"
  on decks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Pattern for tables that inherit ownership via a parent (`cards`, `card_review_state`, `review_logs` — via `deck_id`/`card_id`):

```sql
create policy "Users can manage cards in their own decks"
  on cards
  for all
  using (
    auth.uid() = (select user_id from decks where decks.id = cards.deck_id)
  )
  with check (
    auth.uid() = (select user_id from decks where decks.id = cards.deck_id)
  );
```

`card_review_state` and `review_logs` follow the same pattern one level deeper (joining through `cards` → `decks`).

**Why this matters:** even if a future bug in frontend code forgot to filter by user, Postgres itself refuses to return or modify another user's rows. This is the actual security boundary, not a nicety on top of one.

## Future extensibility (not built now, but designed for)

These are explicitly *not* part of the MVP schema, called out here only so today's design doesn't accidentally make them harder later (see [Roadmap](13-roadmap.md)):

- **Community sharing:** adding `decks.is_public boolean default false` and `decks.forked_from_deck_id uuid references decks(id)` later is additive — no existing column changes meaning.
- **Rich media:** would likely mean `cards.front`/`back` becoming structured (JSON blocks) or adding a separate `card_attachments` table referencing Supabase Storage — deferred until the feature is actually scoped.
- **Native clients:** the schema has no web-specific assumptions, so a future mobile client reads/writes the same tables with no changes needed.
