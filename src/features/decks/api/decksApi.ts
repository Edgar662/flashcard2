import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/database'
import type { LanguageCode } from '@/lib/languages'
import type { CreateDeckInput, Deck, UpdateDeckInput } from '../types'

type DeckRow = Database['public']['Tables']['decks']['Row']

/**
 * The contract any deck storage backend must satisfy. `decksApi` below is
 * now Supabase-backed (see ADR-0020); the interface itself is unchanged
 * from the localStorage implementation it replaces (ADR-0015), which is
 * why no hook or component needed to change for this migration.
 */
export interface DecksRepository {
  list(): Promise<Deck[]>
  getById(id: string): Promise<Deck | null>
  create(input: CreateDeckInput): Promise<Deck>
  update(id: string, input: UpdateDeckInput): Promise<Deck>
  remove(id: string): Promise<void>
}

function mapRow(row: DeckRow): Deck {
  return {
    id: row.id,
    name: row.name,
    language: row.language as LanguageCode,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const decksApi: DecksRepository = {
  async list() {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return data.map(mapRow)
  },

  async getById(id) {
    const { data, error } = await supabase.from('decks').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  },

  async create(input) {
    const { data, error } = await supabase
      .from('decks')
      .insert({ name: input.name, language: input.language, color: input.color })
      .select()
      .single()
    if (error) throw error
    return mapRow(data)
  },

  async update(id, input) {
    const patch: Database['public']['Tables']['decks']['Update'] = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.language !== undefined) patch.language = input.language
    if (input.color !== undefined) patch.color = input.color

    const { data, error } = await supabase
      .from('decks')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return mapRow(data)
  },

  async remove(id) {
    const { error } = await supabase.from('decks').delete().eq('id', id)
    if (error) throw error
  },
}
