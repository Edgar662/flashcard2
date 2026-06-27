import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import { useDecks } from '@/features/decks/hooks/useDecks'
import { useTotalCardCount } from '@/features/cards/hooks/useTotalCardCount'

/** Light dashboard — aggregate stats only, computed from already-available data. */
export function HomePage() {
  const { t } = useTranslation()
  const { data: decks } = useDecks()
  const { data: totalCards } = useTotalCardCount()

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">{t('home.welcomeBack')}</h1>
      <p className="mt-1 text-muted-foreground">{t('home.overview')}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-muted-foreground">{t('nav.decks')}</p>
          <p className="mt-1 text-2xl font-semibold">
            {t('home.totalDecks', { count: decks?.length ?? 0 })}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">{t('cards.title')}</p>
          <p className="mt-1 text-2xl font-semibold">
            {t('home.totalCards', { count: totalCards ?? 0 })}
          </p>
        </Card>
      </div>

      <Link
        to="/decks"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
      >
        {t('home.goToDecks')}
      </Link>
    </div>
  )
}
