import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '@/test/createSupabaseMock'
import { supabase } from '@/lib/supabaseClient'
import { cardsApi } from './cardsApi'

vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: vi.fn() } }))

const DECK_A = 'deck-a'
const DECK_B = 'deck-b'

let mock: ReturnType<typeof createSupabaseMock>

beforeEach(() => {
  mock = createSupabaseMock()
  // supabase.from is a real class method (hence the generic signature below);
  // detaching it here is fine — we're replacing its implementation outright,
  // never calling it with a borrowed `this`.
  // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unnecessary-type-assertion -- tsc requires both casts here even though the linter's type info disagrees
  vi.mocked(supabase.from).mockImplementation(mock.client.from as unknown as typeof supabase.from)
})

describe('cardsApi', () => {
  it('starts empty for a deck', async () => {
    expect(await cardsApi.listByDeck(DECK_A)).toEqual([])
    expect(await cardsApi.countByDeck(DECK_A)).toBe(0)
    expect(await cardsApi.countAll()).toBe(0)
  })

  it('creates a card and lists it under its deck only, mapping columns to camelCase', async () => {
    const card = await cardsApi.create({
      deckId: DECK_A,
      front: 'привет',
      back: 'hello',
      pronunciation: 'privet',
      notes: null,
      exampleSentence: null,
    })

    expect(card.id).toBeTruthy()
    expect(card.deckId).toBe(DECK_A)
    expect(card.pronunciation).toBe('privet')
    expect(await cardsApi.listByDeck(DECK_A)).toEqual([card])
    expect(await cardsApi.listByDeck(DECK_B)).toEqual([])
    expect(await cardsApi.countByDeck(DECK_A)).toBe(1)
  })

  it('finds a card by id, or returns null', async () => {
    const card = await cardsApi.create({
      deckId: DECK_A,
      front: 'привет',
      back: 'hello',
      pronunciation: null,
      notes: null,
      exampleSentence: null,
    })

    expect(await cardsApi.getById(card.id)).toEqual(card)
    expect(await cardsApi.getById('missing-id')).toBeNull()
  })

  it('updates a card in place', async () => {
    const card = await cardsApi.create({
      deckId: DECK_A,
      front: 'привет',
      back: 'hello',
      pronunciation: null,
      notes: null,
      exampleSentence: null,
    })

    const updated = await cardsApi.update(card.id, { back: 'hi' })

    expect(updated.id).toBe(card.id)
    expect(updated.back).toBe('hi')
  })

  it('throws when updating a card that does not exist', async () => {
    await expect(cardsApi.update('missing-id', { back: 'x' })).rejects.toThrow()
  })

  it('removes a single card', async () => {
    const card = await cardsApi.create({
      deckId: DECK_A,
      front: 'привет',
      back: 'hello',
      pronunciation: null,
      notes: null,
      exampleSentence: null,
    })

    await cardsApi.remove(card.id)

    expect(await cardsApi.listByDeck(DECK_A)).toEqual([])
  })

  it('counts cards across every deck', async () => {
    await cardsApi.create({
      deckId: DECK_A,
      front: 'a1',
      back: 'b1',
      pronunciation: null,
      notes: null,
      exampleSentence: null,
    })
    await cardsApi.create({
      deckId: DECK_B,
      front: 'a2',
      back: 'b2',
      pronunciation: null,
      notes: null,
      exampleSentence: null,
    })

    expect(await cardsApi.countAll()).toBe(2)
  })

  it('cascade-removes only the cards belonging to a deck', async () => {
    await cardsApi.create({
      deckId: DECK_A,
      front: 'a1',
      back: 'b1',
      pronunciation: null,
      notes: null,
      exampleSentence: null,
    })
    const cardB = await cardsApi.create({
      deckId: DECK_B,
      front: 'a2',
      back: 'b2',
      pronunciation: null,
      notes: null,
      exampleSentence: null,
    })

    await cardsApi.removeByDeck(DECK_A)

    expect(await cardsApi.listByDeck(DECK_A)).toEqual([])
    expect(await cardsApi.listByDeck(DECK_B)).toEqual([cardB])
  })
})
