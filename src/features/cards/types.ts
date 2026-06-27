export interface Card {
  id: string
  deckId: string
  /** Original word or sentence. */
  front: string
  /** Translation. */
  back: string
  pronunciation: string | null
  notes: string | null
  exampleSentence: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCardInput {
  deckId: string
  front: string
  back: string
  pronunciation: string | null
  notes: string | null
  exampleSentence: string | null
}

export type UpdateCardInput = Partial<Omit<CreateCardInput, 'deckId'>>
