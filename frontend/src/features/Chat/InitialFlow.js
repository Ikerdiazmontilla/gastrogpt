// frontend/src/features/Chat/InitialFlow.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../context/TenantContext'; 
import { transformMenuForLanguage } from '../../utils/menuTransformer'; 
import styles from './InitialFlow.module.css';

// ... (funciones getIconForOption y findViewData sin cambios)
const getIconForOption = (optionLabelEn) => {
  const label = (optionLabelEn || '').toLowerCase();
  if (label.includes('soft drinks')) return '🥤';
  if (label.includes('wines')) return '🍷';
  if (label.includes('beer')) return '🍺';
  if (label.includes('water')) return '💧';
  if (label.includes('juice')) return '🍍';
  return '-';
};

const findViewData = (viewId, config) => {
  const search = (options) => {
    for (const option of options) {
      if (option.type === 'category' && option.label.en === viewId) return option;
      if (option.type === 'category' && option.sub_options) {
        const found = search(option.sub_options);
        if (found) return found;
      }
    }
    return null;
  };
  return search(config.options);
};


// Componente principal
const InitialFlow = ({ config, onSelection }) => {
  const { i18n } = useTranslation();
  const { tenantConfig } = useTenant();
  const currentLanguage = i18n.language;
  
  const [viewState, setViewState] = useState({ currentViewId: 'main', history: [] });

  if (!config || !config.enabled) return null;

  const getTranslatedText = (textObject) => {
    return textObject?.[currentLanguage] || textObject?.en || textObject?.es || '';
  };

  const handleOptionClick = (option) => {
    if (option.type === 'category') {
      setViewState(prev => ({
        history: [...prev.history, prev.currentViewId],
        currentViewId: option.label.en,
      }));
    } else if (option.type === 'send_message') {
      const translatedMessage = getTranslatedText(option.label);
      
      const translatedMenu = transformMenuForLanguage(tenantConfig.menu, currentLanguage);
      
      // --- MODIFICACIÓN CLAVE ---
      // Se añade la bandera `initialFlowClick: true` al payload.
      const extraPayload = { 
        language: currentLanguage, 
        menu: translatedMenu,
        initialFlowClick: true // Indicador de que la interacción vino del flujo inicial.
      };

      console.log('[InitialFlow] Enviando selección con payload extra (incluye initialFlowClick):', extraPayload);

      onSelection(translatedMessage, config, extraPayload);
    }
  };

  const handleBackClick = () => {
    setViewState(prev => {
      const newHistory = [...prev.history];
      const previousViewId = newHistory.pop();
      return {
        history: newHistory,
        currentViewId: previousViewId || 'main',
      };
    });
  };

  const isMainView = viewState.currentViewId === 'main';

  const renderOptions = (options) => {
    const colorClasses = [styles.color1, styles.color2, styles.color3, styles.color4, styles.color5];
    let categoryIndex = -1;

    return options.map((option) => {
      const isCategory = option.type === 'category';
      const showIcon = isMainView && isCategory;
      let buttonClass;

      if (isCategory) {
        categoryIndex++;
        const colorClass = colorClasses[categoryIndex % colorClasses.length];
        buttonClass = `${styles.flowButtonCategory} ${colorClass}`;
      } else {
        buttonClass = styles.flowButtonProduct;
      }

      return (
        <button
          key={getTranslatedText(option.label)}
          className={buttonClass}
          onClick={() => handleOptionClick(option)}
        >
          {showIcon && (
            <span className={styles.flowButtonIcon}>
              {getIconForOption(option.label.en)}
            </span>
          )}
          <span className={styles.flowButtonText}>{getTranslatedText(option.label)}</span>
        </button>
      );
    });
  };
  
  const currentViewData = isMainView ? null : findViewData(viewState.currentViewId, config);
  const title = isMainView ? getTranslatedText(config.question) : (currentViewData ? getTranslatedText(currentViewData.label) : '');
  const optionsToRender = isMainView ? config.options : (currentViewData ? currentViewData.sub_options : []);

  return (
    <div className={`${styles.message} ${styles.bot}`}>
      <div className={styles.flowContentWrapper}>
        <div className={styles.headerContainer}>
          {!isMainView && (
            <button className={styles.backButton} onClick={handleBackClick}>
              ←
            </button>
          )}
          <h3 className={styles.flowTitle}>{title}</h3>
        </div>
        <div className={styles.flowOptionsGrid}>
          {renderOptions(optionsToRender)}
        </div>
      </div>
    </div>
  );
};

export default InitialFlow;