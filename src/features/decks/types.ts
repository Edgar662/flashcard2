import type { LanguageCode } from '@/lib/languages'

export interface Deck {
  id: string
  name: string
  /** The language being studied — every deck represents one. */
  language: LanguageCode
  color: string
  createdAt: string
  updatedAt: string
}

export interface CreateDeckInput {
  name: string
  language: LanguageCode
  color: string
}

export type UpdateDeckInput = Partial<CreateDeckInput>
