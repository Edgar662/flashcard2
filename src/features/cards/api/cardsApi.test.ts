import { beforeEach, describe, expect, it } from 'vitest'
import { cardsApi } from './cardsApi'

const DECK_A = 'deck-a'
const DECK_B = 'deck-b'

beforeEach(() => {
  localStorage.clear()
})

describe('cardsApi', () => {
  it('starts empty for a deck', async () => {
    expect(await cardsApi.listByDeck(DECK_A)).toEqual([])
    expect(await cardsApi.countByDeck(DECK_A)).toBe(0)
  })

  it('creates a card and lists it under its deck only', async () => {
    const card = await cardsApi.create({
      deckId: DECK_A,
      front: 'привет',
      back: 'hello',
      pronunciation: 'privet',
      notes: null,
      exampleSentence: null,
    })

    expect(card.id).toBeTruthy()
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
