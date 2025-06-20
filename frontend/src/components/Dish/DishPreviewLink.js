// frontend/src/components/Dish/DishPreviewLink.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DishPreviewLink.module.css';
import { getTranslatedDishText } from '../../utils/menuUtils';

const getEmojiForCategory = (categoryKey) => {
  // ... (sin cambios)
  switch (categoryKey) {
    case 'bebidas': return '🍹';
    case 'entrantes': return '🥗';
    case 'platos_principales': return '🍲';
    case 'postres': return '🍰';
    default: return '🍽️';
  }
};

const DishPreviewLink = ({ dish, onViewDetails, currentLanguage, menuHasImages, isSelected, onToggleSelect }) => {
  const { t } = useTranslation();
  const dishName = getTranslatedDishText(dish.nombre, currentLanguage);
  const accessibleLabel = t('chat.viewDetailsFor', { dishName: dishName });

  const showImage = menuHasImages && dish.imagen;
  const categoryEmoji = getEmojiForCategory(dish.parentCategoryKey);

  // Detiene la propagación del evento para el botón de añadir
  const handleAddClick = (event) => {
    event.stopPropagation();
    onToggleSelect(dish.id);
  };

  return (
    // Se ha cambiado la etiqueta a `div` para que `stopPropagation` funcione correctamente
    // y para aplicar position: relative. El `onClick` se mueve aquí.
    <div 
      className={`${styles.buttonWrapper} ${isSelected ? styles.selected : ''}`} 
      onClick={onViewDetails} 
      aria-label={accessibleLabel}
      role="button"
      tabIndex="0"
    >
      <div className={`${styles.card} ${!showImage ? styles.textOnlyLayout : ''}`}>
        {showImage ? (
          <>
            <img src={dish.imagen} alt={dishName} className={styles.dishImage} />
            <span className={styles.dishTitle}>{dishName}</span>
          </>
        ) : (
          <>
            <span className={styles.categoryEmoji}>{categoryEmoji}</span>
            <span className={styles.dishTitle}>{dishName}</span>
          </>
        )}
      </div>

      {/* Botón de añadir/tick. Siempre presente para la lógica de selección. */}
      <button 
        className={`${styles.addButton} ${isSelected ? styles.added : ''}`} 
        onClick={handleAddClick}
        aria-label={`Añadir ${dishName} al pedido`}
      >
        <span className={styles.addIcon}>+</span>
        <span className={styles.addedIcon}>✓</span>
      </button>
    </div>
  );
};

export default DishPreviewLink;