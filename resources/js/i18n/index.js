import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import translations from './locales'

const i18nConfig = {
  supportedLngs: ['it', 'en'],
  resources: translations,
  fallbackLng: 'en',
  defaultNS: 'translations',
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig)

export default i18n
