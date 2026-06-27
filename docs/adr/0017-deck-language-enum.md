# 0017. Deck Language Becomes a Constrained Enum, Narrowing "Any Subject" for Now

**Status:** Accepted
**Date:** 2026-06-27
**Related:** docs/07-database-design.md §`decks`, docs/01-product-vision.md, ADR-0016

## Context

[Database Design](../07-database-design.md) originally specified `decks.language` as free text specifically because [Product Vision](../01-product-vision.md) frames the product as supporting "any language, any subject" — not language-learning exclusively. Internationalization (ADR-0016) now requires a known, finite language list (for flags, translated display names, and locale-aware card sorting), and the current product direction states plainly: every deck represents a study language.

## Problem

Should a deck's language stay unconstrained free text, or be limited to a known set — and what does that mean for the original "any subject" framing?

## Alternatives Considered

- **Keep `language` as free text**, maintaining the 5-language list separately, only for the UI language selector — preserves the original flexibility, but then a deck's language can't reliably drive flag display, translated-name display, or locale-aware sorting (free text like "Russian" vs "russian" vs "RU" can't be matched against a known list without fuzzy matching).
- **Add a 6th "Other"/freeform escape hatch** alongside the five fixed languages — would preserve some room for non-language ("any subject") decks, but wasn't requested for this iteration and adds a code path with no UI built to exercise it.

## Decision

We will constrain `Deck.language` to exactly the five supported language codes (`en`/`pt`/`ru`/`de`/`ja`, shared with the i18n language list — see `src/lib/languages.ts`), required rather than nullable, selected via a `<select>` rather than free text.

## Consequences

**Positive:**

- A deck's language reliably drives flag + translated-name display and locale-aware card sorting, with zero ambiguity.
- One shared list (`SUPPORTED_LANGUAGES`) serves both the UI language switcher and the deck language picker — no duplicate metadata to keep in sync.

**Negative / risks:**

- This deliberately narrows [Product Vision](../01-product-vision.md)'s "any language, any subject" framing to "any of five languages" for the current build — every deck must be a language-learning deck. The vision document is left as-is (it's the long-term north star, not a description of the current build, by design — see docs/adr/README.md). If non-language ("any subject") decks become a real near-term need, the fix is additive — e.g. a separate deck type that doesn't require a language code — not a reversal of this decision.
- Pre-existing local data from before this change (free-text or missing language) is handled defensively: `decksApi` normalizes any unrecognized value to `'en'` on read rather than crashing — see docs/07-database-design.md.
