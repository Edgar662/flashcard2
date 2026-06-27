import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/Dialog'
import { Button } from '@/components/Button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel: string
  isDestructive?: boolean
  onConfirm: () => void
}

/** Reusable Confirm/Cancel dialog — used for deck and card deletion. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isDestructive,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
          {t('common.cancel')}
        </Button>
        <Button
          type="button"
          variant={isDestructive ? 'destructive' : 'primary'}
          onClick={() => {
            onConfirm()
            onOpenChange(false)
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
