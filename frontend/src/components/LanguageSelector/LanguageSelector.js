// frontend/src/components/LanguageSelector/LanguageSelector.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSelector.module.css';

// Datos de los idiomas soportados
const supportedLanguages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

/**
 * Un componente a pantalla completa para que el usuario seleccione su idioma
 * cuando no se puede detectar automáticamente o no está soportado.
 */
const LanguageSelector = ({ onLanguageSelect }) => {
  const { i18n } = useTranslation();

  const handleSelectLanguage = (langCode) => {
    i18n.changeLanguage(langCode); // Cambia el idioma y lo guarda en localStorage
    onLanguageSelect();           // Notifica al componente App para que oculte este selector
  };

  return (
    <div className='fullscreen-overlay'>
      <div className={styles.selectorBox}>
        <h2 className={styles.title}>
          Select your language
          <span className={styles.separator}>/</span>
          Selecciona tu idioma
        </h2>
        <div className={styles.optionsContainer}>
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              className={styles.languageButton}
              onClick={() => handleSelectLanguage(lang.code)}
            >
              <span className={styles.flag}>{lang.flag}</span>
              <span className={styles.name}>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;