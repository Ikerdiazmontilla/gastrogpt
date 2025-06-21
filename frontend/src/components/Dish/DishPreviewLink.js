// frontend/src/components/Dish/DishPreviewLink.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DishPreviewLink.module.css';
import { getTranslatedDishText } from '../../utils/menuUtils';

// Función para obtener un emoji representativo de la categoría
const getEmojiForCategory = (categoryKey) => {
  switch (categoryKey) {
    case 'bebidas': return '🍹';
    case 'entrantes': return '🥗';
    case 'platos_principales': return '🍲';
    case 'postres': return '🍰';
    default: return '🍽️';
  }
};

// Se eliminan las props `isSelected` y `onToggleSelect`
const DishPreviewLink = ({ dish, onViewDetails, currentLanguage, menuHasImages }) => {
  const { t } = useTranslation();
  const dishName = getTranslatedDishText(dish.nombre, currentLanguage);
  // Texto accesible para lectores de pantalla
  const accessibleLabel = t('chat.viewDetailsFor', { dishName: dishName });

  const showImage = menuHasImages && dish.imagen;
  const categoryEmoji = getEmojiForCategory(dish.parentCategoryKey);

  return (
    // buttonWrapper actúa como el botón clickeable para ver detalles.
    // La clase 'selected' ha sido eliminada ya que no hay seguimiento de pedidos.
    <div 
      className={styles.buttonWrapper} 
      onClick={onViewDetails} // Llama a onViewDetails al hacer clic
      aria-label={accessibleLabel} // Proporciona una etiqueta accesible
      role="button" // Define el rol como botón para accesibilidad
      tabIndex="0" // Hace que el div sea enfocable
    >
      <div className={`${styles.card} ${!showImage ? styles.textOnlyLayout : ''}`}>
        {showImage ? (
          // Muestra la imagen si está disponible
          <>
            <img src={dish.imagen} alt={dishName} className={styles.dishImage} />
            <span className={styles.dishTitle}>{dishName}</span>
          </>
        ) : (
          // Si no hay imagen, muestra un emoji de categoría y el título
          <>
            <span className={styles.categoryEmoji}>{categoryEmoji}</span>
            <span className={styles.dishTitle}>{dishName}</span>
          </>
        )}
      </div>

      {/* El botón de añadir/tick ha sido eliminado */}
    </div>
  );
};

export default DishPreviewLink;