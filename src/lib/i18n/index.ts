import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { LANGUAGE_CODES } from '@/lib/languages'
import en from './locales/en.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'
import de from './locales/de.json'
import ja from './locales/ja.json'

export const LANGUAGE_STORAGE_KEY = 'flashcards:language'

void i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      ru: { translation: ru },
      de: { translation: de },
      ja: { translation: ja },
    },
    supportedLngs: LANGUAGE_CODES,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
    interpolation: {
      // React already escapes interpolated values when rendering.
      escapeValue: false,
    },
  })

export default i18next
