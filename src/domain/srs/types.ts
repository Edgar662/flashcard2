/**
 * Architecture only — see docs/13-roadmap.md Phase 1 and ADR-0013. No
 * scheduling algorithm exists yet; these types just give the eventual
 * `domain/srs` module (and the `card_review_state` table it will back,
 * per docs/07-database-design.md) a place to land without requiring a
 * Card model rewrite when that work starts.
 *
 * Deliberately a separate type from `Card` (features/cards/types.ts), not
 * fields bolted onto it — content and scheduling progress are different
 * concerns with different lifecycles. See ADR-0007.
 */

export type CardReviewRating = 'again' | 'good' | 'easy'

export type CardReviewPhase = 'new' | 'learning' | 'review' | 'relearning'

export interface CardReviewState {
  cardId: string
  state: CardReviewPhase
  /** "Next review date." */
  dueAt: string
  intervalDays: number
  /** SM-2-style ease multiplier — sometimes called "weight." */
  easeFactor: number
  repetitions: number
  lapses: number
  lastReviewedAt: string | null
}
