import type { Card, CreateCardInput, UpdateCardInput } from '../types'

const STORAGE_KEY = 'flashcards:cards'

/**
 * The contract any card storage backend must satisfy — same pattern as
 * `DecksRepository` (see docs/adr/0015-interim-localstorage-persistence.md).
 * `cardsApi` below is the only implementation today (localStorage); a
 * future Supabase-backed implementation satisfies the same interface.
 */
export interface CardsRepository {
  listByDeck(deckId: string): Promise<Card[]>
  countByDeck(deckId: string): Promise<number>
  /** Across every deck — used by the Home dashboard's aggregate stats. */
  countAll(): Promise<number>
  getById(id: string): Promise<Card | null>
  create(input: CreateCardInput): Promise<Card>
  update(id: string, input: UpdateCardInput): Promise<Card>
  remove(id: string): Promise<void>
  /** Cascade delete — called when the owning deck is removed. */
  removeByDeck(deckId: string): Promise<void>
}

function readCards(): Card[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Card[]) : []
  } catch {
    return []
  }
}

function writeCards(cards: Card[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

export const cardsApi: CardsRepository = {
  listByDeck(deckId) {
    return Promise.resolve(readCards().filter((card) => card.deckId === deckId))
  },

  countByDeck(deckId) {
    return Promise.resolve(readCards().filter((card) => card.deckId === deckId).length)
  },

  countAll() {
    return Promise.resolve(readCards().length)
  },

  getById(id) {
    return Promise.resolve(readCards().find((card) => card.id === id) ?? null)
  },

  create(input) {
    const now = new Date().toISOString()
    const card: Card = {
      id: crypto.randomUUID(),
      deckId: input.deckId,
      front: input.front,
      back: input.back,
      pronunciation: input.pronunciation,
      notes: input.notes,
      exampleSentence: input.exampleSentence,
      createdAt: now,
      updatedAt: now,
    }
    const cards = readCards()
    cards.push(card)
    writeCards(cards)
    return Promise.resolve(card)
  },

  update(id, input) {
    const cards = readCards()
    const index = cards.findIndex((card) => card.id === id)
    const existing = cards[index]
    if (index === -1 || !existing) {
      return Promise.reject(new Error(`Card ${id} not found`))
    }
    const updated: Card = { ...existing, ...input, updatedAt: new Date().toISOString() }
    cards[index] = updated
    writeCards(cards)
    return Promise.resolve(updated)
  },

  remove(id) {
    writeCards(readCards().filter((card) => card.id !== id))
    return Promise.resolve()
  },

  removeByDeck(deckId) {
    writeCards(readCards().filter((card) => card.deckId !== deckId))
    return Promise.resolve()
  },
}
