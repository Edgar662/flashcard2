import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDeck } from '@/features/decks/hooks/useDeck'
import { CardList } from '@/features/cards/components/CardList'
import { getLanguageMeta } from '@/lib/languages'

/**
 * Deck detail screen: deck header plus the full Cards CRUD list. No
 * studying yet (docs/13-roadmap.md Phase 1) — that's a later module.
 */
export function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const { data: deck, isLoading } = useDeck(deckId)
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        {t('common.loading')}
      </div>
    )
  }

  if (!deck) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">{t('notFound.title')}</p>
        <Link to="/decks" className="text-primary underline">
          {t('decks.backToDecks')}
        </Link>
      </div>
    )
  }

  const language = getLanguageMeta(deck.language)

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to="/decks" className="text-sm text-muted-foreground hover:underline">
        ← {t('decks.backToDecks')}
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <span
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: deck.color }}
          aria-hidden
        />
        <h1 className="text-2xl font-semibold">{deck.name}</h1>
      </div>
      <p className="mt-1 text-muted-foreground">
        {language.flag} {t(`languages.${deck.language}`)}
      </p>

      <div className="mt-8">
        <CardList deckId={deck.id} language={deck.language} />
      </div>
    </div>
  )
}
