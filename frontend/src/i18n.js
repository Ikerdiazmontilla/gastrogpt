import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// REFACTORIZACIÓN: Se cambia la ruta de './locales/...' a './translations/...'
import translationEN from './translations/en/translation.json';
import translationES from './translations/es/translation.json';
import translationFR from './translations/fr/translation.json';
import translationDE from './translations/de/translation.json';

// los recursos de traducción
const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  },
  fr: {
    translation: translationFR
  },
  de: {
    translation: translationDE
  }
};

i18n
  .use(LanguageDetector) // Detecta el idioma del usuario
  .use(initReactI18next) // Pasa i18n a react-i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma de respaldo si el detectado no está disponible
    supportedLngs: ['es', 'en', 'fr', 'de'],
    interpolation: {
      escapeValue: false // React ya escapa los valores, por lo que no es necesario
    },
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['cookie'],
    }
  });

export default i18n;