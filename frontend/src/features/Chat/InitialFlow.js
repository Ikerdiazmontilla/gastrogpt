// frontend/src/features/Chat/InitialFlow.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './InitialFlow.module.css';

const getIconForOption = (optionLabelEn) => {
  const label = optionLabelEn.toLowerCase();
  if (label.includes('soft drinks')) return '🥤';
  if (label.includes('alcohols')) return '🍸';
  if (label.includes('wines')) return '🍷';
  if (label.includes('water')) return '💧';
  if (label.includes('sangria')) return '🍹';
  if (label.includes('beer')) return '🍺';
  if (label.includes('cocktails')) return '🧉';
  if (label.includes('juice')) return '🍍';
  return '-';
};

// Función recursiva para encontrar una vista por su ID en el árbol de configuración
const findViewData = (viewId, config) => {
  const search = (options) => {
    for (const option of options) {
      if (option.type === 'category' && option.label.en === viewId) {
        return option; // Encontrado
      }
      if (option.type === 'category' && option.sub_options) {
        const found = search(option.sub_options);
        if (found) return found; // Propagar el resultado
      }
    }
    return null; // No encontrado en esta rama
  };
  return search(config.options);
};


const InitialFlow = ({ config, onSelection }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  // El estado ahora maneja la vista actual y un historial para la navegación "Atrás"
  const [viewState, setViewState] = useState({ currentViewId: 'main', history: [] });

  if (!config || !config.enabled) return null;

  const getTranslatedText = (textObject) => {
    return textObject?.[currentLanguage] || textObject?.en || textObject?.es || '';
  };

  const handleOptionClick = (option) => {
    if (option.type === 'category') {
      // Navega a una nueva vista
      setViewState(prev => ({
        history: [...prev.history, prev.currentViewId], // Guarda la vista actual en el historial
        currentViewId: option.label.en, // La nueva vista es el ID de la opción
      }));
    } else if (option.type === 'send_message') {
      // ***** CAMBIO CLAVE AQUÍ *****
      // En lugar de enviar `option.message_text`, enviamos el texto de la etiqueta traducido.
      // Esto asegura que el mensaje enviado al bot esté en el idioma del usuario.
      const translatedMessage = getTranslatedText(option.label);
      onSelection(translatedMessage, config);
    }
  };

  const handleBackClick = () => {
    // Vuelve a la vista anterior
    setViewState(prev => {
      const newHistory = [...prev.history];
      const previousViewId = newHistory.pop(); // Saca el último elemento del historial
      return {
        history: newHistory,
        currentViewId: previousViewId,
      };
    });
  };

  const renderOptions = (options) => {
    const colorClasses = [styles.color1, styles.color2, styles.color3, styles.color4, styles.color5];
    return options.map((option, index) => (
      <button
        key={getTranslatedText(option.label)}
        className={`${styles.flowButton} ${colorClasses[index % colorClasses.length]}`}
        onClick={() => handleOptionClick(option)}
      >
        <span className={styles.flowButtonIcon}>
          {getIconForOption(option.label.en)}
        </span>
        <span className={styles.flowButtonText}>{getTranslatedText(option.label)}</span>
      </button>
    ));
  };
  
  // Determina qué mostrar basado en el estado actual
  const isMainView = viewState.currentViewId === 'main';
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