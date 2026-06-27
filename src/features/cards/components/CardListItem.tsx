import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Card } from '../types'

interface CardListItemProps {
  card: Card
  onEdit: () => void
  onDelete: () => void
}

export function CardListItem({ card, onEdit, onDelete }: CardListItemProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-4 rounded-md px-3 py-3 transition-colors hover:bg-muted">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{card.front}</p>
        <p className="truncate text-sm text-muted-foreground">{card.back}</p>
      </div>
      <div className="flex shrink-0 gap-1 text-muted-foreground">
        <button
          type="button"
          aria-label={`${t('common.edit')}: ${card.front}`}
          onClick={onEdit}
          className="rounded p-1.5 hover:bg-border hover:text-foreground"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`${t('common.delete')}: ${card.front}`}
          onClick={onDelete}
          className="rounded p-1.5 hover:bg-border hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
