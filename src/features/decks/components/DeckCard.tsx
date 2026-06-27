import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import { getLanguageMeta } from '@/lib/languages'
import { useCardCount } from '@/features/cards/hooks/useCardCount'
import type { Deck } from '../types'

interface DeckCardProps {
  deck: Deck
  onEdit: () => void
  onDelete: () => void
}

export function DeckCard({ deck, onEdit, onDelete }: DeckCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: cardCount } = useCardCount(deck.id)
  const language = getLanguageMeta(deck.language)

  function goToDetail() {
    void navigate(`/decks/${deck.id}`)
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter') goToDetail()
      }}
      className="cursor-pointer transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: deck.color }}
          aria-hidden
        />
        <div className="flex gap-1 text-muted-foreground">
          <button
            type="button"
            aria-label={`${t('common.edit')}: ${deck.name}`}
            onClick={(event) => {
              event.stopPropagation()
              onEdit()
            }}
            className="rounded p-1 hover:bg-border hover:text-foreground"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={`${t('common.delete')}: ${deck.name}`}
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
            className="rounded p-1 hover:bg-border hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      <h3 className="mt-3 font-medium">{deck.name}</h3>
      <p className="text-sm text-muted-foreground">
        {language.flag} {t(`languages.${deck.language}`)}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {t('decks.cardCount', { count: cardCount ?? 0 })} · {t('decks.neverStudied')}
      </p>
    </Card>
  )
}
