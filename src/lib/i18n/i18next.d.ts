import 'i18next'
import type en from './locales/en.json'

// Type-checks every `t('...')` call against the English resource shape —
// every other locale file is expected to provide the same keys.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof en
    }
  }
}
