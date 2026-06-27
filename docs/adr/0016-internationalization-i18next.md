# 0016. Internationalization: i18next + react-i18next

**Status:** Accepted
**Date:** 2026-06-27
**Related:** docs/03-mvp-scope.md §Internationalization, ADR-0017

## Context

The product now needs a UI available in five languages (English, Portuguese, Russian, German, Japanese), with every string translated (no hardcoded text), a language selector, and the chosen language persisted across sessions.

## Problem

Which i18n approach, and how should translations be organized and persisted?

## Alternatives Considered

- **react-intl (FormatJS)** — mature, full ICU MessageFormat support, but more ceremony (extraction tooling, `defineMessages`) than a fixed, moderate-sized string set needs here.
- **Hand-rolled context + plain JSON lookup** — avoids a dependency, but reimplements pluralization correctly (especially Russian's four-category one/few/many/other rules) and interpolation, both of which i18next already solves.
- **LinguiJS** — compile-time extraction and a smaller runtime, but less ubiquitous tooling/community for a React + Vite stack than i18next.

## Decision

We will use `i18next` + `react-i18next` + `i18next-browser-languagedetector`. One JSON resource file per locale (`src/lib/i18n/locales/{en,pt,ru,de,ja}.json`), nested by feature (`common`/`nav`/`auth`/`decks`/`cards`/`settings`/`languages`/…) under a single default namespace. The language detector reads/writes a dedicated `localStorage` key (`flashcards:language`), checked before falling back to the browser's language, then to English. A TypeScript module augmentation (`i18next.d.ts`) type-checks every `t()` call against the English resource shape.

## Consequences

**Positive:**

- Correct pluralization out of the box, including Russian's one/few/many/other categories — handled by i18next's suffix convention, not hand-rolled.
- Switching language is instant (no reload) since `react-i18next` re-renders on language change; the choice survives reloads via the detector's `localStorage` cache.
- Type-checked translation keys catch typos or missing keys at compile time instead of silently rendering a blank string at runtime.

**Negative / risks:**

- Five JSON files must be kept in sync by hand; nothing currently enforces identical key sets across locales (a missing key safely falls back to the English string via i18next's `fallbackLng`, but the gap is easy to miss). Revisit with an automated key-parity check if the string set grows large enough for drift to become a real risk.
