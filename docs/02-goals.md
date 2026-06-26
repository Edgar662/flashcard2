# Goals

## Product goals

1. **Validate the core loop fast.** A new user should be able to sign up, create a deck, add a handful of cards, and complete a study session in well under five minutes, with zero configuration required.
2. **Make the scheduling trustworthy.** The Again/Good/Easy spaced-repetition system should behave predictably enough that a user who studies daily sees due-counts shrink and intervals grow — the core promise of the product.
3. **Never trap the user's data.** Import/export must work from day one so that "what if I want to leave" is never a real fear, which paradoxically makes people more comfortable staying.
4. **Be available wherever the user studies.** Cloud sync (in the online-first sense defined in [Synchronization Strategy](11-synchronization.md)) means the same decks are there on a laptop or a phone browser without manual transfer.

## Technical goals

These are the engineering-side translations of the product goals, and the lens through which every architectural decision in this doc set is made:

1. **Clean separation of concerns.** UI, business logic (especially the spaced-repetition algorithm), and data access should be independently testable and independently replaceable. See [Architecture](04-architecture.md).
2. **Type safety end-to-end.** TypeScript types should flow from the database schema through the data layer to the UI, so schema drift is caught at compile time, not in production. See [Tech Stack](05-tech-stack.md), [API Design](09-api-design.md).
3. **Low operational overhead.** This is built and run by a small team (today, effectively solo). Infrastructure choices favor managed services with generous free tiers over self-hosted systems that require ongoing maintenance. See [Tech Stack](05-tech-stack.md).
4. **Security by construction, not by convention.** Authorization should be enforced at the database layer (Row Level Security) so a bug in frontend code cannot leak one user's data to another. See [Authentication Strategy](10-authentication.md), [Database Design](07-database-design.md).
5. **Extensibility without rewrites.** The community/sharing feature, native mobile clients, and richer card types are all explicitly anticipated in the schema and architecture even though none are built now, so that arriving at them later is additive work, not a migration. See [Roadmap](13-roadmap.md).
6. **Maintainability over cleverness.** Prefer boring, well-documented technology and conventional patterns. A solo or small team needs to be able to return to this code after months away and immediately understand it.

## Non-goals

- **Premature scale.** We are not designing for millions of users on day one. We are designing so that *getting there* doesn't require throwing away the foundation — see the explicit "what would change" notes in [Synchronization Strategy](11-synchronization.md) and [Roadmap](13-roadmap.md).
- **Framework purity for its own sake.** We will use a managed backend (Supabase) and accept some vendor coupling in exchange for not building auth, an API layer, and infrastructure from scratch. The reasoning is in [Architecture](04-architecture.md).

## How we'll know the foundation is right

Before writing application code, this documentation set should let a new contributor answer, without asking anyone:

- Where does a given piece of logic belong (UI, domain, or data-access layer)?
- What happens to a user's data when they delete a deck?
- How is a card scheduled for review, conceptually?
- What's already decided vs. explicitly deferred to a later phase?

If any of those questions are unanswerable from `/docs`, the foundation isn't finished yet.
