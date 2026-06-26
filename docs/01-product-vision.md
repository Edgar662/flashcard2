# Product Vision

## The problem

People learning a language (or anything else via memorization — vocabulary, anatomy, case law, periodic tables) are generally offered two kinds of tools:

- **Generic flashcard apps** (Quizlet and similar) that are easy to use but treat spaced repetition as an afterthought, push pre-made content and ads, and don't give serious learners confidence that the scheduling is actually optimizing their retention.
- **Powerful spaced-repetition tools** (Anki) that take scheduling seriously but expose enormous configuration surface area, dated UX, and a steep learning curve before a new user can create their first deck.

There isn't an obvious option for someone who wants: _"let me write my own cards, in my own language pair or subject, and have the app quietly handle the hard part of when to show them to me again."_

## Vision statement

**A flashcard app that gets out of the way.** Users bring their own content — any language, any subject — and the app's only job is to make creating that content effortless and to schedule reviews intelligently, so studying is the only thing that takes willpower.

## Who this is for

- Self-directed language learners building their own vocabulary decks instead of relying on a fixed course (the primary persona).
- Students of any subject who want spaced repetition without Anki's setup overhead.
- People who already keep "things to memorize" in notes apps and want a purpose-built place for that, with a system that actually resurfaces the right cards at the right time.

This is **not**, at least for the MVP, aimed at teachers managing classrooms, or learners who want a guided curriculum with content provided for them — both are credible future directions, not the starting point.

## What makes this different

|                           | Quizlet-style apps                             | Anki                          | This app                                                       |
| ------------------------- | ---------------------------------------------- | ----------------------------- | -------------------------------------------------------------- |
| Custom content            | Yes, but content discovery/ads dominate the UX | Yes                           | Yes — full customization is the point, not a side feature      |
| Spaced repetition         | Often shallow or absent                        | Deep, but configuration-heavy | Real SM-2-style scheduling, with three buttons and no setup    |
| Onboarding                | Easy                                           | Hard                          | Easy                                                           |
| Data ownership            | Locked into the platform                       | Local files, full ownership   | Cloud-synced, with full import/export so data is never trapped |
| Sharing decks with others | Yes                                            | Via separate community sites  | Planned (post-MVP) — see [Roadmap](13-roadmap.md)              |

The bet is that **simplicity and a credible algorithm are not in tension** — most of Anki's complexity is configuration knobs that the vast majority of users never need. We can default those away.

## Non-goals (for now)

These are deliberately excluded from the product vision at this stage, not because they're bad ideas, but because chasing them now would dilute the core loop:

- Gamification (streaks, leaderboards, badges) as a primary driver of engagement.
- Pre-built content libraries or guided courses — this app is about _user-created_ decks.
- Social/multiplayer features beyond the future community deck-sharing feature already planned.
- Enterprise, classroom, or team-management features.

## Why this matters for the architecture

Because the product's entire value proposition is "fast to create content, trustworthy scheduling, available everywhere," the architecture optimizes for:

- **Low-friction CRUD** on decks/cards (see [MVP Scope](03-mvp-scope.md), [User Flows](08-user-flows.md)).
- **A correct, well-isolated spaced-repetition implementation** (see [Architecture](04-architecture.md) §Domain Layer) — this is the part of the codebase that most directly delivers on the vision and deserves the most rigor (tests, isolation from UI churn).
- **Data portability** (import/export) and **no lock-in**, which directly informs the [Database Design](07-database-design.md) and the choice to keep export formats open and documented rather than proprietary.
