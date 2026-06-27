# 0018. Cross-Entity Cascade Operations Are Orchestrated in the Hook Layer, Not the Repository

**Status:** Accepted
**Date:** 2026-06-27
**Related:** docs/07-database-design.md §`cards`, ADR-0004, ADR-0015

## Context

Deleting a deck must also delete its cards, matching the cascade-delete foreign-key behavior already documented for the eventual Supabase schema. `decksApi` and `cardsApi` are two independent repositories (ADR-0004, ADR-0015), each scoped to a single entity.

## Problem

Where should "delete a deck's cards too" live, given neither repository should own the other's data?

## Alternatives Considered

- **Have `decksApi.remove()` call `cardsApi.removeByDeck()` directly** — keeps the cascade close to the primary delete, but conflates two repositories' responsibilities inside the data-access layer and sets a precedent of repositories reaching into each other.
- **Duplicate the cascade check at every UI call site** that might delete a deck — error-prone; a second delete entry point added later could easily forget it.

## Decision

We will orchestrate cross-entity cascades in the feature/hook layer, not inside either repository. `useDeleteDeck` (`features/decks/hooks`) calls `cardsApi.removeByDeck(id)` before `decksApi.remove(id)`, both awaited inside one mutation, with both `['decks']` and `['cards']` query caches invalidated on success.

## Consequences

**Positive:**

- Each repository stays single-responsibility and independently testable — `cardsApi`'s and `decksApi`'s test suites don't need to know about each other.
- The cascade lives in exactly one place (the delete-deck hook), not duplicated per call site, and is itself easy to reason about and test.
- Establishes the pattern for future cross-entity cleanup (e.g. a study-session entity that should also clear up when a card is deleted): orchestrate in the hook performing the primary operation, not inside either repository.

**Negative / risks:**

- The hook importing from another feature's `api/` module is a deliberate, narrow exception to "features don't reach into each other" — acceptable because it imports the _public_ repository interface, not internals, per docs/12-coding-standards.md rule 3.
