export const LANGUAGE_CODES = ['en', 'pt', 'ru', 'de', 'ja'] as const

export type LanguageCode = (typeof LANGUAGE_CODES)[number]

interface LanguageMeta {
  code: LanguageCode
  flag: string
  /** The language's name written in itself — used by selectors, never translated. */
  nativeName: string
}

/**
 * The single source of truth for "which languages does this app know about."
 * Used both by the UI language switcher (i18n display language) and the
 * deck language picker (what's being studied) — intentionally the same
 * list, since the product currently supports exactly these five for both.
 */
export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', flag: '🇺🇸', nativeName: 'English' },
  { code: 'pt', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'ru', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'de', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'ja', flag: '🇯🇵', nativeName: '日本語' },
]

export function getLanguageMeta(code: LanguageCode): LanguageMeta {
  return SUPPORTED_LANGUAGES.find((language) => language.code === code) ?? SUPPORTED_LANGUAGES[0]!
}
