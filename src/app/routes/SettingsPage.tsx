import { useTranslation } from 'react-i18next'
import { Select } from '@/components/Select'
import { SUPPORTED_LANGUAGES } from '@/lib/languages'

export function SettingsPage() {
  const { t, i18n } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>

      <div className="mt-6 max-w-xs">
        <Select
          label={t('settings.language')}
          value={i18n.language}
          onChange={(event) => void i18n.changeLanguage(event.target.value)}
        >
          {SUPPORTED_LANGUAGES.map((language) => (
            <option key={language.code} value={language.code}>
              {language.flag} {language.nativeName}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('settings.languageDescription')}</p>
      </div>
    </div>
  )
}
