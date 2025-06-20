// frontend/src/features/Chat/InitialFlow.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrder } from '../../context/OrderContext';
import styles from './InitialFlow.module.css';

// --- FUNCIONES HELPER ---
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

// --- COMPONENTE PRINCIPAL ---
const InitialFlow = ({ config, onSelection }) => {
  const { i18n } = useTranslation();
  const { toggleDishSelection } = useOrder();
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
    } else if (option.type === 'send_message' && option.dishId) {
      toggleDishSelection(option.dishId);
      const translatedMessage = getTranslatedText(option.label);
      onSelection(translatedMessage, config);
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

  // Renderiza los botones con la lógica de estilo condicional
  const renderOptions = (options) => {
    const colorClasses = [styles.color1, styles.color2, styles.color3, styles.color4, styles.color5];
    let categoryIndex = -1; // Usamos un contador separado para los colores de las categorías

    return options.map((option) => {
      const isCategory = option.type === 'category';
      const showIcon = isMainView && isCategory;
      let buttonClass;

      // --- CAMBIO CLAVE: Aplicar colores solo a las categorías ---
      if (isCategory) {
        categoryIndex++; // Incrementar solo para categorías
        const colorClass = colorClasses[categoryIndex % colorClasses.length];
        buttonClass = `${styles.flowButtonCategory} ${colorClass}`;
      } else {
        // Para las bebidas, se usa la clase de producto (gris)
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