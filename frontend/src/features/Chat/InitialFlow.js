// frontend/src/features/Chat/InitialFlow.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './InitialFlow.module.css';

// Este componente ahora renderiza el prompt interactivo DENTRO del historial de chat
const InitialFlow = ({ config, onSelection }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  const [currentView, setCurrentView] = useState('main');

  if (!config || !config.enabled) {
    return null;
  }

  const getTranslatedText = (textObject) => {
    return textObject?.[currentLanguage] || textObject?.en || textObject?.es || '';
  };

  const handleOptionClick = (option) => {
    if (option.type === 'category') {
      setCurrentView(option.label.en); // Usamos 'en' como ID único de la vista
    } else if (option.type === 'send_message') {
      onSelection(option.message_text);
    }
  };

  const renderOptions = (options) => {
    const colorClasses = [styles.color1, styles.color2, styles.color3, styles.color4, styles.color5];
    return options.map((option, index) => (
      <button
        key={getTranslatedText(option.label)}
        className={`${styles.flowButton} ${colorClasses[index % colorClasses.length]}`}
        onClick={() => handleOptionClick(option)}
      >
        {getTranslatedText(option.label)}
      </button>
    ));
  };
  
  const currentCategory = config.options.find(opt => opt.type === 'category' && opt.label.en === currentView);
  const mainTitle = getTranslatedText(config.question);
  const subTitle = currentCategory ? getTranslatedText(currentCategory.label) : '';

  return (
    // Se renderiza como una burbuja de bot
    <div className={`${styles.message} ${styles.bot}`}>
      {currentView === 'main' ? (
        <div className={styles.flowContentWrapper}>
          <h3 className={styles.flowTitle}>{mainTitle}</h3>
          <div className={styles.flowOptions}>
            {renderOptions(config.options)}
          </div>
        </div>
      ) : (
        <div className={styles.flowContentWrapper}>
          <div className={styles.subViewHeader}>
            <button className={styles.backButton} onClick={() => setCurrentView('main')}>
              ← Volver
            </button>
            <h3 className={styles.flowTitle}>{subTitle}</h3>
          </div>
          <div className={styles.flowOptions}>
            {currentCategory && renderOptions(currentCategory.sub_options)}
          </div>
        </div>
      )}
    </div>
  );
};

export default InitialFlow;