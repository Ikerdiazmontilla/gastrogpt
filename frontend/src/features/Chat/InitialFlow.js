// frontend/src/features/Chat/InitialFlow.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// La importación de useOrder ha sido eliminada
import styles from './InitialFlow.module.css';

// Funciones helper para obtener iconos y datos de vistas
const getIconForOption = (optionLabelEn) => {
  const label = (optionLabelEn || '').toLowerCase();
  if (label.includes('soft drinks')) return '🥤';
  if (label.includes('wines')) return '🍷';
  if (label.includes('beer')) return '🍺';
  if (label.includes('water')) return '💧';
  if (label.includes('juice')) return '🍍';
  return '-';
};

// Función para encontrar datos de una vista (categoría) por su ID (label en inglés)
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
  // toggleDishSelection ha sido eliminado
  const currentLanguage = i18n.language;
  
  // viewState controla la navegación entre categorías/subcategorías del flujo inicial
  // currentViewId: 'main' para la vista principal, o el 'label.en' de una categoría para las sub-vistas
  // history: un array de IDs de vistas para permitir la navegación hacia atrás
  const [viewState, setViewState] = useState({ currentViewId: 'main', history: [] });

  // Si la configuración no existe o no está habilitada, no renderizar nada
  if (!config || !config.enabled) return null;

  // Función para obtener el texto traducido de un objeto multilingüe
  const getTranslatedText = (textObject) => {
    return textObject?.[currentLanguage] || textObject?.en || textObject?.es || '';
  };

  // Maneja el clic en una opción del flujo inicial
  const handleOptionClick = (option) => {
    if (option.type === 'category') {
      // Si es una categoría, actualiza el estado para mostrar la sub-vista
      setViewState(prev => ({
        history: [...prev.history, prev.currentViewId], // Guarda la vista actual en el historial
        currentViewId: option.label.en, // Establece la nueva vista
      }));
    } else if (option.type === 'send_message') { // Si es un mensaje a enviar (plato final, etc.)
      // La lógica de `toggleDishSelection` para el pedido ha sido eliminada.
      const translatedMessage = getTranslatedText(option.label); // Obtiene el texto traducido de la opción
      onSelection(translatedMessage, config); // Llama al callback para enviar el mensaje al chat
    }
  };

  // Maneja el clic en el botón de "atrás"
  const handleBackClick = () => {
    setViewState(prev => {
      const newHistory = [...prev.history];
      const previousViewId = newHistory.pop(); // Quita la última vista del historial
      return {
        history: newHistory,
        currentViewId: previousViewId || 'main', // Vuelve a la vista anterior o a la principal
      };
    });
  };

  // Determina si la vista actual es la principal
  const isMainView = viewState.currentViewId === 'main';

  // Renderiza los botones con la lógica de estilo condicional
  const renderOptions = (options) => {
    // Clases de color predefinidas para las categorías
    const colorClasses = [styles.color1, styles.color2, styles.color3, styles.color4, styles.color5];
    let categoryIndex = -1; // Contador para asignar colores secuencialmente a las categorías

    return options.map((option) => {
      const isCategory = option.type === 'category';
      // Muestra el icono solo para categorías en la vista principal
      const showIcon = isMainView && isCategory;
      let buttonClass;

      // Asigna clases de estilo diferentes para categorías y productos/bebidas
      if (isCategory) {
        categoryIndex++; // Incrementa el contador solo para categorías
        const colorClass = colorClasses[categoryIndex % colorClasses.length]; // Cicla a través de los colores
        buttonClass = `${styles.flowButtonCategory} ${colorClass}`;
      } else {
        // Para los elementos que son productos/bebidas finales
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
  
  // Determina los datos y opciones a renderizar en la vista actual
  const currentViewData = isMainView ? null : findViewData(viewState.currentViewId, config);
  const title = isMainView ? getTranslatedText(config.question) : (currentViewData ? getTranslatedText(currentViewData.label) : '');
  const optionsToRender = isMainView ? config.options : (currentViewData ? currentViewData.sub_options : []);

  return (
    <div className={`${styles.message} ${styles.bot}`}>
      <div className={styles.flowContentWrapper}>
        <div className={styles.headerContainer}>
          {/* Muestra el botón de atrás si no estamos en la vista principal */}
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