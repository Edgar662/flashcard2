# API Design

There is no hand-written REST/GraphQL API for the MVP. "API design" here means: how the frontend is allowed to talk to Supabase, and the conventions that keep that disciplined as the app grows. See [Architecture](04-architecture.md) for the layering this sits inside.

## The repository pattern is the API

**Decision:** All data access goes through typed repository functions in `features/*/api/` (e.g. `decksApi.list()`, `decksApi.create(input)`, `cardsApi.update(id, input)`), which internally call `supabase-js` against the auto-generated PostgREST API. No component or hook calls `supabase-js` directly.

**Why:**
- **Single error-handling convention.** Repository functions catch Supabase errors and re-throw/return a consistent typed shape, so feature code (and tests) don't each handle raw Supabase error objects differently.
- **Testability.** Feature hooks can be tested against a mocked repository without a real Supabase connection.
- **A seam, not a wall.** If the backend ever changed (different BaaS, a custom server), only these functions change — UI, feature hooks, and the domain layer wouldn't need to.

Example shape (illustrative only — not implemented yet):

```ts
// features/decks/api/decksApi.ts
export const decksApi = {
  list: (): Promise<Deck[]> => { /* supabase.from('decks').select() ... */ },
  create: (input: CreateDeckInput): Promise<Deck> => { /* ... */ },
  update: (id: string, input: UpdateDeckInput): Promise<Deck> => { /* ... */ },
  remove: (id: string): Promise<void> => { /* ... */ },
};
```

Feature hooks (`useDecks`, `useCreateDeck`) wrap these with TanStack Query for caching/invalidation — components call the hooks, never the repository directly.

## Generated types as the contract

**Decision:** TypeScript types for every table are generated from the live database schema via the Supabase CLI (`supabase gen types typescript`) into `src/types/database.ts`, regenerated whenever a migration changes the schema.

**Why:** This makes the Postgres schema (see [Database Design](07-database-design.md)) the single source of truth for shape — the frontend cannot silently drift from it, because a schema change that removes/renames a column breaks the build at compile time instead of failing at runtime.

## What's a direct CRUD call vs. an Edge Function

Most operations are plain CRUD against a table, protected by RLS, and need nothing more than a repository function calling PostgREST. A few things don't fit that and become **Supabase Edge Functions** instead:

| Operation | Mechanism | Why |
|---|---|---|
| List/create/update/delete decks, cards | Direct PostgREST call via repository | Simple ownership-scoped CRUD — exactly what RLS + auto-API is for. |
| Submit a card review (write `card_review_state` + `review_logs`) | Direct PostgREST call(s) via repository, computed by the `domain/srs` module client-side | The scheduling *math* runs in the client (pure, testable function — see [Architecture](04-architecture.md)); only the *result* is written to the database. No server-side computation needed since there's nothing security-sensitive about a user updating their own card's schedule. |
| Import a deck (JSON/CSV) | **Edge Function** (`import-deck`) | Needs to parse and validate an uploaded file and insert potentially many rows transactionally — cleaner and safer to do this as one server-side operation than as many sequential client-side inserts that could partially fail. |
| Export a deck | Client-side, no Edge Function | The data is already fetched/fetchable via normal queries; generating a JSON/CSV file from data already in hand is a pure client-side operation. Revisit only if export needs to aggregate something the client shouldn't fetch in bulk (not the case for the MVP). |

**Decision:** Default to direct CRUD via repositories; reach for an Edge Function only when an operation needs server-side validation, multi-row transactionality, or elevated privileges the client shouldn't have.
**Why:** Keeps the system's moving parts minimal — every Edge Function is something we deploy, version, and operate. Adding one should be a deliberate choice, not the default.

## Realtime

Supabase's realtime subscriptions (live push of database changes to connected clients) are **not used in the MVP**.

**Why:** The chosen sync model is online-first with the cloud as source of truth (see [Synchronization Strategy](11-synchronization.md)) — each screen simply fetches current data on load/focus. A single user is rarely connected from two devices at the exact same moment editing the same data, so the value of live push is low relative to the complexity of wiring up subscriptions and merging live updates into the TanStack Query cache.
**Revisit if:** The community feature (future) introduces genuinely concurrent multi-user scenarios (e.g. live comments on a shared deck) where push actually matters.

## Error and response conventions

- Repository functions return the parsed data or throw a typed `ApiError` (with a machine-readable code and a user-presentable message) — no raw Supabase/Postgres errors escape the data-access layer.
- TanStack Query's `error` state is what feature/UI code reacts to; there is no separate ad-hoc error-handling path per feature.
- Validation (e.g. "name is required," "file isn't valid JSON") happens with Zod at the boundary — in forms before submission, and in the import flow before anything is sent to the database — so the API layer mostly receives already-valid input.
