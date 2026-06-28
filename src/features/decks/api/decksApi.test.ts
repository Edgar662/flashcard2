import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '@/test/createSupabaseMock'
import { supabase } from '@/lib/supabaseClient'
import { decksApi } from './decksApi'

vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: vi.fn() } }))

let mock: ReturnType<typeof createSupabaseMock>

beforeEach(() => {
  mock = createSupabaseMock()
  // supabase.from is a real class method (hence the generic signature below);
  // detaching it here is fine — we're replacing its implementation outright,
  // never calling it with a borrowed `this`.
  // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unnecessary-type-assertion -- tsc requires both casts here even though the linter's type info disagrees
  vi.mocked(supabase.from).mockImplementation(mock.client.from as unknown as typeof supabase.from)
})

describe('decksApi', () => {
  it('starts empty', async () => {
    expect(await decksApi.list()).toEqual([])
  })

  it('creates a deck and lists it, mapping snake_case columns to camelCase', async () => {
    const deck = await decksApi.create({ name: 'Russian', language: 'ru', color: '#3b82f6' })

    expect(deck.id).toBeTruthy()
    expect(deck.name).toBe('Russian')
    expect(deck.language).toBe('ru')
    expect(deck.color).toBe('#3b82f6')
    expect(deck.createdAt).toBeTruthy()
    expect(deck.updatedAt).toBeTruthy()
    expect(await decksApi.list()).toEqual([deck])
  })

  it('never sends user_id on create — ownership comes from the column default, not the client', async () => {
    await decksApi.create({ name: 'Russian', language: 'ru', color: '#3b82f6' })

    const [row] = mock.getTable('decks')
    expect(row).not.toHaveProperty('user_id')
  })

  it('finds a deck by id, or returns null', async () => {
    const deck = await decksApi.create({ name: 'Russian', language: 'ru', color: '#3b82f6' })

    expect(await decksApi.getById(deck.id)).toEqual(deck)
    expect(await decksApi.getById('missing-id')).toBeNull()
  })

  it('updates only the fields provided, bumping updatedAt', async () => {
    const deck = await decksApi.create({ name: 'Russian', language: 'ru', color: '#3b82f6' })

    const updated = await decksApi.update(deck.id, { name: 'Russian 101', color: '#22c55e' })

    expect(updated.id).toBe(deck.id)
    expect(updated.name).toBe('Russian 101')
    expect(updated.color).toBe('#22c55e')
    expect(updated.language).toBe('ru')
    expect(await decksApi.list()).toEqual([updated])
  })

  it('throws when updating a deck that does not exist', async () => {
    await expect(decksApi.update('missing-id', { name: 'x' })).rejects.toThrow()
  })

  it('removes a deck', async () => {
    const deck = await decksApi.create({ name: 'Russian', language: 'ru', color: '#3b82f6' })

    await decksApi.remove(deck.id)

    expect(await decksApi.list()).toEqual([])
  })
})
