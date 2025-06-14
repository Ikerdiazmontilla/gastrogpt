import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './translations/en/translation.json';
import translationES from './translations/es/translation.json';
import translationFR from './translations/fr/translation.json';
import translationDE from './translations/de/translation.json';

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
  fr: { translation: translationFR },
  de: { translation: translationDE },
};

const SUPPORTED_LANGS = ['es', 'en', 'fr', 'de'];
const I18N_STORAGE_KEY = 'i18nextLng';

/**
 * Determina el idioma inicial de la aplicación.
 * 1. Comprueba si hay una preferencia guardada en localStorage.
 * 2. Si no, comprueba los idiomas del navegador.
 * 3. Si ninguno es compatible, devuelve null para indicar que se debe preguntar al usuario.
 * @returns {string|null} El código de idioma compatible o null.
 */
const getInitialLanguage = () => {
  // 1. Comprobar localStorage
  try {
    const storedLang = localStorage.getItem(I18N_STORAGE_KEY);
    if (storedLang && SUPPORTED_LANGS.includes(storedLang)) {
      return storedLang;
    }
  } catch (e) {
    console.warn("Could not access localStorage. Language preference will not be read.", e);
  }

  // 2. Comprobar idiomas del navegador
  if (navigator.languages && navigator.languages.length > 0) {
    for (const lang of navigator.languages) {
      const primaryCode = lang.split('-')[0]; // 'en-US' -> 'en'
      if (SUPPORTED_LANGS.includes(primaryCode)) {
        return primaryCode;
      }
    }
  }

  // 3. Si no se encuentra ningún idioma compatible
  return null;
};


export const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage || 'es', // Proporciona un idioma de inicio seguro a i18next
    fallbackLng: 'es', // Un respaldo final por si algo sale mal
    supportedLngs: SUPPORTED_LANGS,
    interpolation: {
      escapeValue: false,
    },
    // La detección se hace manualmente ahora, pero configuramos `caches` para que
    // i18n.changeLanguage() siga guardando la elección del usuario en localStorage.
    detection: {
      caches: ['localStorage'],
      lookupLocalStorage: I18N_STORAGE_KEY,
    }
  });

export default i18n;